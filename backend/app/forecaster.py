# forecaster.py
import numpy as np
from datetime import datetime, timedelta
import requests

class RiskForecaster:
    def __init__(self, risk_calculator):
        self.risk_calculator = risk_calculator
        self.api_key = "1f3f9b58-f6d5-4ddc-8891-fa8ee79890ee"
        self.forecast_api = "https://services.cehub.syngenta-ais.com/api/Forecast/ShortRangeForecastDaily"
    
    def get_forecast_data(self, lat, lon, days_ahead=7):
        """Get weather forecast data for future days"""
        today = datetime.now()
        end_date = today + timedelta(days=days_ahead)
        
        # Format dates
        start_str = today.strftime('%Y-%m-%d')
        end_str = end_date.strftime('%Y-%m-%d')
        
        # API parameters
        params = {
            "latitude": lat,
            "longitude": lon,
            "startDate": start_str,
            "endDate": end_str,
            "supplier": "Meteoblue",
            "measureLabel": "TempAir_DailyMax (C);TempAir_DailyMin (C);Precip_DailySum (mm);Soilmoisture_0to10cm_DailyAvg (vol%);Referenceevapotranspiration_DailySum (mm);TempAir_DailyAvg (C)",
            "format": "json",
            "ApiKey": self.api_key
        }
        
        # Make API request
        response = requests.get(self.forecast_api, params=params)
        
        if response.status_code != 200:
            return {"error": "Failed to fetch forecast data"}
        
        return response.json()
    
    def predict_future_risks(self, lat, lon, crop_type, days_ahead=7):
        """Predict risks for future days"""
        # Get forecast data
        forecast_data = self.get_forecast_data(lat, lon, days_ahead)
        
        if "error" in forecast_data:
            return forecast_data
        
        # Process forecast data
        future_risks = []
        
        try:
            # Group data by date
            dates = set()
            date_data = {}
            
            for item in forecast_data:
                date = item.get("validDate", "").split("T")[0]
                if date:
                    dates.add(date)
                    
                    if date not in date_data:
                        date_data[date] = {}
                    
                    measure_type = item.get("measureType", "")
                    value = float(item.get("dailyValue", 0))
                    
                    if "TempAir_DailyMax" in measure_type:
                        date_data[date]["tmax"] = value
                    elif "TempAir_DailyMin" in measure_type:
                        date_data[date]["tmin"] = value
                    elif "Precip_DailySum" in measure_type:
                        date_data[date]["precipitation"] = value
                    elif "Soilmoisture" in measure_type:
                        date_data[date]["soil_moisture"] = value
                    elif "Referenceevapotranspiration" in measure_type:
                        date_data[date]["evapotranspiration"] = value
                    elif "TempAir_DailyAvg" in measure_type:
                        date_data[date]["temperature"] = value
            
            # Calculate risks for each date
            for date in sorted(dates):
                data = date_data[date]
                
                # Calculate risks using risk calculator
                heat_stress = 0
                frost_stress = 0
                drought_data = {"risk_score": 0, "drought_index": 0}
                
                if "tmax" in data:
                    heat_stress = self.risk_calculator.calculate_heat_stress(crop_type, data["tmax"])
                
                if "tmin" in data:
                    frost_stress = self.risk_calculator.calculate_frost_stress(crop_type, data["tmin"])
                
                if all(key in data for key in ["precipitation", "evapotranspiration", "soil_moisture", "temperature"]):
                    drought_data = self.risk_calculator.calculate_drought_risk(
                        data["precipitation"],
                        data["evapotranspiration"],
                        data["soil_moisture"],
                        data["temperature"]
                    )
                
                future_risks.append({
                    "date": date,
                    "heat_stress": heat_stress,
                    "frost_stress": frost_stress,
                    "drought_stress": drought_data["risk_score"],
                    "drought_index": drought_data.get("drought_index", 0),
                    "tmax": data.get("tmax", 0),
                    "tmin": data.get("tmin", 0),
                    "precipitation": data.get("precipitation", 0),
                    "soil_moisture": data.get("soil_moisture", 0)
                })
            
            return future_risks
            
        except Exception as e:
            return {"error": f"Error processing forecast data: {str(e)}"}
    
    def predict_with_biologicals_impact(self, lat, lon, crop_type, product, days_ahead=7):
        """Predict future risks with biological product applied"""
        # Get base predictions
        base_risks = self.predict_future_risks(lat, lon, crop_type, days_ahead)
        
        if "error" in base_risks:
            return base_risks
        
        # Define product impact factors based on product cards
        impact_factors = {
            "StressBuster": {
                "heat_stress": 0.30,  # Reduces heat stress by 30%
                "frost_stress": 0.25,  # Reduces frost stress by 25%
                "drought_stress": 0.35  # Reduces drought stress by 35%
            },
            "YieldBooster": {
                "heat_stress": 0.15,
                "frost_stress": 0.10,
                "drought_stress": 0.20
            },
            "NutrientBooster": {
                "heat_stress": 0.05,
                "frost_stress": 0.05,
                "drought_stress": 0.15
            }
        }
        
        # Apply product impact to each day's risks
        with_product_risks = []
        
        for day_risk in base_risks:
            # Create a copy of the day's data
            day_with_product = day_risk.copy()
            
            # Apply impact factors
            if product in impact_factors:
                factors = impact_factors[product]
                
                for risk_type in ["heat_stress", "frost_stress", "drought_stress"]:
                    if risk_type in day_with_product:
                        reduction = day_with_product[risk_type] * factors[risk_type]
                        day_with_product[f"{risk_type}_with_product"] = max(0, day_with_product[risk_type] - reduction)
                        day_with_product[f"{risk_type}_reduction"] = reduction
            
            with_product_risks.append(day_with_product)
        
        return with_product_risks