# risk_models.py
import requests

class RiskCalculator:
    def __init__(self):
        self.api_key = "1f3f9b58-f6d5-4ddc-8891-fa8ee79890ee"
        self.weather_api = "https://services.cehub.syngenta-ais.com/api/Forecast/ShortRangeForecastDaily"
        
        self.crop_heat_limits = {
            "soybean": {"TMaxOptimum": 32, "TMaxLimit": 45},
            "corn": {"TMaxOptimum": 33, "TMaxLimit": 44},
            "cotton": {"TMaxOptimum": 32, "TMaxLimit": 38},
            "rice": {"TMaxOptimum": 32, "TMaxLimit": 38},
            "wheat": {"TMaxOptimum": 25, "TMaxLimit": 32},
        }
        
        self.crop_frost_limits = {
            "soybean": {"TMinNoFrost": 4, "TMinFrost": -3},
            "corn": {"TMinNoFrost": 4, "TMinFrost": -3},
            "cotton": {"TMinNoFrost": 4, "TMinFrost": -3},
            "rice": {"TMinNoFrost": None, "TMinFrost": None},
            "wheat": {"TMinNoFrost": None, "TMinFrost": None},
        }
    
    def get_weather_data(self, date, lat, lon):
        """Fetch weather data from API"""
        params = {
            "latitude": lat,
            "longitude": lon,
            "startDate": date,
            "endDate": date,
            "supplier": "Meteoblue",
            "measureLabel": "TempAir_DailyMax (C);TempAir_DailyMin (C);Precip_DailySum (mm);Soilmoisture_0to10cm_DailyAvg (vol%);Referenceevapotranspiration_DailySum (mm);TempAir_DailyAvg (C)",
            "format": "json",
            "ApiKey": self.api_key
        }
        
        response = requests.get(self.weather_api, params=params)
        if response.status_code == 200:
            return response.json()
        else:
            return None
    
    def calculate_heat_stress(self, crop, tmax):
        """Calculate heat stress based on maximum temperature"""
        if crop.lower() not in self.crop_heat_limits:
            return 0
            
        limits = self.crop_heat_limits[crop.lower()]
        t_max_optimum = limits["TMaxOptimum"]
        t_max_limit = limits["TMaxLimit"]
        
        if tmax <= t_max_optimum:
            heat_stress = 0
        elif t_max_optimum < tmax < t_max_limit:
            heat_stress = 9 * ((tmax - t_max_optimum) / (t_max_limit - t_max_optimum))
        else:
            heat_stress = 9
            
        return round(heat_stress, 1)
    
    def calculate_frost_stress(self, crop, tmin):
        """Calculate frost stress based on minimum temperature"""
        if crop.lower() not in self.crop_frost_limits:
            return 0
            
        limits = self.crop_frost_limits[crop.lower()]
        if limits["TMinNoFrost"] is None:
            return 0  # Crop doesn't have frost risk defined
            
        t_min_no_frost = limits["TMinNoFrost"]
        t_min_frost = limits["TMinFrost"]
        
        if tmin >= t_min_no_frost:
            frost_stress = 0
        elif t_min_frost < tmin < t_min_no_frost:
            frost_stress = 9 * abs((tmin - t_min_no_frost) / (t_min_frost - t_min_no_frost))
        else:
            frost_stress = 9
            
        return round(frost_stress, 1)
    
    def calculate_drought_risk(self, precipitation, evapotranspiration, soil_moisture, temperature):
        """Calculate drought risk using the formula: DI = (P - E) + SM / T"""
        if temperature == 0:
            di = 0  # Avoid division by zero
        else:
            di = (precipitation - evapotranspiration) + (soil_moisture / temperature)
        
        # Classify drought risk
        if di > 1:
            risk_level = "No risk"
            risk_score = 0
        elif di == 1:
            risk_level = "Medium risk"
            risk_score = 5
        else:
            risk_level = "High risk"
            risk_score = min(9, 9 * (1 - di))
            
        return {
            "drought_index": round(di, 2),
            "risk_level": risk_level,
            "risk_score": round(risk_score, 1)
        }
    
    def get_field_risks(self, date, crop, lat, lon):
        """Get comprehensive risk assessment for a field"""
        weather_data = self.get_weather_data(date, lat, lon)
        
        if not weather_data:
            return {"error": "Failed to fetch weather data"}
        
        # Extract values from weather API response
        try:
            tmax = float(weather_data[0].get("dailyValue", 0))  # Max temperature
            tmin = float(weather_data[1].get("dailyValue", 0))  # Min temperature
            precipitation = float(weather_data[2].get("dailyValue", 0))  # Precipitation
            soil_moisture = float(weather_data[3].get("dailyValue", 0))  # Soil moisture
            evapotranspiration = float(weather_data[4].get("dailyValue", 0))  # Evapotranspiration
            temperature = float(weather_data[5].get("dailyValue", 0))  # Avg temperature
        except (IndexError, ValueError):
            return {"error": "Incomplete weather data"}
        
        # Calculate all risks
        heat_stress = self.calculate_heat_stress(crop, tmax)
        frost_stress = self.calculate_frost_stress(crop, tmin)
        drought_data = self.calculate_drought_risk(
            precipitation, evapotranspiration, soil_moisture, temperature
        )
        
        return {
            "heat_stress": heat_stress,
            "frost_stress": frost_stress,
            "drought_stress": drought_data["risk_score"],
            "drought_index": drought_data["drought_index"],
            "temperature_max": tmax,
            "temperature_min": tmin,
            "precipitation": precipitation,
            "soil_moisture": soil_moisture,
            "date": date
        }