import { createHash } from "crypto";
import type { JourneyDTO } from "../../types";
import { OpenRouterService, type ChatPayload } from "./openrouter.service";

export interface AIModelConfig {
    model: string;
    temperature?: number;
    maxTokens?: number;
}

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
- The requested activities and their skill levels (rated from 1 to 5, where 1 is beginner and 5 is expert)
- Local climate and seasonal considerations
- Practical logistics and travel tips`;

        const activitiesString = journey.activities
            ? `Activities and their level of advancement:\n${journey.activities}`
            : "No specific activities mentioned";

        const userPrompt = `Please create a detailed travel plan for:
Destination: ${journey.destination}
Duration: From ${journey.departure_date} to ${journey.return_date}
Activities: ${activitiesString}
Additional Notes: ${journey.additional_notes.join(", ")}

For each activity, provide recommendations appropriate for the specified skill level (1-5 scale).
Include daily itineraries, suggested accommodations, and local transportation tips. 
Remember about easy readability and add icons to highlight main points.`;

        return {
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt },
            ],
        };
    }

    async generateTravelPlan(journey: JourneyDTO, planPreferences?: Record<string, any>) {
        try {
            const prompt = this.buildTravelPlanPrompt(journey);
            const sourceText = JSON.stringify({ journey, planPreferences });
            const sourceTextHash = createHash("sha256").update(sourceText).digest("hex");

            const response = await this.openRouterService.sendChatRequest(prompt);

            return {
                generatedText: response.answer,
                model: this.modelConfig.model,
                sourceTextHash,
                sourceTextLength: sourceText.length,
                metadata: response.metadata,
            };
        } catch (error) {
            if (error instanceof Error) {
                throw new AIServiceError(error.message, error.name, error);
            }
            throw new AIServiceError("Unknown error occurred during travel plan generation", "UNKNOWN_ERROR", error);
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
        this.name = "AIServiceError";
    }
}
