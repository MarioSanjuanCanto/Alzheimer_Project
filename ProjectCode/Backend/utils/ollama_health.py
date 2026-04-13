import os
import yaml
from crewai import Agent, Task, Crew, LLM
import json
import requests
from dotenv import load_dotenv
from agents.validation.verificador import VerificadorAgent

# Cargar variables de entorno desde el archivo .env
load_dotenv()


def test_selector_agent():
    print("\033[97m[test_selector_agent]\033[0m Testing selector agent")

    # _____________ LLM con temperature=0 para consistencia _____________
    llm = LLM(
        model="ollama/phi3:mini",
        temperature=0,
        base_url="http://localhost:11434"
    )

    # _____________ Agent definition  _____________
    agent_config = {
        "role": "Procesador de Memoria Terapéutica",
        "goal": "Extraer minuciosamente los hechos, datos concretos y párrafos exactos de la memoria seleccionada como 'materia prima'. Tu objetivo fundamental es NO estructurar preguntas ni ejercicios finales, sino proporcionar la información en bruto lista para ser usada por otros.",
        "backstory": "Eres un analista de datos y procesador de textos implacable. Tu único trabajo es leer las historias, detectar qué piezas de información (hechos, fechas, secuencias) son relevantes, y plasmarlas literalmente en un documento. Tienes TERMINANTEMENTE PROHIBIDO crear preguntas, tests o ejercicios interactivos. Solo eres un extractor de datos puros.",
        "verbose": False,
        "llm": llm
    }

    selector_agent = Agent(**agent_config)


    # _____________ Task definition  _____________
    task_config = {
        "description": """ Analiza la memoria proporcionada y extrae ÚNICAMENTE los datos y fragmentos de texto relevantes que servirán como "materia prima" para preparar futuros ejercicios cognitivos. 
            ¡ATENCIÓN! BAJO NINGÚN CONCEPTO DEBES GENERAR PREGUNTAS NI RESPUESTAS. TU ÚNICO TRABAJO ES EXTRAER INFORMACIÓN, DATOS Y TEXTO LITERAL DE LA MEMORIA ORIGINAL.
            
            INFORMACIÓN DE LA MEMORIA:
            - Título: De pesca con mi nieto
            - Descripción: Este fin de semana he ido con mi nieto a pescar, y aunque al final no tuvimos mucha suerte y no conseguimos pescar nada, la verdad es que pasamos un rato muy agradable juntos. Estuvimos varias horas cerca del agua, charlando, riendo y disfrutando del aire libre. En un momento del día le regalé un gorro que le había comprado especialmente para la ocasión, y le hizo muchísima ilusión. Se lo puso enseguida y no se lo quitó en todo el día. Ver lo contento que estaba hizo que el día valiera totalmente la pena, porque al final lo más importante no era pescar algo, sino compartir ese tiempo juntos y crear recuerdos bonitos.

            EJERCICIOS SOLICITADOS:
            - Tipos de ejercicios que alguien más generará posteriormente: multiple_choice, fill_in_the_blank, ordering

            INSTRUCCIONES DE EXTRACCIÓN (NO HACER PREGUNTAS):
            Genera un JSON estructurado donde cada clave sea exactamente el nombre del tipo de ejercicio, y el valor sea un listado de HECHOS, DATOS o FRAGMENTOS DE TEXTO Puros extraídos del original.
            
            Reglas estrictas de extracción según el tipo de ejercicio futuro:
            - Para 'multiple_choice': Extrae una lista de afirmaciones cortas basadas en hechos concretos, nombres propios o fechas clave. ¡NO ESCRIBAS PREGUNTAS O CUESTIONARIOS! Solo saca el 'dato'.
            - Para 'fill_in_the_blank': Extrae literalmente 2 o 3 frases o párrafos completos textualmente de la historia original. NO PONGAS HUECOS NI GUIONES, NO ESCRIBAS PREGUNTAS. Solo devuelve el texto original literal seleccionado.
            - Para 'ordering': Extrae del texto original de 4 a 6 eventos clave y preséntalos como una lista de oraciones literales en estricto orden cronológico. NO MANDES ORDENAR NADA.

            IMPORTANTE: Tu respuesta debe ser ÚNICA Y EXCLUSIVAMENTE un bloque JSON válido. No te inventes historias, cíñete a extraer datos.""",
        "expected_output": " Un objeto JSON válido cuyas claves sean los tipos de ejercicio:  multiple_choice, fill_in_the_blank, ordering, y cuyos valores sean exclusivamente los datos, fragmentos literales o listados de hechos concretos en bruto. ¡ESTÁ TERMINANTEMENTE PROHIBIDO CONTENER PREGUNTAS!",
        "agent": selector_agent
    }


    selector_task = Task(**task_config)


    try:
        selector_crew = Crew(
        agents=[selector_agent],
        tasks=[selector_task],
        verbose=False,
        memory=False
        )

        result = selector_crew.kickoff()

        result = result.raw.strip()
        print("\033[97m[ollama_health]\033[0m RAW result: " + result)
    except Exception as e:
        print(f"\033[97m[ollama_health]\033[0m Error: {e}")
        return {}

def test_ordering_agent():
    print("\033[97m[test_ordering_agent]\033[0m Testing ordering agent")

    # _____________ LLM con temperature=0 para consistencia _____________
    llm = LLM(
        model="ollama/phi3:mini",
        temperature=0,
        base_url="http://localhost:11434"
    )

    # _____________ Agent definition  _____________
    agent_config = {
        "role": "Especialista en Secuenciación Lógica",
        "goal": "Crear un ejercicio donde el usuario ordena frases de la historia. REGLA DE ORO DE INTEGRIDAD: El array correct_answer DEBE contener exactamente los mismos strings que el array options. ",
        "backstory": """ Eres un experto en lógica narrativa.
    Tu mayor error sería que una frase en "options" fuera diferente (aunque sea por una letra) a su correspondiente en "correct_answer".
    No uses etiquetas como "Evento A". Usa las frases reales. 
    Si en "options" pones "Me reí", en "correct_answer" debe aparecer "Me reí", NO una versión larga como "Me reí mucho de su chiste".
    Solo JSON.""",
        "verbose": False,
        "llm": llm
    }

    ordering_agent = Agent(**agent_config)

    # _____________ Task definition  _____________
    output_example = {
    "multiple_choice": [
        "El fin de semana se pasó pescando con mi nieto.",
        "Fue un día que nos quedamos cerca del agua durante varias horas.",
        "Charlamos y riíamos juntos al aire libre.",
        "Me regalé un gorro especialmente para la ocasión."
    ],
    "fill_in_the_blank": [
        {
        "fragmento1": "Este fin de semana he ido con mi nieto a pescar",
        "fragmento2": "pasamos varias horas cerca del agua, charlando, riendo y disfrutando el aire libre."
        }
    ],
    "ordering": [
        "Este fin de semana he ido con mi nieto a pescar",
        "pasamos varias horas cerca del agua, charlando, riyendo y disfrutando el aire libre.",
        "En un momento del día le regalé un gorro que había comprado especialmente para la ocasión.",
        "Se lo puso inmediatamente y no se lo quitó en todo el día."
    ]
    }


    task_config = {
    "description": f"""Genera un ejercicio de ordenación.

    INFORMACION:
    - {output_example['ordering']}

    INSTRUCCIONES CRÍTICAS (FALLO ZERO TOLERANCE):
    1. Selecciona 3 frases muy cortas (máximo 10 palabras cada una).
    2. Ponlas en "options" mezcladas (desordenadas).
    3. Ponlas en "correct_answer" en el orden cronológico correcto.
    4. VALIDACIÓN CRUZADA: Cada elemento de "correct_answer" DEBE ser idéntico (carácter por carácter) a un elemento de "options".

    PROHIBIDO:
    - Que "correct_answer" tenga frases que no están en "options".
    - Que las frases en "correct_answer" sean más largas o detalladas que las de "options".
    - Usar "Evento 1", "Evento 2", etc.

    REGLA DE ORO: No incluyas "Análisis de IA" ni etiquetas técnicas dentro de las frases.

    ESTRUCTURA JSON REQUERIDA:
      "type": string (siempre "ordering"),
      "question": string (instrucción para ordenar los eventos),
      "options": array de 3 strings (frases cortas desordenadas),
      "correct_answer": array de 3 strings (las mismas frases en orden cronológico correcto),
      "hint": string (pista sobre el orden),
      "difficulty": string ("fácil", "media" o "difícil")

    PROHIBIDO:
    - Añadir texto antes o después del JSON.
    - Usar markdown.
    - Añadir comentarios.
    - Generar múltiples objetos.
    - Cambiar las claves del JSON.""",
    "expected_output": "Un único objeto JSON válido con las claves exactas: type, question, options, correct_answer, hint, difficulty.",
    "agent": ordering_agent
    }


    ordering_task = Task(**task_config)


    try:
        ordering_crew = Crew(
        agents=[ordering_agent],
        tasks=[ordering_task],
        verbose=False,
        memory=False
        )

        result = ordering_crew.kickoff()

        result = result.raw.strip()
        print("\033[97m[ollama_health]\033[0m RAW result: " + result)
    except Exception as e:
        print(f"\033[97m[ollama_health]\033[0m Error: {e}")
        return {}

def test_verificador_agent():
    print("\033[97m[test_verificador_agent]\033[0m Testing verificador agent")
    current_dir = os.path.dirname(os.path.abspath(__file__))

    # Subir un nivel (Backend/)
    backend_dir = os.path.dirname(current_dir)

    # Construir ruta absoluta a config/agents.yaml
    config_path = os.path.join(backend_dir, "config")

    verificador_agent = VerificadorAgent(config_path)

    
    # _______________________ ordering test _______________________

    ordering_structure = {
        "type":"",
        "question":"",
        "options":"",
        "correct_answer":"",
        "hint":"",
        "difficulty":""
    }


    ordering_exercise = {
        "type": "ordering",
        "question": "Ordena los eventos de la historia.",
        "options": [
            "Leo llegó justo después del desayuno.",
            "El abuelo se despertó con una emoción especial.",
            "La madre de Leo le entregó una lista al abuelo."
        ],
        "correct_answer": [
            "El abuelo se despertó con una emoción especial.",
            "Leo llegó justo después del desayuno.",
            "La madre de Leo le entregó una lista al abuelo."
        ],
        "hint": "Piensa en el momento en que el abuelo se despierta.",
        "difficulty": "fácil"
    }

    ordering_original_information = """ordering": [
    "El abuelo se despertó con una emoción especial.",
    "Leo llegó justo después del desayuno.",
    "La madre de Leo le entregó una lista al abuelo.",
    "Leo expresó su deseo de tener ropa con dinosaurios.",
    "El abuelo y Leo acordaron negociar sobre la ropa."
  ]"""
    # _______________________ fill_in_the_blank test _______________________

    fill_in_the_blank_exercise = {
        "type": "fill_in_the_blank",
        "question": "El abuelo fue a la tienda a comprar ropa con _______",
        "correct_answer": "dinosaurios",
        "hint": "A Leo le gustaban mucho los dinosaurios.",
        "difficulty": "fácil"
    }
    fill_in_the_blank_exercise_wrong = {
        "type": "fill_in_the_blank",
        "question": "El abuelo fue a la tienda a comprar ropa con _______",
        "correct_answer": "dinosaurios",
        "hint": "A Leo le gustaban mucho los dinosaurios.",
        "difficulty": "fácil"
    }

    fill_in_the_blank_original_information = """fill_in_the_blank": [
    "El abuelo fue a la tienda a comprar ropa con dinosaurios",
    "A Leo le gustaban mucho los dinosaurios."
  ]"""

    fill_in_the_blank_structure = {
        "type":"",
        "question":"",
        "correct_answer":"",
        "hint":"",
        "difficulty":""
    }

    # _______________________ multiple_choice test _______________________

    multiple_choice_exercise = {
        "type":"multiple_choice",
        "question":"¿Qué tipo de ropa quería Leo?",
        "options":[
            "Ropa con dinosaurios",
            "Ropa con superhéroes",
            "Ropa con coches"
        ],
        "correct_answer":0,
        "hint":"A Leo le gustaban mucho los dinosaurios.",
        "difficulty":"fácil"
    } 

    multiple_choice_original_information = """multiple_choice": [
    "El abuelo fue a la tienda a comprar ropa con dinosaurios",
    "A Leo le gustaban mucho los dinosaurios."
  ]"""

    multiple_choice_structure = {
        "type":"",
        "question":"",
        "options":"",
        "correct_answer":"",
        "hint":"",
        "difficulty":""
    }



    #verificador_agent.validate(ordering_exercise, ordering_original_information, ordering_structure)
    #verificador_agent.validate(fill_in_the_blank_exercise, fill_in_the_blank_original_information, fill_in_the_blank_structure)
    verificador_agent.validate(multiple_choice_exercise, multiple_choice_original_information, multiple_choice_structure)

if __name__ == "__main__":
    test_verificador_agent()

