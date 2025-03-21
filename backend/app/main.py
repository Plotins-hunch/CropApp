# main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import router as legacy_router
from api import router as ai_router

app = FastAPI(title="Biological Products Recommendation API")

# Set up CORS to allow requests from the frontend
origins = [
    "http://localhost:3000",
    "http://localhost:5173",  # If using Vite
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include legacy routes
app.include_router(legacy_router)

# Include AI recommendation routes
app.include_router(ai_router, prefix="/ai", tags=["ai"])

if __name__ == "__main__":
    import uvicorn
    # Run the application with automatic reload enabled
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)