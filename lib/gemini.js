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
      maxOutputTokens: 4096, // Increased to prevent truncation
      candidateCount: 1,
    };

    const result = await model.generateContent({
      contents: [{ 
        role: 'user', 
        parts: [{ text: `${systemPrompt}\n\nRoast this startup idea and give 10 problems with solutions:\n\n"${ideaText}"` }] 
      }],
      generationConfig,
    });

    const response = result.response;
    const text = response.text();

    console.log('Gemini raw response length:', text.length);

    // Parse JSON response
    try {
      // Try to extract JSON from markdown code blocks
      let jsonString = text;
      
      const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || 
                        text.match(/```\s*([\s\S]*?)\s*```/);
      
      if (jsonMatch) {
        jsonString = jsonMatch[1];
      }
      
      // Clean up the string
      jsonString = jsonString.trim();
      
      // Try to parse
      const parsed = JSON.parse(jsonString);
      
      // Validate structure
      if (!parsed.roast || !Array.isArray(parsed.problems)) {
        throw new Error('Invalid response structure: missing roast or problems array');
      }
      
      if (parsed.problems.length < 10) {
        console.warn(`Only got ${parsed.problems.length} problems, expected 10`);
      }
      
      // Ensure we have exactly 10 problems (pad if needed)
      while (parsed.problems.length < 10) {
        parsed.problems.push({
          problem: "Additional challenge to consider",
          solution: "Conduct thorough research and planning to address this area."
        });
      }
      
      // Trim to exactly 10
      parsed.problems = parsed.problems.slice(0, 10);
      
      return parsed;
    } catch (parseError) {
      console.error('Failed to parse JSON response:', parseError.message);
      console.error('Raw response (first 500 chars):', text.substring(0, 500));
      throw new Error('Failed to generate valid response');
    }
  } catch (error) {
    console.error('Error generating roast:', error);
    throw error;
  }
}