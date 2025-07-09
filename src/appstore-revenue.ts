import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { SensorTowerAPIClient } from "./api-client.js";
import { Cache } from "./cache.js";
import { SensorTowerApp } from "./types.js";

const cache = new Cache();
const apiClient = new SensorTowerAPIClient();

export async function registerAppStoreRevenueTools(server: McpServer) {
  // Initialize cache
  await cache.init();

  server.registerTool(
    "fetch-app-revenue",
    {
      title: "Fetch Apple App Store Revenue",
      description: "Fetch revenue data for Apple App Store apps using Sensor Tower API. Returns last month's revenue and download estimates. Data is cached for 30 days.",
      inputSchema: {
        app_ids: z.array(z.string()).describe("Array of iOS app IDs to fetch revenue data for"),
      }
    },
    async ({ app_ids }) => {
      try {
        const results: Record<string, any> = {};
        const missingAppIds: string[] = [];

        // Check cache first
        for (const appId of app_ids) {
          const cachedData = cache.get(appId);
          if (cachedData) {
            results[appId] = {
              source: "cache",
              app_name: cachedData.humanized_name,
              publisher: cachedData.publisher_name,
              last_month_revenue: cachedData.humanized_worldwide_last_month_revenue.string,
              last_month_downloads: cachedData.humanized_worldwide_last_month_downloads.string,
              bundle_id: cachedData.bundle_id,
              version: cachedData.version,
              rating: cachedData.rating,
              last_updated: cachedData.updated_date
            };
          } else {
            missingAppIds.push(appId);
          }
        }

        // Fetch missing data from API
        if (missingAppIds.length > 0) {
          const apiResults = await apiClient.fetchAppRevenue(missingAppIds);
          
          for (const [appId, result] of apiResults) {
            if (result instanceof Error) {
              results[appId] = {
                error: result.message
              };
            } else {
              // Cache the successful result
              await cache.set(appId, result);
              
              results[appId] = {
                source: "api",
                app_name: result.humanized_name,
                publisher: result.publisher_name,
                last_month_revenue: result.humanized_worldwide_last_month_revenue.string,
                last_month_downloads: result.humanized_worldwide_last_month_downloads.string,
                bundle_id: result.bundle_id,
                version: result.version,
                rating: result.rating,
                last_updated: result.updated_date
              };
            }
          }
        }

        // Add cache stats
        const cacheStats = cache.getStats();
        
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                results,
                cache_stats: cacheStats,
                timestamp: new Date().toISOString()
              }, null, 2)
            }
          ]
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
        return {
          content: [
            {
              type: "text",
              text: `Error fetching app revenue data: ${errorMessage}`
            }
          ]
        };
      }
    }
  );
}