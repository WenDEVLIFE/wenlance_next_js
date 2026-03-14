export class GeminiService {
  private static readonly BASE_URL = 'https://generativelanguage.googleapis.com/v1beta';

  /**
   * Get API key from environment variables
   */
  private static get apiKey(): string | undefined {
    return process.env.NEXT_PUBLIC_GEMINI_API;
  }

  /**
   * Check if API key is configured
   */
  public static get isConfigured(): boolean {
    const key = this.apiKey;
    return key !== undefined && key.trim() !== '';
  }

  /**
   * Send a chat message to Gemini API
   * Returns the AI response or throws an error
   */
  public static async sendMessage({
    message,
    conversationHistory,
    systemContext,
    model = 'gemini-2.5-pro',
  }: {
    message: string;
    conversationHistory?: { role: string; content: string }[];
    systemContext?: string;
    model?: string;
  }): Promise<string> {
    const key = this.apiKey;
    if (!key || key.trim() === '') {
      throw new Error('Gemini API key not found. Please add NEXT_PUBLIC_GEMINI_API to your .env.local file');
    }

    try {
      // Build contents array for Gemini API format
      const contents: any[] = [];

      // Add system context as first message if provided
      if (systemContext && systemContext.trim() !== '') {
        contents.push({
          role: 'user',
          parts: [{ text: systemContext }],
        });
        // Add a model response to acknowledge system context
        contents.push({
          role: 'model',
          parts: [{
            text: 'I understand. I have access to your financial data and I will use the ACTUAL numbers from your database when answering questions. I\'m ready to help you with your expenses, salary, and projects.',
          }],
        });
      }

      // Add conversation history if provided
      if (conversationHistory && conversationHistory.length > 0) {
        for (const msg of conversationHistory) {
          contents.push({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.content }],
          });
        }
      }

      // Add current user message
      contents.push({
        role: 'user',
        parts: [{ text: message }],
      });

      // Debug: Log the context being sent (only in dev mode)
      if (process.env.NODE_ENV !== 'production' && systemContext) {
        console.log(`📊 Sending system context to Gemini (${systemContext.length} chars)`);
        console.log(`💬 User message: ${message}`);
      }

      const response = await fetch(
        `${this.BASE_URL}/models/${model}:generateContent?key=${key}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents,
            generationConfig: { temperature: 0.7, maxOutputTokens: 2000 },
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        const candidates = data.candidates;
        if (candidates && candidates.length > 0) {
          const candidate = candidates[0];
          const content = candidate.content;
          const parts = content?.parts;
          if (parts && parts.length > 0) {
            return parts[0].text;
          }
        }
        throw new Error('No response from Gemini API');
      } else {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error?.message || errorData.error?.status || 'Unknown error';
        throw new Error(`Gemini API error: ${errorMessage} (Status: ${response.status})`);
      }
    } catch (e: any) {
      if (e instanceof Error) {
        throw e;
      }
      throw new Error(`Failed to connect to Gemini API: ${e}`);
    }
  }
}
