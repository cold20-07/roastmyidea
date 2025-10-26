import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY);

export const getGeminiModel = () => {
  return genAI.getGenerativeModel({ 
    model: process.env.GEMINI_MODEL || 'gemini-1.5-pro' 
  });
};

export async function generateRoast(ideaText) {
  try {
    const model = getGeminiModel();
    
    const systemPrompt = `You are a witty startup advisor who roasts ideas before giving serious feedback. Your job is to:

1. Write ONE paragraph (100-200 words) roasting the user's idea. Be funny and sarcastic, but not cruel. Point out obvious flaws, reference similar failed attempts, and exaggerate problems for comedic effect. End with a subtle backhanded compliment.

2. List exactly 10 realistic problems they'll face, each with a practical solution:
   - Problems should cover: market validation (1-2), technical challenges (2-3), business model (1-2), competition (1), user acquisition (1-2), and scaling (1).
   - Solutions should be specific, actionable, and honest about difficulty.
   - Avoid generic advice like "work hard" or "believe in yourself".

Format your response as JSON:
{
  "roast": "your roast paragraph here",
  "problems": [
    {
      "problem": "specific problem statement",
      "solution": "actionable solution in 2-3 sentences"
    }
  ]
}

DO NOT include any explanations, markdown formatting, or text outside of the JSON structure. ONLY return the JSON object.`;

    const generationConfig = {
      temperature: 0.85,
      topP: 0.8,
      topK: 40,
      maxOutputTokens: 2000, // Reduced for faster response
      candidateCount: 1,
    };

    const chat = model.startChat({
      generationConfig,
      history: [
        {
          role: 'user',
          parts: [{ text: systemPrompt }],
        },
        {
          role: 'model',
          parts: [{ text: "I understand. I'll generate creative roasts and practical problems/solutions in the specified JSON structure." }],
        },
      ],
    });

    const result = await chat.sendMessage(`Roast this startup idea and give 10 problems with solutions:\n\n"${ideaText}"`);
    const response = result.response;
    const text = response.text();

    // Parse JSON response
    try {
      const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || 
                        text.match(/```\s*([\s\S]*?)\s*```/) || 
                        [null, text];
      
      const jsonString = jsonMatch[1].trim();
      const parsed = JSON.parse(jsonString);
      
      // Validate structure
      if (!parsed.roast || !Array.isArray(parsed.problems) || parsed.problems.length !== 10) {
        throw new Error('Invalid response structure');
      }
      
      return parsed;
    } catch (parseError) {
      console.error('Failed to parse JSON response:', parseError);
      console.error('Raw response:', text);
      throw new Error('Failed to generate valid response');
    }
  } catch (error) {
    console.error('Error generating roast:', error);
    throw error;
  }
}