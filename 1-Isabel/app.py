import os
import json
import base64
import uuid
from datetime import datetime
from flask import Flask, request, jsonify, render_template_string, send_from_directory
from flask_cors import CORS
import openai
from PIL import Image
import io
import tempfile

app = Flask(__name__)
CORS(app)

app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size
UPLOAD_FOLDER = 'uploads'
MEMORIES_DB = 'memories_database.json'

# Crear directorios
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs('static', exist_ok=True)

# API key
openai.api_key = os.getenv('OPENAI_API_KEY', '-')

class CognitiveMemoryPlatform:
    def __init__(self):
        self.memories_file = MEMORIES_DB
        self.load_memories()
    
    def load_memories(self):
        """Carga la base de datos de memorias desde JSON"""
        try:
            with open(self.memories_file, 'r', encoding='utf-8') as f:
                self.memories = json.load(f)
        except FileNotFoundError:
            print("Archivo de base de datos no encontrado. Creando uno nuevo...")
            self.memories = {
                "database_info": {
                    "version": "1.0",
                    "created": datetime.now().isoformat(),
                    "total_memories": 0
                },
                "memories": []
            }
            self.save_memories()
        except json.JSONDecodeError:
            print("Error al decodificar el archivo de base de datos. Creando uno nuevo...")
            self.memories = {
                "database_info": {
                    "version": "1.0",
                    "created": datetime.now().isoformat(),
                    "total_memories": 0
                },
                "memories": []
            }
            self.save_memories()
    
    def save_memories(self):
        """Guarda la base de datos de memorias en JSON"""
        self.memories["database_info"]["last_updated"] = datetime.now().isoformat()
        self.memories["database_info"]["total_memories"] = len(self.memories["memories"])
        
        with open(self.memories_file, 'w', encoding='utf-8') as f:
            json.dump(self.memories, f, ensure_ascii=False, indent=2)
    
    def process_image_with_ai(self, image_base64, user_description):
        """Procesa imagen con OpenAI Vision"""
        try:
            response = openai.chat.completions.create(
                model="gpt-4-turbo",
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "text",
                                "text": f"""Analiza esta imagen familiar para terapia de reminiscencia cognitiva.

Descripción del usuario: {user_description}

Proporciona un análisis JSON con:
1. 'visual_description': Descripción visual detallada de la escena y las personas.
2. 'detected_people': Un array de strings con los nombres o descripciones de las personas (ej: ["abuela María", "nieto Carlos"]).
3. 'context_objects': Un array de strings con objetos y elementos de contexto importantes.
4. 'time_indicators': Pistas sobre la época o la fecha (ej: "parece de los años 90").
5. 'emotional_context': El ambiente emocional general (ej: "alegre", "nostálgico").

Responde SOLO en JSON válido."""
                            },
                            {
                                "type": "image_url",
                                "image_url": f"data:image/jpeg;base64,{image_base64}"
                            }
                        ]
                    }
                ],
                max_tokens=800,
                response_format={"type": "json_object"}
            )
            
            response_text = response.choices[0].message.content
            
            try:
                return json.loads(response_text)
            except json.JSONDecodeError as e:
                print(f"Error al decodificar JSON de OpenAI: {e}")
                print(f"Respuesta recibida: {response_text}")
                return {
                    "error": "No se pudo decodificar la respuesta del análisis de IA.",
                    "visual_description": "Análisis de IA no disponible.",
                    "ai_note": "La respuesta de la IA no era un JSON válido."
                }
                
        except Exception as e:
            error_message = str(e)
            print(f"Error en la API de OpenAI: {error_message}")
            return {
                "error": f"Error en análisis de IA: {error_message}",
                "visual_description": "Imagen familiar no procesada debido a un error.",
                "ai_note": "No se pudo conectar con el servicio de análisis de OpenAI."
            }
    
    def determine_next_exercise_strategy(self):
        """
        Analiza el rendimiento global del usuario para decidir una estrategia adaptativa.
        Tiene en cuenta la precisión y el uso de pistas para identificar áreas de dificultad.
        Asegura que al menos un tipo de ejercicio siempre esté disponible.
        """
        performance_data = load_user_performance()
        
        if not performance_data.get('adaptive_learning_enabled', True):
            print("Estrategia: Aprendizaje adaptativo desactivado.")
            return {"type": "general", "difficulty": "media", "exclude_types": []}

        if performance_data.get('global_performance', {}).get('total_attempted', 0) < 5:
            print("Estrategia: 'Arranque en frío', se necesitan más datos.")
            return {"type": "general", "difficulty": "media", "exclude_types": []}

        all_types = ["reconocimiento", "completar_frase", "orden_cronologico", "emocional", "asociativo"]
        underperforming_types = {}
        ACCURACY_THRESHOLD = 0.7 
        MIN_ATTEMPTS = 3
        HINT_PENALTY_FACTOR = 0.25 # Penalización del 25% a la precisión por cada pista usada por intento

        for ex_type, stats in performance_data.get('performance_by_type', {}).items():
            total_attempted = stats.get('total_attempted', 0)
            if total_attempted >= MIN_ATTEMPTS:
                accuracy = stats.get('total_correct', 0) / total_attempted
                
                # Penalizar la precisión basada en el uso de pistas
                hints_per_attempt = stats.get('total_hints_used', 0) / total_attempted
                effective_accuracy = accuracy - (hints_per_attempt * HINT_PENALTY_FACTOR)

                if effective_accuracy < ACCURACY_THRESHOLD:
                    underperforming_types[ex_type.lower()] = effective_accuracy
        
        types_to_exclude = []
        
        # si todos los tipos tienen bajo rendimiento
        if len(underperforming_types) >= len(all_types):
            if not underperforming_types:
                return {"type": "general", "difficulty": "media", "exclude_types": []}

            best_of_the_worst = max(underperforming_types, key=underperforming_types.get)
            print(f"Estrategia: Rendimiento bajo en todas las áreas. Reforzando el área menos débil: '{best_of_the_worst}'.")
            
            types_to_exclude = [t for t in all_types if t != best_of_the_worst]
        
        elif underperforming_types:
            types_to_exclude = list(underperforming_types.keys())
            print(f"Estrategia: Evitando los tipos con bajo rendimiento (considerando pistas): {types_to_exclude}")
        
        else:
            print("Estrategia: Rendimiento global bueno. Generando ejercicios variados.")
            return {"type": "general", "difficulty": "media", "exclude_types": []}

        return {"type": "general", "difficulty": "media", "exclude_types": types_to_exclude}

    def generate_cognitive_exercises(self, memory_data, strategy=None, exclude_types=None):
        """
        Genera ejercicios cognitivos personalizados basados en una estrategia,
        con la opción de excluir ciertos tipos de ejercicios.
        """
        
        all_types = ["reconocimiento", "completar_frase", "orden_cronologico", "emocional", "asociativo"]
        
        if strategy is None or strategy.get("type") == "general":
            available_types = [t for t in all_types if t not in (exclude_types or [])]
            if not available_types:
                available_types = all_types # Si se excluyen todos, usar todos

            exercise_type_prompt = f"un tipo de ejercicio variado (elige uno entre: {', '.join(available_types)})"
            difficulty_prompt = strategy.get("difficulty", "media") if strategy else "media"
        else:
            exercise_type_prompt = f"el tipo de ejercicio '{strategy.get('type')}'"
            difficulty_prompt = strategy.get('difficulty', 'media')

        prompt = f"""
Crea 1 ejercicio terapéutico de estimulación cognitiva basado en esta memoria:

Título: {memory_data.get('title', 'Sin título')}
Descripción: {memory_data.get('user_description', '')}
Análisis IA: {json.dumps(memory_data.get('ai_analysis', {}), ensure_ascii=False)}

REQUISITOS DEL EJERCICIO:
- TIPO: {exercise_type_prompt}
- DIFICULTAD: {difficulty_prompt}
- RESTRICCIÓN: No generes un ejercicio de un tipo que ya se ha usado si hay otras opciones.

FORMATO JSON EXACTO:
Responde con un array JSON que contenga 1 único ejercicio dentro de un objeto 'exercises'.

- Para opción múltiple ('reconocimiento', 'emocional', 'asociativo'):
  "options" es un array de strings, "correct_answer" es el índice de la respuesta correcta.
  {{
    "type": "reconocimiento",
    "question": "¿Quién aparece en la foto?",
    "options": ["Familia", "Amigos", "Desconocidos"],
    "correct_answer": 0,
    "hint": "...", "difficulty": "fácil"
  }}

- Para completar la frase ('completar_frase'):
  "question" contiene la frase con "______" en el lugar a completar.
  "correct_answer" es un string con la palabra o frase correcta.
  {{
    "type": "completar_frase",
    "question": "En la imagen, la abuela lleva un vestido de color ______.",
    "correct_answer": "azul",
    "hint": "...", "difficulty": "media"
  }}

- Para ordenar ('orden_cronologico'):
  "options" es un array de eventos desordenados.
  "correct_answer" es un array de los mismos strings en el orden cronológico correcto.
  {{
    "type": "orden_cronologico",
    "question": "Ordena los siguientes eventos como crees que ocurrieron:",
    "options": ["Llegada de los invitados", "Corte de la tarta", "Apertura de regalos"],
    "correct_answer": ["Llegada de los invitados", "Corte de la tarta", "Apertura de regalos"],
    "hint": "...", "difficulty": "difícil"
  }}

IMPORTANTE: Responde SOLO con el JSON solicitado, sin texto adicional.
El JSON debe estar dentro de un objeto 'exercises' que es un array.
"""
        
        try:
            response = openai.chat.completions.create(
                model="gpt-4",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=1000
            )
            
            response_text = response.choices[0].message.content
            response_text = response_text.replace('```json', '').replace('```', '').strip()
            
            try:
                exercises_data = json.loads(response_text)
                if isinstance(exercises_data, list):
                    return {"exercises": exercises_data}
                elif isinstance(exercises_data, dict) and 'exercises' not in exercises_data:
                    return {"exercises": [exercises_data]}
                elif isinstance(exercises_data, dict) and 'exercises' in exercises_data:
                    return exercises_data
                else:
                    return self.generate_fallback_exercises(memory_data)

            except json.JSONDecodeError as e:
                print(f"Error al decodificar JSON en 'generate_cognitive_exercises': {e}")
                print(f"Respuesta recibida: {response_text}")
                return self.generate_fallback_exercises(memory_data)
            
        except Exception as e:
            print(f"Error en la generación de ejercicios adaptativos: {e}")
            return self.generate_fallback_exercises(memory_data)

    def generate_fallback_exercises(self, memory_data, count=1):
        """Ejercicios de respaldo si falla la IA. Devuelve una lista de ejercicios simples."""
        
        fallback_exercise = {
            "type": "reconocimiento",
            "question": "¿Quiénes son las personas principales en esta memoria?",
            "options": ["Familia cercana", "Amigos", "Conocidos", "No estoy seguro"],
            "correct_answer": 0,
            "hint": "Piensa en las personas más importantes para ti",
            "difficulty": "fácil"
        }
        
        
        exercises = []
        for i in range(count):
            exercise = fallback_exercise.copy()
            exercise['question'] = f"({i+1}) {fallback_exercise['question']}"
            exercises.append(exercise)
            
        return {"exercises": exercises}

    def generate_initial_exercise_set(self, memory_data):
        """Genera un set inicial de 5 ejercicios variados para una nueva memoria."""
        prompt = f"""
Crea 5 ejercicios terapéuticos de estimulación cognitiva basados en esta memoria:

Título: {memory_data.get('title', 'Sin título')}
Descripción: {memory_data.get('user_description', '')}
Análisis IA: {json.dumps(memory_data.get('ai_analysis', {}), ensure_ascii=False)}

TIPOS REQUERIDOS (crea un set variado con al menos uno de cada, si es posible):
1.  RECONOCIMIENTO (opción múltiple)
2.  COMPLETAR_FRASE (rellenar hueco)
3.  ORDEN_CRONOLOGICO (ordenar eventos)
4.  EMOCIONAL (opción múltiple sobre sentimientos)
5.  ASOCIATIVO (opción múltiple sobre conexiones)

FORMATO JSON EXACTO:
Responde con un array JSON de 5 ejercicios dentro de un objeto 'exercises'.

- Para opción múltiple ('reconocimiento', 'emocional', 'asociativo'):
  "options" es un array de strings, "correct_answer" es el índice de la respuesta correcta.
  {{
    "type": "reconocimiento",
    "question": "¿Quién aparece en la foto?",
    "options": ["Familia", "Amigos", "Desconocidos"],
    "correct_answer": 0,
    "hint": "...", "difficulty": "fácil"
  }}

- Para completar la frase ('completar_frase'):
  "question" contiene la frase con "______" en el lugar a completar.
  "correct_answer" es un string con la palabra o frase correcta.
  {{
    "type": "completar_frase",
    "question": "En la imagen, la abuela lleva un vestido de color ______.",
    "correct_answer": "azul",
    "hint": "...", "difficulty": "media"
  }}

- Para ordenar ('orden_cronologico'):
  "options" es un array de eventos desordenados.
  "correct_answer" es un array de los mismos strings en el orden cronológico correcto.
  {{
    "type": "orden_cronologico",
    "question": "Ordena los siguientes eventos como crees que ocurrieron:",
    "options": ["Llegada de los invitados", "Corte de la tarta", "Apertura de regalos"],
    "correct_answer": ["Llegada de los invitados", "Corte de la tarta", "Apertura de regalos"],
    "hint": "...", "difficulty": "difícil"
  }}

IMPORTANTE: Responde SOLO con el JSON solicitado, sin texto adicional.
"""
        try:
            response = openai.chat.completions.create(
                model="gpt-4",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=1500
            )
            response_text = response.choices[0].message.content
            response_text = response_text.replace('```json', '').replace('```', '').strip()
            try:
                exercises_data = json.loads(response_text)
                if isinstance(exercises_data, list):
                    return {"exercises": exercises_data}
                elif isinstance(exercises_data, dict) and 'exercises' not in exercises_data:
                    
                    return {"exercises": [exercises_data]}
                elif isinstance(exercises_data, dict) and 'exercises' in exercises_data:
                    return exercises_data
                else:
                    return self.generate_fallback_exercises(memory_data, count=5)
            except json.JSONDecodeError as e:
                print(f"Error al decodificar JSON en 'generate_initial_exercise_set': {e}")
                print(f"Respuesta recibida: {response_text}")
                return self.generate_fallback_exercises(memory_data, count=5)
        except Exception as e:
            print(f"Error en la generación de set inicial de ejercicios: {e}")
            
            return self.generate_fallback_exercises(memory_data, count=5)

    def transcribe_audio(self, audio_file_path):
        """Transcribe audio usando OpenAI Whisper"""
        try:
            with open(audio_file_path, 'rb') as audio_file:
                transcript = openai.audio.transcriptions.create(
                    model="whisper-1",
                    file=audio_file
                )
                return transcript.text
        except Exception as e:
            return f"Error en transcripción: {str(e)}"
    
    def add_memory(self, image_file, title, description, audio_file=None):
        """Añade nueva memoria al sistema"""
        memory_id = str(uuid.uuid4())
        
        # Procesar imagen
        image_base64 = None
        if image_file:
            img = Image.open(image_file)
            # Redimensionar si es muy grande
            if img.width > 1024 or img.height > 1024:
                img.thumbnail((1024, 1024), Image.Resampling.LANCZOS)
            
            buffer = io.BytesIO()
            img.save(buffer, format='JPEG', quality=85)
            image_base64 = base64.b64encode(buffer.getvalue()).decode()
        
        # audio si existe
        transcription = ""
        if audio_file:
           
            temp_audio_path = os.path.join(UPLOAD_FOLDER, f"temp_audio_{memory_id}.wav")
            audio_file.save(temp_audio_path)
            transcription = self.transcribe_audio(temp_audio_path)
            os.remove(temp_audio_path) 
        
       
        full_description = f"{description}\n{transcription}".strip()
        
       
        memory_data = {
            "id": memory_id,
            "timestamp": datetime.now().isoformat(),
            "title": title,
            "user_description": description,
            "audio_transcription": transcription,
            "combined_description": full_description
        }
        
        # Analizar imagen 
        if image_base64:
            ai_analysis = self.process_image_with_ai(image_base64, full_description)
            memory_data["ai_analysis"] = ai_analysis
        
       
        initial_exercises_data = self.generate_initial_exercise_set(memory_data)
        memory_data["exercises"] = initial_exercises_data
        
        # Guardar imagen
        if image_base64:
            image_filename = f"image_{memory_id}.jpg"
            memory_data["image_filename"] = image_filename
        
            image_path = os.path.join(UPLOAD_FOLDER, image_filename)
            with open(image_path, 'wb') as f:
                f.write(base64.b64decode(image_base64))
        
    
        self.memories["memories"].append(memory_data)
        self.save_memories()
        
        return memory_id, memory_data

# Inicializar plataforma
platform = CognitiveMemoryPlatform()

@app.route('/')
def index():
    """Página principal"""
    return send_from_directory('.', 'index.html')

@app.route('/static/<path:filename>')
def static_files(filename):
    return send_from_directory('static', filename)

@app.route('/uploads/<path:filename>')
def uploaded_files(filename):
    return send_from_directory(UPLOAD_FOLDER, filename)

@app.route('/api/add_memory', methods=['POST'])
def add_memory():
    """API para añadir nueva memoria"""
    try:
        title = request.form.get('title', 'Sin título')
        description = request.form.get('description', '')
        image_file = request.files.get('image')
        audio_file = request.files.get('audio')
        
        if not description:
            return jsonify({"success": False, "error": "Descripción requerida"})
        
        if not image_file:
            return jsonify({"success": False, "error": "Imagen requerida"})
        
   
        memory_id, memory_data = platform.add_memory(image_file, title, description, audio_file)
        
        return jsonify({
            "success": True,
            "memory_id": memory_id,
            "exercises": memory_data.get("exercises", {"exercises": []}),
            "audio_transcription": memory_data.get("audio_transcription", ""),
            "image_filename": memory_data.get("image_filename", None),
            "message": "Memoria procesada exitosamente"
        })
        
    except Exception as e:
        return jsonify({"success": False, "error": str(e)})

@app.route('/api/transcribe', methods=['POST'])
def transcribe_audio_endpoint():
    """API para transcribir audio"""
    try:
        audio_file = request.files.get('audio')
        if not audio_file:
            return jsonify({"success": False, "error": "Archivo de audio requerido"})

    
        temp_audio_path = os.path.join(UPLOAD_FOLDER, f"temp_transcribe_{uuid.uuid4()}.wav")
        audio_file.save(temp_audio_path)
        
        # Transcribir
        transcription = platform.transcribe_audio(temp_audio_path)
        
      
        os.remove(temp_audio_path)
        
        if "Error en transcripción" in transcription:
            return jsonify({"success": False, "error": transcription})
            
        return jsonify({"success": True, "transcription": transcription})
        
    except Exception as e:
        return jsonify({"success": False, "error": str(e)})

@app.route('/api/memories')
def get_memories():
    """Obtener todas las memorias"""
    try:
        return jsonify({
            "success": True,
            "memories": platform.memories["memories"],
            "total": len(platform.memories["memories"])
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)})

@app.route('/api/memory/<memory_id>', methods=['GET', 'DELETE'])
def memory_endpoint(memory_id):
    """Obtener o eliminar una memoria específica"""
    if request.method == 'GET':
        try:
            for memory in platform.memories["memories"]:
                if memory["id"] == memory_id:
                    return jsonify({"success": True, "memory": memory})
            
            return jsonify({"success": False, "error": "Memoria no encontrada"})
        except Exception as e:
            return jsonify({"success": False, "error": str(e)})

    elif request.method == 'DELETE':
        try:
            memory_to_delete = None
            for memory in platform.memories["memories"]:
                if memory["id"] == memory_id:
                    memory_to_delete = memory
                    break
            
            if not memory_to_delete:
                return jsonify({"success": False, "error": "Memoria no encontrada"}), 404

         
            if "image_filename" in memory_to_delete and memory_to_delete["image_filename"]:
                image_path = os.path.join(UPLOAD_FOLDER, memory_to_delete["image_filename"])
                if os.path.exists(image_path):
                    os.remove(image_path)

            # Eliminar la memoria de la lista
            platform.memories["memories"].remove(memory_to_delete)
            
         
            platform.save_memories()
            
            return jsonify({"success": True, "message": "Memoria eliminada exitosamente"})

        except Exception as e:
            return jsonify({"success": False, "error": str(e)})

@app.route('/api/exercises/<memory_id>')
def get_exercises(memory_id):
    """Obtener ejercicios de una memoria"""
    try:
        for memory in platform.memories["memories"]:
            if memory["id"] == memory_id:
                return jsonify({
                    "success": True, 
                    "exercises": memory.get("exercises", {"exercises": []})
                })
        
        return jsonify({"success": False, "error": "Memoria no encontrada"})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)})

@app.route('/api/test')
def test_api():
    """Test de API"""
    return jsonify({
        "success": True,
        "message": "API funcionando correctamente",
        "timestamp": datetime.now().isoformat(),
        "total_memories": len(platform.memories["memories"])
    })


@app.route('/api/generate_exercises/<memory_id>', methods=['POST'])
def generate_new_exercises_endpoint(memory_id):
    """Genera un nuevo set de 3 ejercicios adaptativos para una memoria."""
    try:
        memory_to_update = None
        for m in platform.memories["memories"]:
            if m["id"] == memory_id:
                memory_to_update = m
                break
        
        if not memory_to_update:
            return jsonify({"success": False, "error": "Memoria no encontrada"}), 404

        new_exercise_list = []
        types_to_exclude_in_this_run = []
        
        # Generar 3 ejercicios adaptativos
        for _ in range(3):
            # Determinar la estrategia basada en el rendimiento global
            strategy = platform.determine_next_exercise_strategy()
            
            #Construir la lista de tipos a excluir
            
            globally_excluded = strategy.get("exclude_types", [])
            
            current_exclude_list = list(set(globally_excluded + types_to_exclude_in_this_run))
            
            
            exercise_set = platform.generate_cognitive_exercises(
                memory_to_update, 
                strategy, 
                exclude_types=current_exclude_list
            )
            
            if exercise_set and exercise_set.get("exercises"):
                new_exercise = exercise_set["exercises"][0]
                new_exercise_list.append(new_exercise)
               
                if "type" in new_exercise:
                    types_to_exclude_in_this_run.append(new_exercise["type"])
            else:
                
                fallback_set = platform.generate_fallback_exercises(memory_to_update)
                new_exercise_list.append(fallback_set["exercises"][0])

        if not new_exercise_list:
            return jsonify({"success": False, "error": "No se pudieron generar los nuevos ejercicios."}), 500

        
        memory_to_update["exercises"] = {"exercises": new_exercise_list}
        
       
        platform.save_memories()
        
        return jsonify({
            "success": True,
            "message": "Nuevo set de ejercicios adaptativos generado exitosamente.",
            "memory": memory_to_update
        })

    except Exception as e:
        print(f"Error generando nuevos ejercicios: {e}")
        return jsonify({"success": False, "error": str(e)}), 500
    

PERFORMANCE_DB = 'user_performance.json'

def load_user_performance():
    """Carga los datos de rendimiento del usuario desde JSON."""
    try:
        with open(PERFORMANCE_DB, 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
       
        return {
            "global_performance": {"total_correct": 0, "total_attempted": 0},
            "performance_by_type": {},
            "timing": {"total_response_time_seconds": 0, "total_timed_exercises": 0},
            "hints": {"total_hints_used": 0},
            "error_analysis": {"common_error_types": []}
        }

def save_user_performance(data):
    """Guarda los datos de rendimiento del usuario en JSON."""
    with open(PERFORMANCE_DB, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

@app.route('/api/settings/adaptive-learning', methods=['GET', 'POST'])
def adaptive_learning_settings():
    """Gestiona la configuración de aprendizaje adaptativo."""
    performance_data = load_user_performance()
    
    if request.method == 'POST':
        try:
            settings = request.json
            if 'enabled' in settings and isinstance(settings['enabled'], bool):
                performance_data['adaptive_learning_enabled'] = settings['enabled']
                save_user_performance(performance_data)
                return jsonify({
                    "success": True, 
                    "message": f"Aprendizaje adaptativo {'activado' if settings['enabled'] else 'desactivado'}.",
                    "adaptive_learning_enabled": settings['enabled']
                })
            else:
                return jsonify({"success": False, "error": "Parámetro 'enabled' (booleano) requerido."}), 400
        except Exception as e:
            return jsonify({"success": False, "error": str(e)}), 500
    
    # GET request
    return jsonify({
        "success": True,
        "adaptive_learning_enabled": performance_data.get('adaptive_learning_enabled', True) # Default a True si no existe
    })

@app.route('/api/submit_answer', methods=['POST'])
def submit_answer():
    """
    API para que el usuario envíe su respuesta a un ejercicio.
    Registra el rendimiento (acierto, tiempo, pistas) por tipo de ejercicio.
    """
    try:
        data = request.json
        memory_id = data.get('memory_id')
        exercise_index = data.get('exercise_index')
        user_answer = data.get('user_answer')
        response_time = data.get('response_time_seconds', 0)
        hint_used = data.get('hint_used', False)

        if memory_id is None or exercise_index is None or user_answer is None:
            return jsonify({"success": False, "error": "Faltan datos en la solicitud"}), 400

        memory = next((m for m in platform.memories["memories"] if m["id"] == memory_id), None)
        if not memory or 'exercises' not in memory or not isinstance(memory.get('exercises'), dict) or 'exercises' not in memory.get('exercises'):
            return jsonify({"success": False, "error": "Memoria o ejercicios no encontrados"}), 404
        
        try:
            exercise = memory['exercises']['exercises'][exercise_index]
        except IndexError:
            return jsonify({"success": False, "error": "Índice de ejercicio no válido"}), 404

        is_correct = (user_answer == exercise.get('correct_answer'))
        
        performance_data = load_user_performance()
        
      
        performance_data['global_performance']['total_attempted'] += 1
        if is_correct:
            performance_data['global_performance']['total_correct'] += 1
            
       
        ex_type = exercise.get('type', 'unknown').upper()
        if ex_type not in performance_data.get('performance_by_type', {}):
            performance_data['performance_by_type'][ex_type] = {
                'total_correct': 0, 
                'total_attempted': 0,
                'total_response_time_seconds': 0.0,
                'total_hints_used': 0
            }
        
        stats = performance_data['performance_by_type'][ex_type]
        stats['total_attempted'] += 1
        if is_correct:
            stats['total_correct'] += 1
        
   
        stats['total_response_time_seconds'] = stats.get('total_response_time_seconds', 0.0) + response_time
        if hint_used:
            stats['total_hints_used'] = stats.get('total_hints_used', 0) + 1
            
        
        performance_data.pop('timing', None)
        performance_data.pop('hints', None)

        save_user_performance(performance_data)
        
        return jsonify({
            "success": True,
            "is_correct": is_correct,
            "correct_answer": exercise.get('correct_answer')
        })

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500
    

if __name__ == '__main__':
    print(" Iniciando Plataforma de Estimulación Cognitiva...")
    print("📱 Accede a: http://localhost:5000")
    print("🔧 Configura tu OPENAI_API_KEY en variables de entorno")
    print("📚 API Test: http://localhost:5000/api/test")
    

    if not os.path.exists('index.html'):
        print("  Archivo index.html no encontrado. Creando archivo básico...")
        with open('index.html', 'w', encoding='utf-8') as f:
            f.write('<h1>Plataforma de Estimulación Cognitiva</h1><p>Sube el archivo index.html completo aquí</p>')
    
    app.run(debug=True, host='0.0.0.0', port=5000)