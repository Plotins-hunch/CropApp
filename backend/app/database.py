# database.py
import sqlite3
import json
import os
from datetime import datetime

class Database:
    def __init__(self, db_file="agri_recommendations.db"):
        # Check if the database file exists
        db_exists = os.path.isfile(db_file)
        
        # Connect to database
        self.conn = sqlite3.connect(db_file)
        self.conn.row_factory = sqlite3.Row  # Return rows as dictionaries
        
        # Create tables if they don't exist
        if not db_exists:
            self._create_tables()
    
    def _create_tables(self):
        """Create database tables"""
        cursor = self.conn.cursor()
        
        # Farmers table
        cursor.execute('''
        CREATE TABLE farmers (
            id INTEGER PRIMARY KEY,
            name TEXT,
            location TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        ''')
        
        # Fields table
        cursor.execute('''
        CREATE TABLE fields (
            id INTEGER PRIMARY KEY,
            farmer_id INTEGER,
            name TEXT,
            latitude REAL,
            longitude REAL,
            crop_type TEXT,
            size_hectares REAL,
            soil_quality INTEGER,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (farmer_id) REFERENCES farmers (id)
        )
        ''')
        
        # Recommendations table
        cursor.execute('''
        CREATE TABLE recommendations (
            id INTEGER PRIMARY KEY,
            field_id INTEGER,
            date TEXT,
            context TEXT,  # JSON string with risk values
            recommended_product TEXT,
            confidence REAL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (field_id) REFERENCES fields (id)
        )
        ''')
        
        # Feedback table
        cursor.execute('''
        CREATE TABLE feedback (
            id INTEGER PRIMARY KEY,
            recommendation_id INTEGER,
            rating INTEGER,  # 1-10 scale
            notes TEXT,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (recommendation_id) REFERENCES recommendations (id)
        )
        ''')
        
        # Model parameters table
        cursor.execute('''
        CREATE TABLE model_parameters (
            id INTEGER PRIMARY KEY,
            context_type TEXT,  # heat_stress, frost_stress, etc.
            product TEXT,       # StressBuster, YieldBooster, etc.
            alpha REAL,
            beta REAL,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        ''')
        
        # Insert initial model parameters based on prior knowledge
        self._initialize_model_parameters()
        
        self.conn.commit()
    
    def _initialize_model_parameters(self):
        """Initialize model parameters with prior knowledge"""
        cursor = self.conn.cursor()
        
        # Initial parameters based on product documentation
        initial_params = [
            # StressBuster is good for stress conditions
            ('heat_stress', 'StressBuster', 8, 2),
            ('frost_stress', 'StressBuster', 7, 2),
            ('drought_stress', 'StressBuster', 7, 2),
            ('soil_quality_low', 'StressBuster', 2, 2),
            
            # YieldBooster is good for yield improvement
            ('heat_stress', 'YieldBooster', 3, 2),
            ('frost_stress', 'YieldBooster', 2, 2),
            ('drought_stress', 'YieldBooster', 3, 2),
            ('soil_quality_low', 'YieldBooster', 3, 2),
            
            # NutrientBooster is good for soil quality
            ('heat_stress', 'NutrientBooster', 1, 2),
            ('frost_stress', 'NutrientBooster', 1, 2),
            ('drought_stress', 'NutrientBooster', 2, 2),
            ('soil_quality_low', 'NutrientBooster', 8, 2)
        ]
        
        for params in initial_params:
            cursor.execute('''
            INSERT INTO model_parameters (context_type, product, alpha, beta, updated_at)
            VALUES (?, ?, ?, ?, datetime('now'))
            ''', params)
        
        self.conn.commit()
    
    def get_model_parameters(self):
        """Get all model parameters"""
        cursor = self.conn.cursor()
        cursor.execute('SELECT * FROM model_parameters')
        rows = cursor.fetchall()
        
        # Organize parameters by context and product
        parameters = {}
        for row in rows:
            context = row['context_type']
            product = row['product']
            
            if context not in parameters:
                parameters[context] = {}
                
            parameters[context][product] = {
                'alpha': row['alpha'],
                'beta': row['beta'],
                'updated_at': row['updated_at']
            }
            
        return parameters
    
    def update_model_parameters(self, context_type, product, alpha, beta):
        """Update model parameters after feedback"""
        cursor = self.conn.cursor()
        cursor.execute('''
        UPDATE model_parameters
        SET alpha = ?, beta = ?, updated_at = datetime('now')
        WHERE context_type = ? AND product = ?
        ''', (alpha, beta, context_type, product))
        self.conn.commit()
    
    def save_recommendation(self, field_id, date, context, product, confidence):
        """Save a recommendation to the database"""
        cursor = self.conn.cursor()
        cursor.execute('''
        INSERT INTO recommendations 
        (field_id, date, context, recommended_product, confidence, created_at)
        VALUES (?, ?, ?, ?, ?, datetime('now'))
        ''', (field_id, date, json.dumps(context), product, confidence))
        self.conn.commit()
        return cursor.lastrowid
    
    def save_feedback(self, recommendation_id, rating, notes=""):
        """Save feedback for a recommendation"""
        cursor = self.conn.cursor()
        cursor.execute('''
        INSERT INTO feedback (recommendation_id, rating, notes, timestamp)
        VALUES (?, ?, ?, datetime('now'))
        ''', (recommendation_id, rating, notes))
        self.conn.commit()
        
        # Get context and product for this recommendation
        cursor.execute('''
        SELECT context, recommended_product 
        FROM recommendations 
        WHERE id = ?
        ''', (recommendation_id,))
        rec = cursor.fetchone()
        
        if rec:
            return {
                'context': json.loads(rec['context']),
                'product': rec['recommended_product'],
                'rating': rating
            }
        return None
    
    def get_fields(self, farmer_id=None):
        """Get all fields, optionally filtered by farmer"""
        cursor = self.conn.cursor()
        
        if farmer_id:
            cursor.execute('SELECT * FROM fields WHERE farmer_id = ?', (farmer_id,))
        else:
            cursor.execute('SELECT * FROM fields')
            
        return [dict(row) for row in cursor.fetchall()]
    
    def get_recommendation_history(self, field_id=None, limit=10):
        """Get recommendation history, optionally filtered by field"""
        cursor = self.conn.cursor()
        
        if field_id:
            cursor.execute('''
                SELECT r.*, f.rating 
                FROM recommendations r
                LEFT JOIN feedback f ON r.id = f.recommendation_id
                WHERE r.field_id = ?
                ORDER BY r.created_at DESC
                LIMIT ?
            ''', (field_id, limit))
        else:
            cursor.execute('''
                SELECT r.*, f.rating 
                FROM recommendations r
                LEFT JOIN feedback f ON r.id = f.recommendation_id
                ORDER BY r.created_at DESC
                LIMIT ?
            ''', (limit,))
            
        results = []
        for row in cursor.fetchall():
            result = dict(row)
            if result['context']:
                result['context'] = json.loads(result['context'])
            results.append(result)
            
        return results
    
    def close(self):
        """Close the database connection"""
        if self.conn:
            self.conn.close()