export interface OpenRouterLogEntry {
  requestId: string;
  timestamp: string;
  model: string;
  messageCount: number;
  status: 'started' | 'completed' | 'failed';
  duration?: number;
  error?: string;
}

export class OpenRouterLogger {
  private static formatLogEntry(entry: OpenRouterLogEntry): string {
    const baseLog = `[OpenRouter] Request ${entry.requestId} ${entry.status} at ${entry.timestamp}`;
    const details = {
      model: entry.model,
      messageCount: entry.messageCount,
      ...(entry.duration !== undefined && { durationMs: entry.duration }),
      ...(entry.error && { error: entry.error })
    };

    return `${baseLog} ${JSON.stringify(details)}`;
  }

  public logRequestStart(requestId: string, model: string, messageCount: number): void {
    const entry: OpenRouterLogEntry = {
      requestId,
      timestamp: new Date().toISOString(),
      model,
      messageCount,
      status: 'started'
    };

    console.info(OpenRouterLogger.formatLogEntry(entry));
  }

  public logRequestComplete(
    requestId: string,
    model: string,
    messageCount: number,
    duration: number
  ): void {
    const entry: OpenRouterLogEntry = {
      requestId,
      timestamp: new Date().toISOString(),
      model,
      messageCount,
      status: 'completed',
      duration
    };

    console.info(OpenRouterLogger.formatLogEntry(entry));
  }

  public logRequestError(
    requestId: string,
    model: string,
    messageCount: number,
    duration: number,
    error: Error | string
  ): void {
    const entry: OpenRouterLogEntry = {
      requestId,
      timestamp: new Date().toISOString(),
      model,
      messageCount,
      status: 'failed',
      duration,
      error: error instanceof Error ? error.message : error
    };

    console.error(OpenRouterLogger.formatLogEntry(entry));
  }
}