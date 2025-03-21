# app/routes.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
import requests
from datetime import datetime, timedelta
import json
import numpy as np

# Initialize router
router = APIRouter()

# External API endpoints
SYNGENTA_WEATHER_API = "https://services.cehub.syngenta-ais.com/api/Forecast/ShortRangeForecastDaily"
SYNGENTA_HISTORICAL_API = "http://my.meteoblue.com/dataset/query?apikey=e063b648626d"
API_KEY = "1f3f9b58-f6d5-4ddc-8891-fa8ee79890ee"
HISTORICAL_API = "e063b648626d"

# ---- EXISTING ROUTES ----

@router.get("/")
async def read_root():
    return {"message": "Welcome to the Biological Products Recommender!"}

@router.get("/weather/{date}/{lat}/{lon}")
def get_weather(date: str, lat: float, lon: float):
    params = {
        "latitude": lat,
        "longitude": lon,
        "startDate": date,
        "endDate": date,
        "supplier": "Meteoblue",
        "measureLabel": "TempAir_DailyAvg (C);Precip_DailySum (mm);Soilmoisture_0to10cm_DailyAvg (vol%)",
        "format": "json",
        "ApiKey": API_KEY
    }
    response = requests.get(SYNGENTA_WEATHER_API, params=params)

    if response.status_code == 200:
        data = response.json()
        print(data)
        return {
            "temperature": data[0].get("dailyValue", "N/A"),
            "rainfall": data[1].get("dailyValue", "N/A"),
            "soil_moisture": data[2].get("dailyValue", "N/A")
        }
    else:
        return {"error": "Could not fetch weather data"}

@router.get("/risk/heat/{crop}/{date}/{lat}/{lon}")
def get_heat_risk(date: str, crop: str, lat: float, lon: float):

    crop_temp_limits = {
            "soybean": {"TMaxOptimum": 32, "TMaxLimit": 45},
            "corn": {"TMaxOptimum": 33, "TMaxLimit": 44},
            "cotton": {"TMaxOptimum": 32, "TMaxLimit": 38},
            "rice": {"TMaxOptimum": 32, "TMaxLimit": 38},
            "wheat": {"TMaxOptimum": 25, "TMaxLimit": 32},
        }

    params = {
        "latitude": lat,
        "longitude": lon,
        "startDate": date,
        "endDate": date,
        "supplier": "Meteoblue",
        "measureLabel": "TempAir_DailyMax (C)",
        "format": "json",
        "ApiKey": API_KEY
    }
    response = requests.get(SYNGENTA_WEATHER_API, params=params)

    if response.status_code != 200:
        return {"error": "Wetterdaten konnten nicht abgerufen werden."}

    data = response.json()
    TMAX = float(data[0].get("dailyValue", "N/A"))  # Extrahiere maximale Temperatur

    # Temperaturgrenzen für die gewählte Kulturpflanze
    TMaxOptimum = crop_temp_limits[crop.lower()]["TMaxOptimum"]
    TMaxLimit = crop_temp_limits[crop.lower()]["TMaxLimit"]

    # Berechnung des Diurnal Heat Stress
    if TMAX <= TMaxOptimum:
        heat_stress = 0
    elif TMaxOptimum < TMAX < TMaxLimit:
        heat_stress = 9 * ((TMAX - TMaxOptimum) / (TMaxLimit - TMaxOptimum))
    else:
        heat_stress = 9


    return {
                "heat_stress": int(heat_stress)
       }

@router.get("/risk/frost/{crop}/{date}/{lat}/{lon}")
def get_frost_risk(date: str, crop: str, lat: float, lon: float):

    crop_temp_limits = {
        "soybean": {"TMinNoFrost": 4, "TMinFrost": -3},
        "corn": {"TMinNoFrost": 4, "TMinFrost": -3},
        "cotton": {"TMinNoFrost": 4, "TMinFrost": -3},
        "rice": {"TMinNoFrost": None, "TMinFrost": None},  # Kein Frost-Risiko definiert
        "wheat": {"TMinNoFrost": None, "TMinFrost": None},  # Kein Frost-Risiko definiert
    }

    # Falls die Pflanze keinen Frost-Risiko-Wert hat, gib 0 zurück
    if crop.lower() not in crop_temp_limits or crop_temp_limits[crop.lower()]["TMinNoFrost"] is None:
        return 0

    params = {
        "latitude": lat,
        "longitude": lon,
        "startDate": date,
        "endDate": date,
        "supplier": "Meteoblue",
        "measureLabel": "TempAir_DailyMin (C)",
        "format": "json",
        "ApiKey": API_KEY
    }
    response = requests.get(SYNGENTA_WEATHER_API, params=params)

    if response.status_code != 200:
        return {"error": "Wetterdaten konnten nicht abgerufen werden."}

    data = response.json()
    TMIN = float(data[0].get("dailyValue", "N/A"))  # Extrahiere minimale Temperatur

    # Temperaturgrenzen für die gewählte Kulturpflanze
    TMinNoFrost = crop_temp_limits[crop.lower()]["TMinNoFrost"]
    TMinFrost = crop_temp_limits[crop.lower()]["TMinFrost"]



    # Berechnung des Frost Stress
    print(TMIN)
    if TMIN >= TMinNoFrost:
        frost_stress = 0
    elif TMinFrost < TMIN < TMinNoFrost:
        frost_stress = 9 * abs((TMIN - TMinNoFrost) / (TMinFrost - TMinNoFrost))
    else:
        frost_stress = 9

    #return int(frost_stress)
    return {
            "frost_stress": int(frost_stress)
        }

@router.get("/risk/drought/{date}/{lat}/{lon}")
def get_drought_risk(date: str, lat: float, lon: float):
    params = {
        "latitude": lat,
        "longitude": lon,
        "startDate": date,
        "endDate": date,
        "supplier": "Meteoblue",
        "measureLabel": ["Precipitation (mm)", "Evapotranspiration (mm)", "SoilMoisture (mm)", "TempAir_DailyAvg (C)"],
        "format": "json",
        "ApiKey": API_KEY
    }

    response = requests.get(SYNGENTA_WEATHER_API, params=params)

    if response.status_code != 200:
        return {"error": "Wetterdaten konnten nicht abgerufen werden."}

    data = response.json()

    # Extrahiere Werte aus der API-Antwort
    try:
        P = float(data[0].get("dailyValue", "0"))  # Rainfall
        E = float(data[1].get("dailyValue", "0"))  # Evapotranspiration
        SM = float(data[2].get("dailyValue", "0"))  # Soil Moisture
        T = float(data[3].get("dailyValue", "0"))  # Durchschnittstemperatur
    except (IndexError, ValueError):
        return {"error": "Unvollständige Wetterdaten"}

    # Berechnung des Drought Risk Index (DI)
    DI = (P - E) + (SM / T) if T != 0 else 0  # Falls T = 0, um Division durch 0 zu vermeiden

    # Klassifizierung des Drought Risks
    if DI > 1:
        drought_risk = "No risk"
    elif DI == 1:
        drought_risk = "Medium risk"
    else:
        drought_risk = "High risk"

    return {
        "drought_index": round(DI, 2),
        "risk_level": drought_risk
    }

@router.get("/soildata/{date}/{lat}/{lon}")
def get_soildata(date: str, lat: float, lon: float):

    year, month, day = map(str, date.split('-'))
    month = int(month)
    month = (month +1) % 12

    if month >= 10:
        month = str(month)
    else:
        month = "0" + str(month)

    adjdate = date + "T+00:00/" + str(year) + "-" + month + "-" + str(day) + "T+00:00"


    print(adjdate)

    params = {
         "units": {
             "temperature": "C",
             "velocity": "km/h",
             "length": "metric",
             "energy": "watts"
         },
         "geometry": {
             "type": "MultiPoint",
             "coordinates": [[lat,lon]]
         },
         "format": "json",
         "timeIntervals": [
             adjdate
         ],
         "queries": [{
             "domain": "NEMSGLOBAL",
             "timeResolution": "daily",
             "codes": [
                 {"code": 11, "level": "2 m above gnd", "aggregation": "mean"},

                 #{"code": 52, "level": "2 m above gnd"},
                 #{"code": 157, "level": "180-0 mb above gnd"}
              ]
         }],
         #"apikey": HISTORICAL_API
     }

    response = requests.post(SYNGENTA_HISTORICAL_API , json=params)
    print(response.text)

    if response.status_code != 200:
            return {"error": "Erddaten konnten nicht abgerufen werden."}

    data = response.json()

    print(data)
    # Extrahiere relevante Werte
    temperature = data[0]["codes"][0]["dataPerTimeInterval"][0]["data"][0]
    #soil_moisture = data.get("data", {}).get("153", {}).get("value", "N/A")
    #soil_temperature = data.get("data", {}).get("139", {}).get("value", "N/A")

    avr_temperature = sum(temperature) / len(temperature) if len(temperature) > 0 else 0


    return {
        "average_temperature": avr_temperature
        #"soil_moisture": soil_moisture,
        #"soil_temperature": soil_temperature
    }

@router.get("/soil/data/{date}/{lat}/{lon}")
def get_soil_data(date: str, lat: float, lon: float):

    year, month, day = map(str, date.split('-'))
    month = int(month)
    month = (month +1) % 12

    if month >= 10:
        month = str(month)
    else:
        month = "0" + str(month)

    adjdate = date + "T+00:00/" + str(year) + "-" + month + "-" + str(day) + "T+00:00"


    print(adjdate)

    params = {
         "units": {
             "temperature": "C",
             "velocity": "km/h",
             "length": "metric",
             "energy": "watts"
         },
         "geometry": {
             "type": "MultiPoint",
             "coordinates": [[lat,lon]]
         },
         "format": "json",
         "timeIntervals": [
             adjdate
         ],
         "queries": [{
            "domain": "WISE30",
            "timeResolution": "static",
            "codes": [ { "code": 812, "level": "aggregated" } ]
         }],
         #"apikey": HISTORICAL_API
     }

    response = requests.post(SYNGENTA_HISTORICAL_API , json=params)
    print(response.text)

    if response.status_code != 200:
            return {"error": "Erddaten konnten nicht abgerufen werden."}

    data = response.json()

    print(data)
    # Extrahiere relevante Werte
    ph = data[0]["codes"][0]["dataPerTimeInterval"][0]["data"][0]
    #soil_moisture = data.get("data", {}).get("153", {}).get("value", "N/A")
    #soil_temperature = data.get("data", {}).get("139", {}).get("value", "N/A")



    return {
        "ph": ph
        #"soil_moisture": soil_moisture,
        #"soil_temperature": soil_temperature
    }

# ---- AI RECOMMENDATION SYSTEM ----

# Import AI system components
from database import Database
from risk_models import RiskCalculator
from recommender import ThompsonSamplingRecommender
from forecaster import RiskForecaster

# Initialize AI components
db = Database()
risk_calculator = RiskCalculator()
recommender = ThompsonSamplingRecommender(db)
forecaster = RiskForecaster(risk_calculator)

# Pydantic models for data validation
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

# AI recommendation routes

@router.get("/ai/risk/{date}/{crop}/{lat}/{lon}")
async def get_ai_risks(date: str, crop: str, lat: float, lon: float):
    """Get comprehensive risk assessment for a field location"""
    risks = risk_calculator.get_field_risks(date, crop, lat, lon)
    
    if "error" in risks:
        raise HTTPException(status_code=400, detail=risks["error"])
        
    return risks

@router.get("/ai/recommend/{field_id}/{date}")
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

@router.post("/ai/feedback")
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

@router.get("/ai/improvements/{field_id}/{date}")
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

@router.get("/ai/history/{field_id}")
async def get_recommendation_history(field_id: int, limit: int = 10):
    """Get recommendation history for a field"""
    history = db.get_recommendation_history(field_id, limit)
    return history

@router.get("/ai/forecast/{crop}/{lat}/{lon}")
async def get_risk_forecast(crop: str, lat: float, lon: float, days: int = 7):
    """Get risk forecast for future days"""
    forecast = forecaster.predict_future_risks(lat, lon, crop, days)
    
    if "error" in forecast:
        raise HTTPException(status_code=400, detail=forecast["error"])
        
    return forecast

@router.get("/ai/forecast-with-product/{crop}/{product}/{lat}/{lon}")
async def get_forecast_with_product(crop: str, product: str, lat: float, lon: float, days: int = 7):
    """Get risk forecast with biological product applied"""
    forecast = forecaster.predict_with_biologicals_impact(lat, lon, crop, product, days)
    
    if "error" in forecast:
        raise HTTPException(status_code=400, detail=forecast["error"])
        
    return forecast

# Add a test field if none exist
@router.post("/ai/test-field")
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