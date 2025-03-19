# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import router

app = FastAPI(title="Hackathon API")

# Set up CORS to allow requests from the React app running on localhost:3000
origins = [
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include your API routes
app.include_router(router)

if __name__ == "__main__":
    import uvicorn
    # Run the application with automatic reload enabled for development
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)

