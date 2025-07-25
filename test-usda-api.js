// Quick test script for USDA API key
const testUSDAKey = async (apiKey) => {
  const testUrl = `https://api.nal.usda.gov/fdc/v1/foods/search?query=chicken%20breast&api_key=${apiKey}&pageSize=1`;
  
  try {
    const response = await fetch(testUrl);
    const data = await response.json();
    
    if (response.ok && data.foods) {
      console.log('✅ USDA API key works! Found food:', data.foods[0]?.description);
      console.log('Food ID:', data.foods[0]?.fdcId);
      return true;
    } else {
      console.log('❌ API key test failed:', data);
      return false;
    }
  } catch (error) {
    console.log('❌ Network error:', error.message);
    return false;
  }
};

// Replace with your actual API key
const API_KEY = 'your_api_key_here';
testUSDAKey(API_KEY);