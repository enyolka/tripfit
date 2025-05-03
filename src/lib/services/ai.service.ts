import { createHash } from "crypto";
import type { JourneyDTO } from "../../types";
import { OpenRouterService, type ChatPayload } from "./openrouter.service";

export type AIModelConfig = {
  model: string;
  temperature?: number;
  maxTokens?: number;
};

const DEFAULT_MODEL_CONFIG: AIModelConfig = {
  model: "deepseek/deepseek-chat-v3-0324:free",
  temperature: 0.7,
  maxTokens: 2048,
};

export class AIService {
  private modelConfig: AIModelConfig;
  private openRouterService: OpenRouterService;

  constructor(config: Partial<AIModelConfig> = {}) {
    this.modelConfig = { ...DEFAULT_MODEL_CONFIG, ...config };
    this.openRouterService = new OpenRouterService({
      model: this.modelConfig.model,
      temperature: this.modelConfig.temperature,
      maxTokens: this.modelConfig.maxTokens,
    });
  }

  private buildTravelPlanPrompt(journey: JourneyDTO): ChatPayload {
    const systemPrompt = `You are an expert travel planner with deep knowledge of destinations worldwide. 
Your task is to create a detailed, personalized travel plan that matches the user's preferences and skill levels for activities.
Your response should be well-structured and consider:
- The destination's unique features and attractions
- The specified time frame
- The requested activities and their difficulty levels
- Local climate and seasonal considerations
- Practical logistics and travel tips`;

    const userPrompt = `Please create a detailed travel plan for:
Destination: ${journey.destination}
Duration: From ${journey.departure_date} to ${journey.return_date}
Activities: ${journey.activities || 'No specific activities mentioned'}
Additional Notes: ${journey.additional_notes.join(', ')}

For each activity, consider the skill level requirements and provide appropriate recommendations.
Include daily itineraries, suggested accommodations, and local transportation tips. 
Result write in polish, and use simple formatting for easy readability and icons to highlight main points.`;

    return {
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ]
    };
  }

  async generateTravelPlan(journey: JourneyDTO, planPreferences?: Record<string, any>) {
    try {
      const prompt = this.buildTravelPlanPrompt(journey);
      const sourceText = JSON.stringify({ journey, planPreferences });
      const sourceTextHash = createHash('sha256').update(sourceText).digest('hex');

      const response = await this.openRouterService.sendChatRequest(prompt);
      
      return {
        generatedText: response.answer,
        model: this.modelConfig.model,
        sourceTextHash,
        sourceTextLength: sourceText.length,
        metadata: response.metadata
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new AIServiceError(
          error.message,
          error.name,
          error
        );
      }
      throw new AIServiceError(
        "Unknown error occurred during travel plan generation",
        "UNKNOWN_ERROR",
        error
      );
    }
  }
}

export class AIServiceError extends Error {
  constructor(
    message: string,
    public code: string,
    public cause?: unknown
  ) {
    super(message);
    this.name = 'AIServiceError';
  }
}