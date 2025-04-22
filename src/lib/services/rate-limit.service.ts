import type { SupabaseClient } from "../../db/supabase.client";

export class RateLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RateLimitError';
  }
}

export class RateLimitService {
  private readonly WINDOW_SIZE_MINUTES = 60; // 1 hour window
  private readonly MAX_GENERATIONS_PER_WINDOW = 10; // 10 generations per hour

  constructor(private readonly supabase: SupabaseClient) {}

  async checkRateLimit(journeyId: number): Promise<void> {
    const windowStart = new Date();
    windowStart.setMinutes(windowStart.getMinutes() - this.WINDOW_SIZE_MINUTES);

    // Count generations in the current time window
    const { count, error } = await this.supabase
      .from('generations')
      .select('*', { count: 'exact', head: true })
      .eq('journey_id', journeyId)
      .gte('created_at', windowStart.toISOString());

    if (error) {
      throw new Error('Failed to check rate limit: ' + error.message);
    }

    if (count && count >= this.MAX_GENERATIONS_PER_WINDOW) {
      throw new RateLimitError(
        `Rate limit exceeded. Maximum ${this.MAX_GENERATIONS_PER_WINDOW} generations per ${this.WINDOW_SIZE_MINUTES} minutes.`
      );
    }
  }
}