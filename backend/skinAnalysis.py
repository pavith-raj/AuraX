from fastapi import FastAPI, File, UploadFile, Form
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import shutil
import os
import base64

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/generate-hairstyle")
async def generate_hairstyle(file: UploadFile = File(...), prompt: str = Form(...)):
    temp_path = f"temp_{file.filename}"
    with open(temp_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # === REAL AI INFERENCE LOGIC GOES HERE ===
    # For demonstration, just copy the input as output
    output_path = "output.png"
    shutil.copy(temp_path, output_path)

    # Read the output image as base64
    with open(output_path, "rb") as img_file:
        img_base64 = base64.b64encode(img_file.read()).decode('utf-8')

    # Clean up temp files
    os.remove(temp_path)
    os.remove(output_path)

    return JSONResponse({
        "status": "success",
        "message": "Hairstyle generated (placeholder).",
        "image_base64": img_base64,
        "prompt": prompt
    })

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001) 