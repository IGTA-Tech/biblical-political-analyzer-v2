/**
 * Rate Limiter Utility
 * Respects API rate limits and implements exponential backoff
 */

export class RateLimiter {
  constructor(options = {}) {
    this.maxRequests = options.maxRequests || 100;
    this.perSeconds = options.perSeconds || 60;
    this.requests = [];
    this.retryDelay = options.retryDelay || 1000; // 1 second default
    this.maxRetries = options.maxRetries || 3;
  }

  /**
   * Wait for an available slot within rate limit
   * Returns immediately if rate limit allows, otherwise waits
   */
  async waitForSlot() {
    const now = Date.now();
    const windowStart = now - (this.perSeconds * 1000);

    // Remove requests outside the time window
    this.requests = this.requests.filter(time => time > windowStart);

    // If we're at the limit, wait until the oldest request expires
    if (this.requests.length >= this.maxRequests) {
      const oldestRequest = this.requests[0];
      const waitTime = oldestRequest + (this.perSeconds * 1000) - now + 100; // Add 100ms buffer

      if (waitTime > 0) {
        await this.sleep(waitTime);
        return this.waitForSlot(); // Recursive call after waiting
      }
    }

    // Record this request
    this.requests.push(now);
  }

  /**
   * Execute a function with rate limiting and retry logic
   * @param {Function} fn - Async function to execute
   * @param {number} attempt - Current attempt number (for recursion)
   * @returns {Promise} - Result of the function
   */
  async execute(fn, attempt = 1) {
    await this.waitForSlot();

    try {
      return await fn();
    } catch (error) {
      // Check if we should retry
      if (attempt < this.maxRetries && this.isRetryableError(error)) {
        const delay = this.calculateBackoff(attempt);
        console.warn(`Request failed (attempt ${attempt}/${this.maxRetries}). Retrying in ${delay}ms...`);
        await this.sleep(delay);
        return this.execute(fn, attempt + 1);
      }

      // Max retries reached or non-retryable error
      throw error;
    }
  }

  /**
   * Determine if an error is retryable
   */
  isRetryableError(error) {
    // Retry on network errors, timeouts, and rate limit errors
    const retryableStatuses = [429, 500, 502, 503, 504];
    const statusCode = error.response?.status;

    if (statusCode && retryableStatuses.includes(statusCode)) {
      return true;
    }

    // Network errors
    if (error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT' || error.code === 'ENOTFOUND') {
      return true;
    }

    return false;
  }

  /**
   * Calculate exponential backoff delay
   * @param {number} attempt - Attempt number (1-indexed)
   * @returns {number} - Delay in milliseconds
   */
  calculateBackoff(attempt) {
    // Exponential backoff: 1s, 2s, 4s, 8s...
    const exponentialDelay = this.retryDelay * Math.pow(2, attempt - 1);

    // Add jitter (random 0-1000ms) to prevent thundering herd
    const jitter = Math.random() * 1000;

    return exponentialDelay + jitter;
  }

  /**
   * Sleep utility
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get current rate limit status
   * @returns {object} - { remaining: number, resetIn: number }
   */
  getStatus() {
    const now = Date.now();
    const windowStart = now - (this.perSeconds * 1000);

    // Remove old requests
    this.requests = this.requests.filter(time => time > windowStart);

    const remaining = this.maxRequests - this.requests.length;
    const resetIn = this.requests.length > 0
      ? (this.requests[0] + (this.perSeconds * 1000) - now)
      : 0;

    return {
      remaining: Math.max(0, remaining),
      resetIn: Math.max(0, resetIn),
      limit: this.maxRequests,
      window: this.perSeconds
    };
  }

  /**
   * Reset rate limiter (clear all tracked requests)
   */
  reset() {
    this.requests = [];
  }
}

/**
 * Token Bucket Rate Limiter (alternative implementation)
 * More sophisticated algorithm for smoother rate limiting
 */
export class TokenBucketRateLimiter {
  constructor(options = {}) {
    this.capacity = options.capacity || 100; // Max tokens
    this.refillRate = options.refillRate || 10; // Tokens per second
    this.tokens = this.capacity;
    this.lastRefill = Date.now();
  }

  /**
   * Refill tokens based on time elapsed
   */
  refill() {
    const now = Date.now();
    const timePassed = (now - this.lastRefill) / 1000; // Convert to seconds
    const tokensToAdd = timePassed * this.refillRate;

    this.tokens = Math.min(this.capacity, this.tokens + tokensToAdd);
    this.lastRefill = now;
  }

  /**
   * Wait for a token to become available
   */
  async waitForToken() {
    this.refill();

    if (this.tokens >= 1) {
      this.tokens -= 1;
      return;
    }

    // Calculate wait time needed
    const tokensNeeded = 1 - this.tokens;
    const waitTime = (tokensNeeded / this.refillRate) * 1000; // Convert to ms

    await this.sleep(waitTime + 50); // Add 50ms buffer

    return this.waitForToken(); // Recursive call
  }

  /**
   * Execute function with token bucket rate limiting
   */
  async execute(fn) {
    await this.waitForToken();
    return await fn();
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get current status
   */
  getStatus() {
    this.refill();

    return {
      tokens: Math.floor(this.tokens),
      capacity: this.capacity,
      refillRate: this.refillRate
    };
  }
}

export default {
  RateLimiter,
  TokenBucketRateLimiter
};
