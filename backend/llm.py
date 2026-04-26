import ollama
import json
import re
from prompt import PROMPT

def extract_json(raw):
    # First, try to parse the whole raw as JSON after cleaning
    clean_raw = raw.strip()
    clean_raw = clean_raw.replace('\n', ' ')
    clean_raw = clean_raw.replace('\r', '')
    clean_raw = re.sub(r'\s+', ' ', clean_raw)
    clean_raw = re.sub(r',(\s*[\]}])', r'\1', clean_raw)
    clean_raw = re.sub(r"'(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)", '"', clean_raw)
    clean_raw = clean_raw.replace('"', '"').replace('"', '"')
    clean_raw = clean_raw.replace(''', "'").replace(''', "'")
    clean_raw = clean_raw.strip()
    
    try:
        return json.loads(clean_raw)
    except:
        pass
    
    # If fails, try to extract the JSON block
    match = re.search(r'\{[\s\S]*\}', raw)
    if not match:
        return None

    clean_json = match.group()
    
    # Remove newlines but preserve structure
    clean_json = clean_json.replace('\n', ' ')
    clean_json = clean_json.replace('\r', '')
    
    # Fix trailing commas before closing brackets/braces
    clean_json = re.sub(r',(\s*[\]}])', r'\1', clean_json)
    
    # Replace single quotes with double quotes (but be careful with apostrophes in text)
    clean_json = re.sub(r"'(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)", '"', clean_json)
    
    # Replace smart quotes with regular quotes
    clean_json = clean_json.replace('"', '"').replace('"', '"')
    clean_json = clean_json.replace(''', "'").replace(''', "'")
    
    # Remove multiple spaces
    clean_json = re.sub(r'\s+', ' ', clean_json)
    
    # Strip leading/trailing whitespace
    clean_json = clean_json.strip()
    
    try:
        return json.loads(clean_json)
    except json.JSONDecodeError as e:
        print(f"JSON decode error: {e}")
        print(f"Cleaned JSON: {clean_json[:200]}...")
        return None
    except Exception as e:
        print(f"Unexpected error in extract_json: {e}")
        return None

def analyze_essay(essay: str) -> dict:
    input_text = f"{PROMPT}\nWriting to Adjust:\n{essay}"

    try:
        response = ollama.chat(
            model="gpt-oss:20b",
            messages=[{"role": "user", "content": input_text}]
        )

        raw = response["message"]["content"]
        print(f"Raw LLM output: {raw}")

        obj = extract_json(raw)

        # Retry once if invalid
        if obj is None:
            print("Invalid JSON. Retrying...")
            response = ollama.chat(
                model="gpt-oss:20b",
                messages=[{"role": "user", "content": input_text}]
            )
            raw = response["message"]["content"]
            obj = extract_json(raw)

        if obj is None:
            return {"error": "Model failed to return valid JSON."}

        if not isinstance(obj, dict) or "edits" not in obj or not isinstance(obj["edits"], list):
            return {"error": "Invalid JSON structure: missing or invalid 'edits' array."}

        edits = obj["edits"]

        # Edit Structure
        processed_edits = []
        for edit in edits:
            if not isinstance(edit, dict) or "original" not in edit:
                continue
            if "options" in edit and isinstance(edit["options"], list):
                # vocabulary
                for opt in edit["options"]:
                    if isinstance(opt, dict) and "level" not in opt:
                        opt["level"] = 1
                    if isinstance(opt, dict) and "text" not in opt:
                        opt["text"] = opt.get("text", "")
                processed_edits.append(edit)
            elif "revised" in edit:
                # grammar
                edit["options"] = [{"level": 1, "text": edit["revised"]}]
                processed_edits.append(edit)
            # Skip edits that don't match expected structures

        return {"edits": processed_edits}

    except Exception as e:
        return {"error": "Failed to analyze essay.", "details": str(e)}
