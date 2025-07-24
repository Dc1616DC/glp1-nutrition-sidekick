/**
 * Unified unit conversion service for all nutrition calculations
 * This is the single source of truth for converting ingredient amounts to grams
 */

import { UNIT_CONVERSIONS, FOOD_SPECIFIC_CONVERSIONS, findClosestMatch } from '../data/commonNutrition';

export interface ConversionResult {
  grams: number;
  confidence: 'high' | 'medium' | 'low';
  conversionUsed: string;
  warnings: string[];
}

export class UnitConversionService {
  
  /**
   * Convert any ingredient amount to grams with validation and logging
   */
  convertToGrams(
    amount: number, 
    unit: string, 
    foodName?: string,
    logConversions = false
  ): ConversionResult {
    const warnings: string[] = [];
    let confidence: 'high' | 'medium' | 'low' = 'high';
    let conversionUsed = '';
    
    // Input validation
    if (amount <= 0) {
      warnings.push(`Invalid amount: ${amount}`);
      return { grams: 100, confidence: 'low', conversionUsed: 'fallback', warnings };
    }
    
    const unitLower = unit.toLowerCase().trim();
    let grams = 0;
    
    // Try food-specific conversion first (most accurate)
    if (foodName) {
      const foodKey = findClosestMatch(foodName.toLowerCase());
      if (foodKey && FOOD_SPECIFIC_CONVERSIONS[foodKey]?.[unitLower]) {
        grams = amount * FOOD_SPECIFIC_CONVERSIONS[foodKey][unitLower];
        conversionUsed = `food-specific: ${foodKey}[${unitLower}] = ${FOOD_SPECIFIC_CONVERSIONS[foodKey][unitLower]}g`;
        confidence = 'high';
        
        if (logConversions) {
          console.log(`🔄 Food-specific conversion: ${amount} ${unit} ${foodName} = ${grams}g (${conversionUsed})`);
        }
      }
    }
    
    // Fall back to generic conversion
    if (grams === 0) {
      if (UNIT_CONVERSIONS[unitLower]) {
        grams = amount * UNIT_CONVERSIONS[unitLower];
        conversionUsed = `generic: ${unitLower} = ${UNIT_CONVERSIONS[unitLower]}g`;
        confidence = foodName ? 'medium' : 'high'; // Lower confidence if we expected food-specific but used generic
        
        if (logConversions) {
          console.log(`🔄 Generic conversion: ${amount} ${unit} ${foodName || ''} = ${grams}g (${conversionUsed})`);
        }
      } else {
        // Unknown unit - use reasonable default
        grams = amount * 100; // Assume 100g per unit
        conversionUsed = `fallback: unknown unit '${unit}' = 100g`;
        confidence = 'low';
        warnings.push(`Unknown unit '${unit}', assuming 100g per unit`);
        
        if (logConversions) {
          console.log(`⚠️ Unknown unit conversion: ${amount} ${unit} ${foodName || ''} = ${grams}g (fallback)`);
        }
      }
    }
    
    // Validate conversion result
    const validation = this.validateConversion(amount, unit, grams, foodName);
    warnings.push(...validation.warnings);
    if (!validation.isValid) {
      confidence = 'low';
    }
    
    return {
      grams: Math.round(grams * 10) / 10, // Round to 1 decimal
      confidence,
      conversionUsed,
      warnings
    };
  }
  
  /**
   * Validate that a unit conversion result makes sense
   */
  private validateConversion(
    amount: number, 
    unit: string, 
    grams: number, 
    foodName?: string
  ): { isValid: boolean; warnings: string[] } {
    const warnings: string[] = [];
    const unitLower = unit.toLowerCase().trim();
    const ratio = grams / amount;
    
    // Validate common unit conversions
    switch (unitLower) {
      case 'oz':
      case 'ounce':
      case 'ounces':
        if (ratio < 15 || ratio > 40) {
          warnings.push(`Suspicious oz conversion: ${amount} oz = ${grams}g (${ratio.toFixed(1)}g/oz)`);
        }
        break;
        
      case 'cup':
      case 'cups':
        if (ratio < 20 || ratio > 500) {
          warnings.push(`Suspicious cup conversion: ${amount} cup = ${grams}g (${ratio.toFixed(1)}g/cup)`);
        }
        break;
        
      case 'tbsp':
      case 'tablespoon':
      case 'tablespoons':
        if (ratio < 3 || ratio > 30) {
          warnings.push(`Suspicious tbsp conversion: ${amount} tbsp = ${grams}g (${ratio.toFixed(1)}g/tbsp)`);
        }
        break;
        
      case 'tsp':
      case 'teaspoon':
      case 'teaspoons':
        if (ratio < 2 || ratio > 15) {
          warnings.push(`Suspicious tsp conversion: ${amount} tsp = ${grams}g (${ratio.toFixed(1)}g/tsp)`);
        }
        break;
        
      case 'lb':
      case 'pound':
      case 'pounds':
        if (ratio < 400 || ratio > 500) {
          warnings.push(`Suspicious lb conversion: ${amount} lb = ${grams}g (${ratio.toFixed(1)}g/lb)`);
        }
        break;
    }
    
    // Additional food-specific validation
    if (foodName) {
      const name = foodName.toLowerCase();
      
      // Liquid vs solid validation
      if ((name.includes('milk') || name.includes('water') || name.includes('juice')) && 
          unitLower === 'cup' && (ratio < 200 || ratio > 250)) {
        warnings.push(`Liquid should be ~240g per cup, got ${ratio.toFixed(1)}g/cup for ${foodName}`);
      }
      
      // Dense foods validation
      if ((name.includes('nuts') || name.includes('seeds')) && 
          unitLower === 'cup' && ratio < 100) {
        warnings.push(`Dense foods like ${foodName} seem light at ${ratio.toFixed(1)}g/cup`);
      }
      
      // Light foods validation
      if ((name.includes('lettuce') || name.includes('spinach') || name.includes('herbs')) && 
          unitLower === 'cup' && ratio > 100) {
        warnings.push(`Light foods like ${foodName} seem heavy at ${ratio.toFixed(1)}g/cup`);
      }
    }
    
    return {
      isValid: warnings.length === 0,
      warnings
    };
  }
  
  /**
   * Get all available units for a specific food
   */
  getAvailableUnits(foodName?: string): string[] {
    const genericUnits = Object.keys(UNIT_CONVERSIONS);
    
    if (!foodName) {
      return genericUnits;
    }
    
    const foodKey = findClosestMatch(foodName.toLowerCase());
    if (foodKey && FOOD_SPECIFIC_CONVERSIONS[foodKey]) {
      const foodSpecificUnits = Object.keys(FOOD_SPECIFIC_CONVERSIONS[foodKey]);
      const allUnits = [...foodSpecificUnits, ...genericUnits];
      return Array.from(new Set(allUnits));
    }
    
    return genericUnits;
  }
  
  /**
   * Get conversion information for debugging
   */
  getConversionInfo(amount: number, unit: string, foodName?: string): {
    hasSpecificConversion: boolean;
    specificConversion?: number;
    genericConversion?: number;
    recommendedConversion: number;
  } {
    const unitLower = unit.toLowerCase().trim();
    let hasSpecificConversion = false;
    let specificConversion: number | undefined;
    let genericConversion: number | undefined;
    
    // Check for food-specific conversion
    if (foodName) {
      const foodKey = findClosestMatch(foodName.toLowerCase());
      if (foodKey && FOOD_SPECIFIC_CONVERSIONS[foodKey]?.[unitLower]) {
        hasSpecificConversion = true;
        specificConversion = FOOD_SPECIFIC_CONVERSIONS[foodKey][unitLower];
      }
    }
    
    // Check generic conversion
    if (UNIT_CONVERSIONS[unitLower]) {
      genericConversion = UNIT_CONVERSIONS[unitLower];
    }
    
    const recommendedConversion = specificConversion || genericConversion || 100;
    
    return {
      hasSpecificConversion,
      specificConversion,
      genericConversion,
      recommendedConversion
    };
  }
  
  /**
   * Batch convert multiple ingredients
   */
  batchConvertToGrams(ingredients: Array<{
    amount: number;
    unit: string;
    name: string;
  }>): Array<ConversionResult & { name: string }> {
    return ingredients.map(ingredient => ({
      name: ingredient.name,
      ...this.convertToGrams(ingredient.amount, ingredient.unit, ingredient.name, true)
    }));
  }
}

export const unitConversionService = new UnitConversionService();