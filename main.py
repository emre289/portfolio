from fastapi import FastAPI, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import httpx
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = FastAPI()

# CORS middleware for allowing frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve static files
app.mount("/css", StaticFiles(directory="css"), name="css")
app.mount("/js", StaticFiles(directory="js"), name="js")
app.mount("/resimler", StaticFiles(directory="resimler"), name="resimler")

@app.get("/")
async def read_root():
    return FileResponse("index.html")

@app.post("/submit")
async def submit_form(
    name: str = Form(...),
    email: str = Form(...),
    subject: str = Form(default=""),
    message: str = Form(...)
):
    # Get Google Apps Script URL from environment
    google_url = os.getenv("MY_SECRET_GOOGLE_URL")
    
    if not google_url:
        return {"success": False, "message": "Server configuration error"}
    
    # Prepare data for Google Sheets
    data = {
        "name": name,
        "email": email,
        "subject": subject,
        "message": message
    }
    
    try:
        # Send data to Google Apps Script
        async with httpx.AsyncClient() as client:
            response = await client.post(google_url, data=data, follow_redirects=True)
        
        if response.status_code == 200:
            return {"success": True, "message": "Mesajınız başarıyla gönderildi!"}
        else:
            return {"success": False, "message": "Bir hata oluştu. Lütfen tekrar deneyin."}
    
    except Exception as e:
        print(f"Error: {e}")
        return {"success": False, "message": "Sunucu hatası. Lütfen daha sonra tekrar deneyin."}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
