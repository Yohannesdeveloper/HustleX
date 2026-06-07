/**
 * Circuit Breaker Pattern Implementation
 * Prevents cascade failures when external services are down
 * 
 * States:
 * - CLOSED: Normal operation, requests pass through
 * - OPEN: Service is down, requests fail immediately
 * - HALF-OPEN: Testing if service recovered
 */

class CircuitBreaker {
  constructor(options = {}) {
    this.name = options.name || "unnamed";
    this.failureThreshold = options.failureThreshold || 5;
    this.recoveryTimeout = options.recoveryTimeout || 60000; // 1 minute
    this.successThreshold = options.successThreshold || 3;
    
    this.state = "CLOSED";
    this.failureCount = 0;
    this.successCount = 0;
    this.lastFailureTime = null;
    this.nextAttemptTime = null;
    
    // Monitoring
    this.totalRequests = 0;
    this.totalFailures = 0;
    this.totalSuccesses = 0;
    
    console.log(`⚡ Circuit Breaker initialized: ${this.name}`);
  }

  /**
   * Execute function with circuit breaker protection
   */
  async execute(fn, fallbackFn = null) {
    this.totalRequests++;

    // Check if circuit is open
    if (this.state === "OPEN") {
      if (Date.now() < this.nextAttemptTime) {
        console.warn(`⚠️  Circuit breaker OPEN for ${this.name}, failing fast`);
        
        // Use fallback if available
        if (fallbackFn) {
          console.log(`🔄 Using fallback for ${this.name}`);
          return await fallbackFn();
        }
        
        throw new Error(`Circuit breaker open for ${this.name}`);
      }
      
      // Transition to half-open
      this.state = "HALF-OPEN";
      this.successCount = 0;
      console.log(`🔄 Circuit breaker HALF-OPEN for ${this.name}`);
    }

    try {
      const result = await fn();
      
      // Success
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      
      // Try fallback on failure
      if (fallbackFn) {
        console.log(`🔄 Using fallback after failure for ${this.name}`);
        try {
          return await fallbackFn();
        } catch (fallbackError) {
          console.error(`❌ Fallback also failed for ${this.name}:`, fallbackError.message);
        }
      }
      
      throw error;
    }
  }

  /**
   * Handle successful execution
   */
  onSuccess() {
    this.totalSuccesses++;
    
    if (this.state === "HALF-OPEN") {
      this.successCount++;
      
      // If enough successes, close circuit
      if (this.successCount >= this.successThreshold) {
        this.state = "CLOSED";
        this.failureCount = 0;
        this.successCount = 0;
        console.log(`✅ Circuit breaker CLOSED for ${this.name} (recovered)`);
      }
    } else if (this.state === "CLOSED") {
      // Reset failure count on success
      this.failureCount = 0;
    }
  }

  /**
   * Handle failed execution
   */
  onFailure() {
    this.totalFailures++;
    this.failureCount++;
    this.lastFailureTime = Date.now();

    if (this.state === "HALF-OPEN") {
      // Back to open
      this.state = "OPEN";
      this.nextAttemptTime = Date.now() + this.recoveryTimeout;
      console.log(`❌ Circuit breaker OPEN for ${this.name} (recovery failed)`);
    } else if (this.state === "CLOSED") {
      // Check if threshold reached
      if (this.failureCount >= this.failureThreshold) {
        this.state = "OPEN";
        this.nextAttemptTime = Date.now() + this.recoveryTimeout;
        console.log(`❌ Circuit breaker OPEN for ${this.name} (threshold reached: ${this.failureCount})`);
      }
    }
  }

  /**
   * Get circuit breaker status
   */
  getStatus() {
    return {
      name: this.name,
      state: this.state,
      failureCount: this.failureCount,
      successCount: this.successCount,
      totalRequests: this.totalRequests,
      totalFailures: this.totalFailures,
      totalSuccesses: this.totalSuccesses,
      failureRate: this.totalRequests > 0 
        ? ((this.totalFailures / this.totalRequests) * 100).toFixed(2) + "%"
        : "0%",
    };
  }

  /**
   * Manually reset circuit breaker
   */
  reset() {
    this.state = "CLOSED";
    this.failureCount = 0;
    this.successCount = 0;
    this.lastFailureTime = null;
    this.nextAttemptTime = null;
    console.log(`🔄 Circuit breaker manually reset: ${this.name}`);
  }

  /**
   * Manually trip circuit breaker (force open)
   */
  trip() {
    this.state = "OPEN";
    this.nextAttemptTime = Date.now() + this.recoveryTimeout;
    console.log(`⚠️  Circuit breaker manually tripped: ${this.name}`);
  }
}

// ================================
// Pre-configured Circuit Breakers
// ================================

// MongoDB Circuit Breaker
const mongoCircuitBreaker = new CircuitBreaker({
  name: "MongoDB",
  failureThreshold: 10,
  recoveryTimeout: 30000, // 30 seconds
  successThreshold: 5,
});

// Redis Circuit Breaker
const redisCircuitBreaker = new CircuitBreaker({
  name: "Redis",
  failureThreshold: 5,
  recoveryTimeout: 15000, // 15 seconds
  successThreshold: 3,
});

// External API Circuit Breaker (Telegram, etc.)
const externalApiCircuitBreaker = new CircuitBreaker({
  name: "External API",
  failureThreshold: 3,
  recoveryTimeout: 60000, // 1 minute
  successThreshold: 2,
});

// Email Service Circuit Breaker
const emailCircuitBreaker = new CircuitBreaker({
  name: "Email Service",
  failureThreshold: 5,
  recoveryTimeout: 120000, // 2 minutes
  successThreshold: 3,
});

// ================================
// Monitoring
// ================================
function getAllCircuitBreakersStatus() {
  return {
    mongodb: mongoCircuitBreaker.getStatus(),
    redis: redisCircuitBreaker.getStatus(),
    externalApi: externalApiCircuitBreaker.getStatus(),
    email: emailCircuitBreaker.getStatus(),
  };
}

module.exports = {
  CircuitBreaker,
  mongoCircuitBreaker,
  redisCircuitBreaker,
  externalApiCircuitBreaker,
  emailCircuitBreaker,
  getAllCircuitBreakersStatus,
};
