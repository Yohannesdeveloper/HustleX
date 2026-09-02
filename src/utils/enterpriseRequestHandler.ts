/**
 * Enterprise Request Handler
 * Integrates with backend enterprise rate limiter
 * Handles unlimited requests by respecting backend rate limit headers
 */

interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: number; // Unix timestamp
}

interface RequestQueueItem {
  fn: () => Promise<any>;
  resolve: (value: any) => void;
  reject: (error: any) => void;
  priority: 'high' | 'normal' | 'low';
  timestamp: number;
}

class EnterpriseRequestHandler {
  private rateLimitInfo = new Map<string, RateLimitInfo>();
  private requestQueue: RequestQueueItem[] = [];
  private processing = false;
  private readonly MAX_QUEUE_SIZE = 10000;

  /**
   * Execute request with enterprise rate limit handling
   */
  async execute<T>(
    requestFn: () => Promise<T>,
    endpoint: string = '',
    priority: 'high' | 'normal' | 'low' = 'normal'
  ): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      // Check queue size
      if (this.requestQueue.length >= this.MAX_QUEUE_SIZE) {
        reject(new Error('Request queue is full'));
        return;
      }

      const queueItem: RequestQueueItem = {
        fn: requestFn,
        resolve: resolve as (value: any) => void,
        reject,
        priority,
        timestamp: Date.now(),
      };

      // Add to queue with priority
      if (priority === 'high') {
        this.requestQueue.unshift(queueItem);
      } else if (priority === 'low') {
        this.requestQueue.push(queueItem);
      } else {
        // Insert after high priority
        const normalIndex = this.requestQueue.findIndex((q) => q.priority !== 'high');
        this.requestQueue.splice(normalIndex === -1 ? this.requestQueue.length : normalIndex, 0, queueItem);
      }

      this.processQueue(endpoint);
    });
  }

  /**
   * Process request queue
   */
  private async processQueue(endpoint: string) {
    if (this.processing || this.requestQueue.length === 0) {
      return;
    }

    this.processing = true;

    while (this.requestQueue.length > 0) {
      const item = this.requestQueue.shift()!;
      const key = this.getRateLimitKey(endpoint);

      // Check rate limit
      const rateLimit = this.rateLimitInfo.get(key);
      if (rateLimit && rateLimit.remaining <= 0) {
        const waitTime = Math.max(0, rateLimit.reset - Date.now());
        if (waitTime > 0) {
          // Re-queue with delay
          setTimeout(() => {
            this.requestQueue.unshift(item);
            this.processQueue(endpoint);
          }, waitTime);
          break;
        }
      }

      try {
        const result = await item.fn();
        item.resolve(result);
      } catch (error: any) {
        // Handle rate limit error
        if (error?.status === 429) {
          const retryAfter = error?.errorData?.retryAfter || 1;
          const resetTime = Date.now() + (retryAfter * 1000);
          
          // Update rate limit info
          this.rateLimitInfo.set(key, {
            limit: error?.errorData?.limit || 10000,
            remaining: 0,
            reset: resetTime,
          });

          // Re-queue with delay
          setTimeout(() => {
            this.requestQueue.unshift(item);
            this.processQueue(endpoint);
          }, retryAfter * 1000);
        } else {
          item.reject(error);
        }
      }

      // Small delay between requests
      if (this.requestQueue.length > 0) {
        await this.delay(10);
      }
    }

    this.processing = false;
  }

  /**
   * Update rate limit info from response headers
   */
  updateRateLimitInfo(endpoint: string, headers: Headers) {
    const limit = parseInt(headers.get('X-RateLimit-Limit') || '10000', 10);
    const remaining = parseInt(headers.get('X-RateLimit-Remaining') || '10000', 10);
    const resetHeader = headers.get('X-RateLimit-Reset');
    
    let reset: number;
    if (resetHeader) {
      // Parse ISO date string
      reset = new Date(resetHeader).getTime();
    } else {
      reset = Date.now() + 60000; // Default 1 minute
    }

    const key = this.getRateLimitKey(endpoint);
    this.rateLimitInfo.set(key, { limit, remaining, reset });
  }

  /**
   * Get rate limit key for endpoint
   */
  private getRateLimitKey(endpoint: string): string {
    if (endpoint.includes('/messages')) {
      return 'messages';
    } else if (endpoint.includes('/api/')) {
      return 'api';
    }
    return 'general';
  }

  /**
   * Get rate limit info
   */
  getRateLimitInfo(endpoint: string): RateLimitInfo | null {
    const key = this.getRateLimitKey(endpoint);
    return this.rateLimitInfo.get(key) || null;
  }

  /**
   * Delay utility
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Clear rate limit info
   */
  clearRateLimitInfo() {
    this.rateLimitInfo.clear();
  }

  /**
   * Get queue stats
   */
  getStats() {
    return {
      queueLength: this.requestQueue.length,
      rateLimitInfo: Array.from(this.rateLimitInfo.entries()).map(([key, info]) => ({
        key,
        ...info,
      })),
    };
  }
}

// Export singleton
export const enterpriseRequestHandler = new EnterpriseRequestHandler();
export default enterpriseRequestHandler;
