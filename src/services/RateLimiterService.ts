import { injectable } from "tsyringe";
import { RateLimiterMemory } from "rate-limiter-flexible";

@injectable()
export class RateLimiterService {
    private limiter: RateLimiterMemory;

    constructor() {
        this.limiter = new RateLimiterMemory({
            points: 10,
            duration: 1,
        });
    }

    async consume(key: string): Promise<void> {
        try {
            await this.limiter.consume(key);
        } catch (rejRes) {
            throw new Error('Too many requests');
        }
    }
}
