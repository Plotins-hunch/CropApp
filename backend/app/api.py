# api.py
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from datetime import date, datetime
import json

from app.risk_models import RiskCalculator
from app.recommender import ThompsonSamplingRecommender
from app.forecaster import RiskForecaster
from app.database import Database

# Initialize router
router = APIRouter()

# Initialize components
db = Database()
risk_calculator = RiskCalculator()
recommender = ThompsonSamplingRecommender(db)
forecaster = RiskForecaster(risk_calculator)

# ----- Data Models -----

class FieldBase(BaseModel):
    farmer_id: int
    name: str
    latitude: float
    longitude: float
    crop_type: str
    size_hectares: float
    soil_quality: int

class FeedbackBase(BaseModel):
    recommendation_id: int
    rating: int
    notes: Optional[str] = ""

# ----- API Endpoints -----

@router.get("/")
async def read_root():
    return {"message": "Biologicals Recommendation API"}

@router.get("/risk/{date}/{crop}/{lat}/{lon}")
async def get_risks(date: str, crop: str, lat: float, lon: float):
    """Get current risks for a field location"""
    risks = risk_calculator.get_field_risks(date, crop, lat, lon)
    
    if "error" in risks:
        raise HTTPException(status_code=400, detail=risks["error"])
        
    return risks

@router.get("/recommend/{field_id}/{date}")
async def get_recommendation(field_id: int, date: str):
    """Get product recommendation for a field"""
    # Get field info
    fields = db.get_fields()
    field = next((f for f in fields if f['id'] == field_id), None)
    
    if not field:
        raise HTTPException(status_code=404, detail="Field not found")
    
    # Get risks for this field
    risks = risk_calculator.get_field_risks(
        date, 
        field['crop_type'], 
        field['latitude'], 
        field['longitude']
    )
    
    if "error" in risks:
        raise HTTPException(status_code=400, detail=risks["error"])
    
    # Add soil quality to context
    context = {
        'heat_stress': risks['heat_stress'],
        'frost_stress': risks['frost_stress'],
        'drought_stress': risks['drought_stress'],
        'soil_quality': field['soil_quality']
    }
    
    # Get recommendation
    recommendation = recommender.recommend(context, field_id)
    
    # Add risks to response
    recommendation['risks'] = risks
    
    return recommendation

@router.post("/feedback")
async def submit_feedback(feedback: FeedbackBase):
    """Submit feedback for a recommendation"""
    result = db.save_feedback(
        feedback.recommendation_id,
        feedback.rating,
        feedback.notes
    )
    
    if not result:
        raise HTTPException(status_code=404, detail="Recommendation not found")
    
    # Update recommender with feedback
    update_result = recommender.update_from_feedback(
        result['context'],
        result['product'],
        result['rating']
    )
    
    return {
        "success": True,
        "message": "Feedback recorded and model updated",
        "update_details": update_result
    }

@router.get("/improvements/{field_id}/{date}")
async def get_potential_improvements(field_id: int, date: str):
    """Get potential improvements with each product"""
    # Get field info
    fields = db.get_fields()
    field = next((f for f in fields if f['id'] == field_id), None)
    
    if not field:
        raise HTTPException(status_code=404, detail="Field not found")
    
    # Get risks for this field
    risks = risk_calculator.get_field_risks(
        date, 
        field['crop_type'], 
        field['latitude'], 
        field['longitude']
    )
    
    if "error" in risks:
        raise HTTPException(status_code=400, detail=risks["error"])
    
    # Add soil quality to context
    context = {
        'heat_stress': risks['heat_stress'],
        'frost_stress': risks['frost_stress'],
        'drought_stress': risks['drought_stress'],
        'soil_quality': field['soil_quality']
    }
    
    # Get improvements for each product
    improvements = recommender.get_product_improvements(context)
    
    return {
        "field_id": field_id,
        "date": date,
        "risks": risks,
        "potential_improvements": improvements
    }

@router.get("/history/{field_id}")
async def get_recommendation_history(field_id: int, limit: int = 10):
    """Get recommendation history for a field"""
    history = db.get_recommendation_history(field_id, limit)
    return history

@router.get("/forecast/{crop}/{lat}/{lon}")
async def get_risk_forecast(crop: str, lat: float, lon: float, days: int = 7):
    """Get risk forecast for future days"""
    forecast = forecaster.predict_future_risks(lat, lon, crop, days)
    
    if "error" in forecast:
        raise HTTPException(status_code=400, detail=forecast["error"])
        
    return forecast

@router.get("/forecast-with-product/{crop}/{product}/{lat}/{lon}")
async def get_forecast_with_product(crop: str, product: str, lat: float, lon: float, days: int = 7):
    """Get risk forecast with biological product applied"""
    forecast = forecaster.predict_with_biologicals_impact(lat, lon, crop, product, days)
    
    if "error" in forecast:
        raise HTTPException(status_code=400, detail=forecast["error"])
        
    return forecast

# Add a test field if none exist
@router.post("/test-field")
async def add_test_field():
    """Add a test field for demo purposes"""
    # Check if fields exist
    fields = db.get_fields()
    
    if not fields:
        # Create a test farmer
        cursor = db.conn.cursor()
        cursor.execute('''
        INSERT INTO farmers (name, location)
        VALUES (?, ?)
        ''', ('Test Farmer', 'Brazil'))
        farmer_id = cursor.lastrowid
        
        # Create a test field
        cursor.execute('''
        INSERT INTO fields (farmer_id, name, latitude, longitude, crop_type, size_hectares, soil_quality)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (farmer_id, 'Test Field', -23.5505, -46.6333, 'soybean', 10.5, 7))
        field_id = cursor.lastrowid
        
        db.conn.commit()
        
        return {"message": "Test field created", "field_id": field_id}
    
    return {"message": "Fields already exist", "count": len(fields)}