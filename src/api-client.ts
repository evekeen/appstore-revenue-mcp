import fetch from 'node-fetch';
import { SensorTowerResponse, SensorTowerApp } from './types.js';

const SENSOR_TOWER_API_URL = 'https://app.sensortower.com/api/ios/apps';

export class SensorTowerAPIClient {
  async fetchAppRevenue(appIds: string[]): Promise<Map<string, SensorTowerApp | Error>> {
    const results = new Map<string, SensorTowerApp | Error>();
    
    if (appIds.length === 0) {
      return results;
    }

    const appIdsParam = appIds.join(',');
    const url = `${SENSOR_TOWER_API_URL}?app_ids=${appIdsParam}`;

    try {
      const response = await fetch(url);
      
      if (response.status === 429) {
        const error = new Error('Rate limited by Sensor Tower API. Please try again later.');
        appIds.forEach(appId => results.set(appId, error));
        return results;
      }

      if (!response.ok) {
        const error = new Error(`API request failed with status ${response.status}`);
        appIds.forEach(appId => results.set(appId, error));
        return results;
      }

      const data = await response.json() as SensorTowerResponse;
      
      // Map the results
      for (const app of data.apps) {
        results.set(String(app.app_id), app);
      }
      
      // Check for missing apps
      for (const appId of appIds) {
        if (!results.has(appId)) {
          results.set(appId, new Error(`App ID ${appId} not found in Sensor Tower response`));
        }
      }

      return results;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      const apiError = new Error(`Failed to fetch data from Sensor Tower: ${errorMessage}`);
      appIds.forEach(appId => results.set(appId, apiError));
      return results;
    }
  }
}