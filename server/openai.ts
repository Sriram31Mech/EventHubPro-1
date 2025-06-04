import type { Response } from 'node-fetch';
import fetch from 'node-fetch';

const GEMINI_API_KEY = "AIzaSyDMxVE4pjhhapWPWhoPPNR-S4hY60wDZQI";
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

interface GeminiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
}

export async function generateEventDescription(
  title: string, 
  venue: string, 
  eventType?: string, 
  location?: string
): Promise<string> {
  try {
    const prompt = `Write an engaging event description for:
${title} at ${venue}

Additional details:
- Type: ${eventType || 'conference'}
- Location: ${location || venue}

The description should:
1. Be professional and engaging
2. Highlight key benefits of attending
3. Mention networking opportunities
4. Focus on learning and growth
5. Be between 100-200 words
6. Sound natural and inviting`;

    const response: Response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ]
      })
    });

    if (!response.ok) {
      const errorData: any = await response.json();
      console.error('Gemini API Error:', errorData);
      
      if (response.status === 429) {
        throw new Error("Rate limit reached. Please try again in a few moments.");
      }
      if (response.status === 403) {
        throw new Error("API key error. Please contact support.");
      }
      throw new Error("Failed to generate description. Please try again.");
    }

    const data: GeminiResponse = await response.json();
    
    if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
      throw new Error("No valid response from AI service");
    }

    const generatedText = data.candidates[0].content.parts[0].text.trim();

    // Validate the generated text
    if (!generatedText || generatedText.length < 50) {
      throw new Error("Generated description is too short or empty");
    }

    return generatedText;
  } catch (error: any) {
    console.error("Error in generateEventDescription:", error);
    
    // Map specific errors to user-friendly messages
    if (error.message?.includes("API key")) {
      throw new Error("API configuration issue. Please contact support.");
    }
    if (error.message?.includes("rate limit")) {
      throw new Error("Service is busy. Please try again in a few moments.");
    }
    if (error.message?.includes("too short")) {
      throw new Error("Could not generate a suitable description. Please try again.");
    }
    
    throw new Error(error.message || "Failed to generate description. Please try again.");
  }
}

// Helper function for batch generation
export async function generateMultipleDescriptions(
  events: Array<{ title: string; venue: string; eventType?: string; location?: string }>
): Promise<string[]> {
  const results = await Promise.allSettled(
    events.map(event => 
      generateEventDescription(
        event.title,
        event.venue,
        event.eventType,
        event.location
      )
    )
  );
  
  const descriptions = results.map(result => {
    if (result.status === 'fulfilled') {
      return result.value;
    }
    console.error('Failed to generate description:', result.reason);
    return 'Description generation failed. Please try again.';
  });

  return descriptions;
}
