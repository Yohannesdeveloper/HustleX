/**
 * CDN Integration Helpers
 * Manage CloudFront invalidation, cache control, and asset URLs
 */

const { CloudFront } = require("@aws-sdk/client-cloudfront");

class CDNManager {
  constructor() {
    this.enabled = process.env.CDN_ENABLED === "true";
    this.domain = process.env.CDN_URL || "";
    
    if (this.enabled) {
      this.cloudfront = new CloudFront({
        region: process.env.AWS_REGION || "us-east-1",
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        },
      });
      this.distributionId = process.env.CLOUDFRONT_DISTRIBUTION_ID;
      console.log(`🌐 CDN enabled: ${this.domain}`);
    } else {
      console.log("⚠️  CDN disabled (set CDN_ENABLED=true to enable)");
    }
  }

  /**
   * Get CDN URL for an asset
   * Falls back to origin URL if CDN is disabled
   */
  getAssetUrl(path) {
    if (!this.enabled || !this.domain) {
      // Return origin URL
      return `${process.env.ORIGIN_URL || ""}${path}`;
    }

    // Return CDN URL
    return `${this.domain}${path}`;
  }

  /**
   * Get optimized image URL with CloudFront transformations
   */
  getImageUrl(path, options = {}) {
    const { width, height, quality = 80, format = "webp" } = options;

    if (!this.enabled) {
      return this.getAssetUrl(path);
    }

    // CloudFront image optimization
    let url = this.getAssetUrl(path);
    const params = new URLSearchParams();

    if (width) params.append("w", width);
    if (height) params.append("h", height);
    if (quality < 100) params.append("q", quality);
    if (format !== "original") params.append("f", format);

    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    return url;
  }

  /**
   * Invalidate CloudFront cache
   * Use this when content is updated
   */
  async invalidateCache(paths) {
    if (!this.enabled || !this.distributionId) {
      console.log("⚠️  CDN not enabled, skipping cache invalidation");
      return;
    }

    try {
      // Ensure paths start with /
      const normalizedPaths = paths.map(p => p.startsWith("/") ? p : `/${p}`);

      const params = {
        DistributionId: this.distributionId,
        InvalidationBatch: {
          CallerReference: `hustlex-${Date.now()}`,
          Paths: {
            Quantity: normalizedPaths.length,
            Items: normalizedPaths,
          },
        },
      };

      const result = await this.cloudfront.createInvalidation(params);
      console.log(`🗑️  CDN cache invalidation requested: ${paths.length} paths`);
      console.log(`   Invalidation ID: ${result.Invalidation.Id}`);
      console.log(`   Status: ${result.Invalidation.Status}`);

      return result.Invalidation;
    } catch (error) {
      console.error("❌ CDN cache invalidation failed:", error.message);
      throw error;
    }
  }

  /**
   * Invalidate all cache (use sparingly!)
   */
  async invalidateAllCache() {
    return this.invalidateCache(["/*"]);
  }

  /**
   * Generate cache control headers
   */
  getCacheControlHeaders(type, ttl = 3600) {
    const cacheConfigs = {
      static: {
        "Cache-Control": `public, max-age=31536000, immutable`, // 1 year
        "CDN-Cache-Control": `public, max-age=31536000`,
      },
      uploads: {
        "Cache-Control": `public, max-age=604800`, // 1 week
        "CDN-Cache-Control": `public, max-age=604800`,
      },
      api: {
        "Cache-Control": `public, max-age=${ttl}, s-maxage=${ttl}`,
        "CDN-Cache-Control": `public, max-age=${ttl}`,
      },
      "no-cache": {
        "Cache-Control": "no-store, no-cache, must-revalidate",
        "Pragma": "no-cache",
        "Expires": "0",
      },
    };

    return cacheConfigs[type] || cacheConfigs.api;
  }

  /**
   * Get CDN health status
   */
  async getHealthStatus() {
    if (!this.enabled) {
      return {
        enabled: false,
        status: "disabled",
      };
    }

    try {
      // Check if CloudFront distribution is deployed
      const params = {
        Id: this.distributionId,
      };

      const distribution = await this.cloudfront.getDistribution(params);
      
      return {
        enabled: true,
        status: distribution.Distribution.DistributionConfig.Enabled ? "active" : "disabled",
        domain: this.domain,
        lastModified: distribution.Distribution.LastModifiedTime,
      };
    } catch (error) {
      return {
        enabled: true,
        status: "error",
        error: error.message,
      };
    }
  }
}

// Singleton instance
const cdnManager = new CDNManager();

module.exports = cdnManager;
