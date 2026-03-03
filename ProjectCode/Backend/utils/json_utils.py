import json
import re

def parse_llm_json(raw_output: str) -> dict:
    """
    Extrae y parsea un JSON desde una respuesta que puede contener
    markdown (```json ... ```) u otros textos alrededor.
    """

    if not raw_output:
        raise ValueError("Empty response")

    # Eliminar bloques markdown ```json ... ```
    cleaned = re.sub(r"```json|```", "", raw_output).strip()

    # Extraer solo el primer bloque JSON {...}
    match = re.search(r"\{.*\}", cleaned, re.DOTALL)
    if not match:
        raise ValueError("No valid JSON object found in response")

    json_str = match.group(0)

    # Parsear
    try:
        return json.loads(json_str)
    except json.JSONDecodeError as e:
        raise ValueError(f"Invalid JSON format: {e}")