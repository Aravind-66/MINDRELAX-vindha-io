import { GoogleGenAI } from '@google/genai';

export async function generateMindaResponse(userMessage: string, profileContext?: any): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return "Minda is temporarily resting. You can still explore meditation, journaling, and relaxation tools!";
  }

  try {
    const ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });

    const userMood = profileContext?.current_mood || 'Neutral';
    const userName = profileContext?.display_name || 'Friend';
    const userGoals = Array.isArray(profileContext?.wellness_goals) ? profileContext.wellness_goals.join(', ') : 'wellness and peace';

    const systemInstruction = `You are Minda, a compassionate, warm, and supportive AI Mental Wellness Assistant for the platform "MindRelax".
The user's name is ${userName}. Their current logged mood is "${userMood}". Their primary goals are: ${userGoals}.

YOUR RESPONSIBILITIES & STYLE:
1. Provide empathetic emotional support, stress-management suggestions, mindfulness exercises, journaling prompts, and gentle encouragement.
2. Keep responses warm, supportive, calming, and concise (1-3 paragraphs maximum).
3. Offer concrete, actionable wellness steps (e.g., 2-minute breathing exercise, writing a gratitude list, listening to ocean waves).

CRITICAL SAFETY DIRECTIVE:
- You are NOT a doctor, therapist, counselor, or medical professional.
- Do NOT diagnose medical or psychological conditions, and do NOT prescribe medication.
- If the user expresses self-harm, suicidal thoughts, severe physical/mental trauma, or extreme emergency crisis:
  Immediately, gently, and clearly express concern and provide crisis helpline resources:
  "If you or someone you know is struggling or in crisis, help is available. You are not alone. Please contact emergency services (911) or call/text 988 for the 988 Suicide & Crisis Lifeline (US/Canada), or reach out to your local health care provider."`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: userMessage,
      config: {
        systemInstruction,
        temperature: 0.7
      }
    });

    return response.text?.trim() || "I am here with you. Take a deep breath and let me know how I can support your calm today.";
  } catch (error) {
    console.error('Error in Minda Gemini response:', error);
    return "Minda is temporarily resting. You can still explore meditation, journaling, and relaxation tools!";
  }
}
