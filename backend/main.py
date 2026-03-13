from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi import Body
import json
from llm import analyze_essay
import os

app = FastAPI()

app.mount("/static", StaticFiles(directory="../frontend"), name="frontend")

@app.get("/")
def index():
    return FileResponse(os.path.join("../frontend", "index.html"))

# Frontend communicate with backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/analyze")
async def analyze(request: Request):
    data = await request.json()
    essay = data.get("essay", "")
    print(f"Received essay: {essay[:50]}...")
    result = analyze_essay(essay)
    print(f"LLM response: {result}")
    return result

@app.post("/store-session")
async def store_session(data: dict = Body(...)):
    os.makedirs("../saved", exist_ok=True)

    filename = f"../saved/session_{len(os.listdir('../saved'))}.json"

    with open(filename, "w") as f:
        json.dump(data, f, indent=2)

    return {"status": "saved"}