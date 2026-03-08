import os
import yaml
from crewai import Agent, Task, Crew, LLM
import json
import requests


def flush_ollama_context(model_name="phi3:mini"):
    """
    Fuerza a Ollama a liberar el contexto residual del modelo.
    Envía una petición con keep_alive=0 para descargar el modelo de memoria,
    y luego lo recarga limpio.
    """
    print(f"[ollama_health] Flushing context for model: {model_name}")
    try:
        # Paso 1: Descargar el modelo de memoria (keep_alive=0)
        requests.post("http://localhost:11434/api/generate", json={
            "model": model_name,
            "prompt": "",
            "keep_alive": 0  # Descargar inmediatamente de memoria
        })
        print(f"[ollama_health] Model {model_name} unloaded from memory")

        # Paso 2: Recargar limpio con un prompt vacío mínimo
        requests.post("http://localhost:11434/api/generate", json={
            "model": model_name,
            "prompt": "hi",
            "keep_alive": "5m",
            "options": {"num_predict": 1}  # Solo 1 token, para que cargue rápido
        })
        print(f"[ollama_health] Model {model_name} reloaded clean")
    except Exception as e:
        print(f"[ollama_health] Warning: Could not flush context: {e}")

def test_selector_agent():
    print("[test_selector_agent] Testing selector agent")

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
        print("[ollama_health] RAW result: " + result)
    except Exception as e:
        print(f"[ollama_health] Error: {e}")
        return {}

def test_ordering_agent():
    print("[test_ordering_agent] Testing ordering agent")

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
        print("[ollama_health] RAW result: " + result)
    except Exception as e:
        print(f"[ollama_health] Error: {e}")
        return {}

if __name__ == "__main__":
    # ===== TEST: Probar que el flush de contexto funciona =====
    # 
    # Prueba 1: Selector solo (debería ir bien)
    # Prueba 2: Ordering -> flush -> Selector (debería ir igual de bien)
    #
    # Descomenta la prueba que quieras ejecutar:

    # --- Prueba A: Solo selector ---
    # test_selector_agent()

    # --- Prueba B: Ordering + Selector SIN flush (se contamina) ---
    # test_ordering_agent()
    # test_selector_agent()  # <-- Aquí va peor por contexto residual

    # --- Prueba C: Ordering + flush + Selector (limpio) ---
    test_selector_agent()
    flush_ollama_context("phi3:mini")  # <-- Limpia el contexto entre llamadas
    test_ordering_agent() # <-- Ahora debería ir bien
    flush_ollama_context("phi3:mini") 
    test_selector_agent()

