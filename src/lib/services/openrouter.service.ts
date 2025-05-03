import type { SupabaseClient } from '@supabase/supabase-js';
import { OpenRouterLogger } from './openrouter.logger';

export class OpenRouterError extends Error {
  constructor(
    message: string,
    public readonly code: 'API_ERROR' | 'VALIDATION_ERROR' | 'RATE_LIMIT_ERROR' | 'UNEXPECTED_ERROR',
    public readonly cause?: unknown
  ) {
    super(message);
    this.name = 'OpenRouterError';
  }
}

export interface ModelConfig {
  model: string;
  maxTokens?: number;
  temperature?: number;
}

export interface ChatPayload {
  messages: {
    role: 'system' | 'user';
    content: string;
  }[];
  responseFormat?: {
    type: 'json_schema';
    schema: Record<string, any>;
  };
}

export interface ChatResponse {
  answer: string;
  metadata: {
    duration: number;
  };
}

const DEFAULT_MODEL_CONFIG: ModelConfig = {
  model: 'deepseek/deepseek-chat-v3-0324:free',
  maxTokens: 1000,
  temperature: 0.7,
};

export class OpenRouterService {
  private readonly apiKey: string;
  private readonly apiUrl: string;
  private modelConfig: ModelConfig;
  private readonly maxRetries = 3;
  private readonly retryDelay = 1000; // 1 second
  private readonly logger: OpenRouterLogger;

  constructor(config: Partial<ModelConfig> = {}) {
    this.apiKey = import.meta.env.OPENROUTER_API_KEY;
    this.apiUrl = 'https://openrouter.ai/api/v1/chat/completions';
    this.modelConfig = { ...DEFAULT_MODEL_CONFIG, ...config };
    this.logger = new OpenRouterLogger();

    if (!this.apiKey) {
      throw new OpenRouterError(
        'OpenRouter API key is not configured',
        'UNEXPECTED_ERROR'
      );
    }
  }

  private validateInput(payload: ChatPayload): void {
    if (!Array.isArray(payload.messages) || payload.messages.length === 0) {
      throw new OpenRouterError(
        'Messages array must not be empty',
        'VALIDATION_ERROR'
      );
    }

    for (const message of payload.messages) {
      if (!message.content || typeof message.content !== 'string') {
        throw new OpenRouterError(
          'Each message must have a content string',
          'VALIDATION_ERROR'
        );
      }
      if (!['system', 'user'].includes(message.role)) {
        throw new OpenRouterError(
          'Message role must be either "system" or "user"',
          'VALIDATION_ERROR'
        );
      }
    }

    if (payload.responseFormat) {
      if (payload.responseFormat.type !== 'json_schema' || !payload.responseFormat.schema) {
        throw new OpenRouterError(
          'Invalid response format configuration',
          'VALIDATION_ERROR'
        );
      }
    }
  }

  public setModelConfig(config: Partial<ModelConfig>): void {
    // Validate model name if provided
    if (config.model && typeof config.model !== 'string') {
      throw new OpenRouterError(
        'Model name must be a string',
        'VALIDATION_ERROR'
      );
    }

    // Validate maxTokens if provided
    if (config.maxTokens !== undefined) {
      if (!Number.isInteger(config.maxTokens) || config.maxTokens <= 0) {
        throw new OpenRouterError(
          'maxTokens must be a positive integer',
          'VALIDATION_ERROR'
        );
      }
    }

    // Validate temperature if provided
    if (config.temperature !== undefined) {
      if (typeof config.temperature !== 'number' || config.temperature < 0 || config.temperature > 1) {
        throw new OpenRouterError(
          'temperature must be a number between 0 and 1',
          'VALIDATION_ERROR'
        );
      }
    }

    this.modelConfig = { ...this.modelConfig, ...config };
  }

  private buildRequestBody(payload: ChatPayload): Record<string, any> {
    // Validate input before building request
    this.validateInput(payload);

    return {
      model: this.modelConfig.model,
      messages: payload.messages,
      max_tokens: this.modelConfig.maxTokens,
      temperature: this.modelConfig.temperature,
      response_format: payload.responseFormat ?? {
        type: 'json_schema',
        schema: {
          type: 'object',
          properties: {
            answer: { type: 'string' },
            metadata: {
              type: 'object',
              properties: {
                duration: { type: 'number' }
              },
              required: ['duration']
            }
          },
          required: ['answer', 'metadata']
        }
      }
    };
  }

  private async retryWithBackoff<T>(operation: () => Promise<T>, attempt = 1): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      if (error instanceof OpenRouterError && error.code === 'API_ERROR' && attempt < this.maxRetries) {
        // Wait with exponential backoff
        await new Promise(resolve => setTimeout(resolve, this.retryDelay * Math.pow(2, attempt - 1)));
        return this.retryWithBackoff(operation, attempt + 1);
      }
      throw error;
    }
  }

  public async sendChatRequest(payload: ChatPayload): Promise<ChatResponse> {
    const requestId = Math.random().toString(36).substring(7);
    const startTime = Date.now();
    this.logger.logRequestStart(requestId, this.modelConfig.model, payload.messages?.length || 0);

    return this.retryWithBackoff(async () => {
      try {
        const requestBody = this.buildRequestBody(payload);
        const response = await fetch(this.apiUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': '$SITE_URL',
            'X-Title': 'TripFit',
            'X-Request-ID': requestId
          },
          body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
          const error = await response.json().catch(() => ({ error: 'Unknown error' }));
          const duration = Date.now() - startTime;
          
          if (response.status === 429) {
            const rateLimitError = new OpenRouterError(
              'Rate limit exceeded',
              'RATE_LIMIT_ERROR',
              error
            );
            this.logger.logRequestError(
              requestId,
              this.modelConfig.model,
              payload.messages?.length || 0,
              duration,
              rateLimitError
            );
            throw rateLimitError;
          }
          
          const apiError = new OpenRouterError(
            `API request failed: ${error.error || response.statusText}`,
            'API_ERROR',
            error
          );
          this.logger.logRequestError(
            requestId,
            this.modelConfig.model,
            payload.messages?.length || 0,
            duration,
            apiError
          );
          throw apiError;
        }

        const data = await response.json();
        const duration = Date.now() - startTime;

        // Extract the response content from the API response
        const content = data.choices?.[0]?.message?.content;
        if (!content) {
          const error = new OpenRouterError(
            'Invalid response format from API',
            'API_ERROR',
            data
          );
          this.logger.logRequestError(
            requestId,
            this.modelConfig.model,
            payload.messages?.length || 0,
            duration,
            error
          );
          throw error;
        }

        // Parse the JSON response
        let parsedContent: ChatResponse;
        try {
          parsedContent = JSON.parse(content);
        } catch (error) {
          const parseError = new OpenRouterError(
            'Failed to parse API response as JSON',
            'API_ERROR',
            { content, error }
          );
          this.logger.logRequestError(
            requestId,
            this.modelConfig.model,
            payload.messages?.length || 0,
            duration,
            parseError
          );
          throw parseError;
        }

        // Validate the response format
        if (!parsedContent.answer || typeof parsedContent.metadata?.duration !== 'number') {
          const validationError = new OpenRouterError(
            'Invalid response format from API',
            'VALIDATION_ERROR',
            parsedContent
          );
          this.logger.logRequestError(
            requestId,
            this.modelConfig.model,
            payload.messages?.length || 0,
            duration,
            validationError
          );
          throw validationError;
        }

        const result = {
          answer: parsedContent.answer,
          metadata: {
            duration: parsedContent.metadata.duration || duration / 1000
          }
        };

        this.logger.logRequestComplete(
          requestId,
          this.modelConfig.model,
          payload.messages?.length || 0,
          duration
        );
        return result;
      } catch (error) {
        const duration = Date.now() - startTime;
        if (!(error instanceof OpenRouterError)) {
          this.logger.logRequestError(
            requestId,
            this.modelConfig.model,
            payload.messages?.length || 0,
            duration,
            error instanceof Error ? error : 'Unknown error'
          );
          throw new OpenRouterError(
            'Unexpected error during API request',
            'UNEXPECTED_ERROR',
            error
          );
        }
        throw error;
      }
    });
  }
}