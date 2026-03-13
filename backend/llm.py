import ollama
import json
import re
from prompt import PROMPT

def extract_json(raw):
    match = re.search(r'\{[\s\S]*\}', raw)
    if not match:
        return None

    clean_json = match.group()
    clean_json = clean_json.replace('\n', ' ')
    clean_json = re.sub(r',(\s*[\]}])', r'\1', clean_json)
    clean_json = clean_json.replace("'", '"')

    try:
        return json.loads(clean_json)
    except:
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

        edits = obj.get("edits", [])

        # Edit Structure
        for edit in edits:
            if "original" not in edit or "options" not in edit:
                continue
            for opt in edit["options"]:
                if "level" not in opt or "text" not in opt:
                    opt["level"] = 1
                    opt["text"] = opt.get("text", "")

        return {"edits": edits}

    except Exception as e:
        return {"error": "Failed to analyze essay.", "details": str(e)}
