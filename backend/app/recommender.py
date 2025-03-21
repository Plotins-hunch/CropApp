# recommender.py
import numpy as np
from scipy.stats import beta
import json
from datetime import datetime

class ThompsonSamplingRecommender:
    def __init__(self, db=None):
        self.products = ['StressBuster', 'YieldBooster', 'NutrientBooster']
        self.db = db
        
        # Initialize parameters from database if available
        if db:
            self.parameters = db.get_model_parameters()
        else:
            # Default parameters based on prior knowledge
            self.parameters = {
                'heat_stress': {
                    'StressBuster': {'alpha': 8, 'beta': 2},
                    'YieldBooster': {'alpha': 3, 'beta': 2},
                    'NutrientBooster': {'alpha': 1, 'beta': 2}
                },
                'frost_stress': {
                    'StressBuster': {'alpha': 7, 'beta': 2},
                    'YieldBooster': {'alpha': 2, 'beta': 2},
                    'NutrientBooster': {'alpha': 1, 'beta': 2}
                },
                'drought_stress': {
                    'StressBuster': {'alpha': 7, 'beta': 2},
                    'YieldBooster': {'alpha': 3, 'beta': 2},
                    'NutrientBooster': {'alpha': 2, 'beta': 2}
                },
                'soil_quality_low': {
                    'StressBuster': {'alpha': 2, 'beta': 2},
                    'YieldBooster': {'alpha': 3, 'beta': 2},
                    'NutrientBooster': {'alpha': 8, 'beta': 2}
                }
            }
    
    def get_confidence(self, context_type, product):
        """Calculate confidence level for a recommendation (0-100%)"""
        alpha = self.parameters[context_type][product]['alpha']
        beta_val = self.parameters[context_type][product]['beta']
        total = alpha + beta_val
        
        # Higher total means more data points, higher confidence
        # Start with at least 10% confidence
        confidence = 10 + min(90, (total / 30) * 90)
        return round(confidence, 1)
    
    def _get_product_probability(self, context_type, product):
        """Get the probability that this product is the best for this context"""
        alpha = self.parameters[context_type][product]['alpha']
        beta_val = self.parameters[context_type][product]['beta']
        return alpha / (alpha + beta_val)
    
    def get_product_improvements(self, context):
        """Get expected improvement percentages for each product"""
        # Determine most important context factor
        context_factors = self._extract_context_factors(context)
        primary_context = max(context_factors, key=context_factors.get)
        
        # If soil quality is primary concern, use soil_quality_low
        if primary_context == 'soil_quality':
            primary_context = 'soil_quality_low'
        
        # Calculate expected improvement for each product
        improvements = {}
        for product in self.products:
            # Calculate base improvement (simple for hackathon)
            prob = self._get_product_probability(primary_context, product)
            
            # Scale to percentage improvement
            # The scaling factors come from the product documentation
            if product == 'StressBuster':
                # StressBuster averages 5.1% yield increase per documentation
                improvements[product] = round(prob * 10, 1)
            elif product == 'YieldBooster':
                # YieldBooster averages 7% yield increase per documentation
                improvements[product] = round(prob * 14, 1)
            elif product == 'NutrientBooster':
                # NutrientBooster effectiveness depends on soil conditions
                if primary_context == 'soil_quality_low':
                    improvements[product] = round(prob * 15, 1)
                else:
                    improvements[product] = round(prob * 8, 1)
        
        return improvements
    
    def _extract_context_factors(self, context):
        """Extract relevant factors from context dictionary"""
        context_factors = {
            'heat_stress': 0, 
            'frost_stress': 0, 
            'drought_stress': 0, 
            'soil_quality': 0
        }
        
        # Copy values from context if they exist
        for factor in context_factors:
            if factor in context:
                context_factors[factor] = context[factor]
        
        return context_factors
    
    def recommend(self, context, field_id=None, exploration_rate=0.1):
        """
        Recommend product using Thompson Sampling
        
        Args:
            context: Dict with risk values (heat_stress, frost_stress, etc.)
            field_id: Optional field ID for tracking
            exploration_rate: Probability of exploring vs exploiting
        """
        # Extract context factors
        context_factors = self._extract_context_factors(context)
        
        # Check if we're exploring (trying something potentially suboptimal)
        if np.random.random() < exploration_rate:
            # Choose a random product, weighted by overall probability
            weights = []
            for product in self.products:
                # Calculate average probability across context types
                prob_sum = 0
                for context_type in self.parameters:
                    prob_sum += self._get_product_probability(context_type, product)
                weights.append(prob_sum / len(self.parameters))
                
            weights = np.array(weights) / sum(weights)  # Normalize
            selected_product = np.random.choice(self.products, p=weights)
            is_exploration = True
        else:
            # Get dominant risk factor
            primary_factor = max(context_factors, key=context_factors.get)
            
            # If soil quality is primary concern, use soil_quality_low
            if primary_factor == 'soil_quality':
                primary_context = 'soil_quality_low'
            else:
                primary_context = primary_factor
            
            # Sample from posterior distribution for each product
            samples = {}
            for product in self.products:
                alpha = self.parameters[primary_context][product]['alpha']
                beta_val = self.parameters[primary_context][product]['beta']
                # Sample from Beta distribution (Thompson Sampling)
                samples[product] = np.random.beta(alpha, beta_val)
            
            # Choose product with highest sampled value
            selected_product = max(samples, key=samples.get)
            is_exploration = False
        
        # Get confidence for this recommendation
        primary_factor = max(context_factors, key=context_factors.get)
        if primary_factor == 'soil_quality':
            primary_context = 'soil_quality_low'
        else:
            primary_context = primary_factor
            
        confidence = self.get_confidence(primary_context, selected_product)
        
        # Save recommendation if database is available
        if self.db and field_id:
            rec_id = self.db.save_recommendation(
                field_id=field_id,
                date=datetime.now().strftime('%Y-%m-%d'),
                context=context,
                product=selected_product,
                confidence=confidence
            )
        else:
            rec_id = None
        
        # Get expected improvements for all products
        improvements = self.get_product_improvements(context)
        
        return {
            'recommendation_id': rec_id,
            'product': selected_product,
            'confidence': confidence,
            'primary_factor': primary_factor,
            'is_exploration': is_exploration,
            'expected_improvements': improvements,
            'timestamp': datetime.now().isoformat()
        }
    
    def update_from_feedback(self, context, product, success_rating):
        """
        Update model based on farmer feedback
        
        Args:
            context: Original context dict 
            product: Which product was recommended
            success_rating: Rating from 1-10 of how well it worked
        """
        # Determine which context factor was most relevant
        context_factors = self._extract_context_factors(context)
        primary_factor = max(context_factors, key=context_factors.get)
        
        # If soil quality is primary concern, use soil_quality_low
        if primary_factor == 'soil_quality':
            primary_context = 'soil_quality_low'
        else:
            primary_context = primary_factor
        
        # Get current parameters
        alpha = self.parameters[primary_context][product]['alpha']
        beta_val = self.parameters[primary_context][product]['beta']
        
        # Convert 1-10 rating to success/failure update
        # Ratings 7-10 are considered successes, 1-3 clear failures, 4-6 partial
        if success_rating >= 7:
            # Clear success - increment alpha
            alpha += 1
        elif success_rating <= 3:
            # Clear failure - increment beta
            beta_val += 1
        else:
            # Partial success - increment both but weighted
            alpha += (success_rating - 4) / 3
            beta_val += (7 - success_rating) / 3
        
        # Update our parameters
        self.parameters[primary_context][product]['alpha'] = alpha
        self.parameters[primary_context][product]['beta'] = beta_val
        
        # Update database if available
        if self.db:
            self.db.update_model_parameters(
                context_type=primary_context,
                product=product,
                alpha=alpha,
                beta=beta_val
            )
            
        return {
            'updated_context': primary_context,
            'new_alpha': alpha,
            'new_beta': beta_val
        }