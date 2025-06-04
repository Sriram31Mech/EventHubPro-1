import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

export async function generateEventDescription(
  title: string, 
  venue: string, 
  eventType?: string, 
  location?: string
): Promise<string> {
  try {
    const prompt = `Generate a compelling and professional event description for the following event:

Event Title: ${title}
Venue: ${venue}
Event Type: ${eventType || 'conference'}
Location: ${location || 'venue location'}

Create an engaging description that:
- Highlights the value proposition of attending
- Mentions networking opportunities
- Emphasizes learning and growth potential
- Uses professional yet inviting language
- Is between 100-200 words
- Sounds authentic and not overly promotional

Please respond with only the description text, no additional formatting or labels.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert event marketing copywriter who creates compelling event descriptions that attract attendees and clearly communicate value."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 300,
      temperature: 0.7,
    });

    const description = response.choices[0].message.content;
    
    if (!description) {
      throw new Error("No description generated");
    }

    return description;
  } catch (error: any) {
    console.error("Error generating event description:", error);
    
    if (error.code === 'insufficient_quota') {
      throw new Error("AI service quota exceeded. Please try again later.");
    } else if (error.code === 'invalid_api_key') {
      throw new Error("AI service configuration error. Please contact support.");
    } else if (error.code === 'rate_limit_exceeded') {
      throw new Error("Too many requests. Please wait a moment and try again.");
    }
    
    throw new Error("Failed to generate description. Please try again or write your own description.");
  }
}

// Alternative function for batch description generation if needed
export async function generateMultipleDescriptions(
  events: Array<{ title: string; venue: string; eventType?: string; location?: string }>
): Promise<string[]> {
  try {
    const descriptions = await Promise.all(
      events.map(event => generateEventDescription(
        event.title, 
        event.venue, 
        event.eventType, 
        event.location
      ))
    );
    return descriptions;
  } catch (error) {
    console.error("Error generating multiple descriptions:", error);
    throw new Error("Failed to generate descriptions for multiple events");
  }
}
