// Test script to verify Gemini API is working
import { GoogleGenerativeAI } from '@google/generative-ai';

// Load env vars manually - REPLACE WITH YOUR ACTUAL VALUES
const GOOGLE_GEMINI_API_KEY = 'YOUR_API_KEY_HERE';
const GEMINI_MODEL = 'YOUR_MODEL_NAME_HERE';

async function testGemini() {
  try {
    console.log('Testing Gemini API...');
    console.log('API Key:', GOOGLE_GEMINI_API_KEY?.substring(0, 10) + '...');
    console.log('Model:', GEMINI_MODEL);
    
    const genAI = new GoogleGenerativeAI(GOOGLE_GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ 
      model: GEMINI_MODEL
    });
    
    const result = await model.generateContent({
      contents: [{ 
        role: 'user', 
        parts: [{ text: 'Say "Hello, API is working!" in JSON format: {"message": "your message"}' }] 
      }],
      generationConfig: {
        maxOutputTokens: 100,
      },
    });
    
    const response = result.response;
    const text = response.text();
    
    console.log('✓ API Response:', text);
    console.log('✓ Gemini API is working correctly!');
  } catch (error) {
    console.error('✗ Gemini API Error:', error.message);
    if (error.message?.includes('API_KEY_INVALID')) {
      console.error('The API key is invalid. Please check your .env file.');
    }
  }
}

testGemini();
