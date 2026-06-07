/**
 * Event Bus for Microservices Communication
 * Event-driven architecture for Phase 3
 * Uses Redis Pub/Sub and/or AWS EventBridge
 */

const Redis = require("ioredis");
const { EventEmitter } = require("events");

class EventBus extends EventEmitter {
  constructor(options = {}) {
    super();
    
    this.pubSub = null;
    this.subscriber = null;
    this.enabled = options.enabled !== false;
    this.channelPrefix = options.channelPrefix || "hustlex:";
    
    if (this.enabled && process.env.REDIS_ENABLED === "true") {
      this.initializePubSub();
    }
  }

  /**
   * Initialize Redis Pub/Sub
   */
  initializePubSub() {
    try {
      // Publisher connection
      this.pubSub = new Redis({
        host: process.env.REDIS_HOST || "localhost",
        port: parseInt(process.env.REDIS_PORT) || 6379,
        password: process.env.REDIS_PASSWORD || undefined,
      });

      // Subscriber connection (separate connection)
      this.subscriber = new Redis({
        host: process.env.REDIS_HOST || "localhost",
        port: parseInt(process.env.REDIS_PORT) || 6379,
        password: process.env.REDIS_PASSWORD || undefined,
      });

      // Listen for messages
      this.subscriber.on("message", (channel, message) => {
        try {
          const event = JSON.parse(message);
          console.log(`📨 Event received: ${event.type}`, { 
            service: event.source,
            timestamp: event.timestamp 
          });
          
          // Emit locally
          this.emit(event.type, event);
          
          // Emit generic event
          this.emit("*", event);
        } catch (error) {
          console.error("❌ Error processing event:", error.message);
        }
      });

      console.log("🚌 Event bus initialized with Redis Pub/Sub");
    } catch (error) {
      console.error("❌ Failed to initialize event bus:", error.message);
    }
  }

  /**
   * Publish event
   */
  async publish(event) {
    const enrichedEvent = {
      ...event,
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      source: event.source || process.env.SERVICE_NAME || "monolith",
      version: event.version || "1.0",
    };

    const channel = `${this.channelPrefix}${enrichedEvent.type}`;

    try {
      // Publish to Redis
      if (this.pubSub) {
        await this.pubSub.publish(channel, JSON.stringify(enrichedEvent));
      }

      // Emit locally
      this.emit(enrichedEvent.type, enrichedEvent);
      this.emit("*", enrichedEvent);

      // Log event
      console.log(`📤 Event published: ${enrichedEvent.type}`, {
        id: enrichedEvent.id,
        source: enrichedEvent.source,
      });

      return enrichedEvent;
    } catch (error) {
      console.error("❌ Failed to publish event:", error.message);
      throw error;
    }
  }

  /**
   * Subscribe to event
   */
  async subscribe(eventType, handler) {
    const channel = `${this.channelPrefix}${eventType}`;

    // Add local handler
    this.on(eventType, handler);

    // Subscribe in Redis
    if (this.subscriber) {
      await this.subscriber.subscribe(channel);
    }

    console.log(`📡 Subscribed to event: ${eventType}`);
  }

  /**
   * Unsubscribe from event
   */
  async unsubscribe(eventType) {
    const channel = `${this.channelPrefix}${eventType}`;

    this.removeAllListeners(eventType);

    if (this.subscriber) {
      await this.subscriber.unsubscribe(channel);
    }

    console.log(`🔇 Unsubscribed from event: ${eventType}`);
  }

  /**
   * Publish user-related events
   */
  async userCreated(userData) {
    return this.publish({
      type: "user.created",
      data: userData,
      aggregateId: userData.userId,
      aggregateType: "User",
    });
  }

  async userUpdated(userData) {
    return this.publish({
      type: "user.updated",
      data: userData,
      aggregateId: userData.userId,
      aggregateType: "User",
    });
  }

  async userDeleted(userId) {
    return this.publish({
      type: "user.deleted",
      data: { userId },
      aggregateId: userId,
      aggregateType: "User",
    });
  }

  /**
   * Publish job-related events
   */
  async jobCreated(jobData) {
    return this.publish({
      type: "job.created",
      data: jobData,
      aggregateId: jobData.jobId,
      aggregateType: "Job",
    });
  }

  async jobApproved(jobData) {
    return this.publish({
      type: "job.approved",
      data: jobData,
      aggregateId: jobData.jobId,
      aggregateType: "Job",
    });
  }

  async jobDeclined(jobData) {
    return this.publish({
      type: "job.declined",
      data: jobData,
      aggregateId: jobData.jobId,
      aggregateType: "Job",
    });
  }

  async jobExpired(jobId) {
    return this.publish({
      type: "job.expired",
      data: { jobId },
      aggregateId: jobId,
      aggregateType: "Job",
    });
  }

  /**
   * Publish application-related events
   */
  async applicationSubmitted(applicationData) {
    return this.publish({
      type: "application.submitted",
      data: applicationData,
      aggregateId: applicationData.applicationId,
      aggregateType: "Application",
    });
  }

  async applicationAccepted(applicationData) {
    return this.publish({
      type: "application.accepted",
      data: applicationData,
      aggregateId: applicationData.applicationId,
      aggregateType: "Application",
    });
  }

  async applicationRejected(applicationData) {
    return this.publish({
      type: "application.rejected",
      data: applicationData,
      aggregateId: applicationData.applicationId,
      aggregateType: "Application",
    });
  }

  /**
   * Publish payment-related events
   */
  async paymentInitiated(paymentData) {
    return this.publish({
      type: "payment.initiated",
      data: paymentData,
      aggregateId: paymentData.paymentId,
      aggregateType: "Payment",
    });
  }

  async paymentCompleted(paymentData) {
    return this.publish({
      type: "payment.completed",
      data: paymentData,
      aggregateId: paymentData.paymentId,
      aggregateType: "Payment",
    });
  }

  async paymentFailed(paymentData) {
    return this.publish({
      type: "payment.failed",
      data: paymentData,
      aggregateId: paymentData.paymentId,
      aggregateType: "Payment",
    });
  }

  /**
   * Generate unique event ID
   */
  generateId() {
    return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get event bus stats
   */
  getStats() {
    return {
      enabled: this.enabled,
      pubSubConnected: this.pubSub?.status === "ready",
      subscriberConnected: this.subscriber?.status === "ready",
      listenerCount: this.listenerCount("*"),
      channelPrefix: this.channelPrefix,
    };
  }

  /**
   * Graceful shutdown
   */
  async shutdown() {
    console.log("🛑 Shutting down event bus...");
    
    if (this.pubSub) {
      await this.pubSub.quit();
    }
    
    if (this.subscriber) {
      await this.subscriber.quit();
    }
    
    console.log("✅ Event bus shut down");
  }
}

// Singleton instance
const eventBus = new EventBus();

// Graceful shutdown
process.on("SIGTERM", () => eventBus.shutdown());
process.on("SIGINT", () => eventBus.shutdown());

module.exports = eventBus;
