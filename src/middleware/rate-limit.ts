interface RateLimitData {
    count: number;
    resetAt: number;
}

const store = new Map<string, RateLimitData>();

export class RateLimiter {
    private readonly maxAttempts: number;
    private readonly windowMs: number;

    constructor(maxAttempts = 5, windowMs = 15 * 60 * 1000) {
        // 5 attempts per 15 minutes
        this.maxAttempts = maxAttempts;
        this.windowMs = windowMs;
    }

    check(key: string): boolean {
        this.cleanup();

        const now = Date.now();
        const data = store.get(key);

        if (!data) {
            store.set(key, { count: 1, resetAt: now + this.windowMs });
            return true;
        }

        if (now > data.resetAt) {
            store.set(key, { count: 1, resetAt: now + this.windowMs });
            return true;
        }

        if (data.count >= this.maxAttempts) {
            return false;
        }

        data.count += 1;
        store.set(key, data);
        return true;
    }

    getRemainingAttempts(key: string): number {
        const data = store.get(key);
        if (!data) return this.maxAttempts;

        if (Date.now() > data.resetAt) {
            store.delete(key);
            return this.maxAttempts;
        }

        return Math.max(0, this.maxAttempts - data.count);
    }

    private cleanup() {
        const now = Date.now();
        for (const [key, data] of store.entries()) {
            if (now > data.resetAt) {
                store.delete(key);
            }
        }
    }
}
