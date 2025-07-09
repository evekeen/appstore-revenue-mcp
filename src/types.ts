export interface SensorTowerApp {
  app_id: number;
  name: string;
  humanized_name: string;
  publisher_name: string;
  publisher_id: number;
  icon_url: string;
  os: string;
  active: boolean;
  url: string;
  categories: number[];
  release_date: string;
  updated_date: string;
  in_app_purchases: boolean;
  rating: number;
  price: number;
  global_rating_count: number;
  version: string;
  humanized_worldwide_last_month_downloads: {
    downloads: number;
    downloads_rounded: number;
    prefix: string | null;
    string: string;
    units: string;
  };
  humanized_worldwide_last_month_revenue: {
    prefix: string;
    revenue: number;
    revenue_rounded: number;
    string: string;
    units: string;
  };
  bundle_id: string;
  [key: string]: any; // For other fields we don't explicitly type
}

export interface SensorTowerResponse {
  apps: SensorTowerApp[];
}

export interface CacheEntry {
  data: SensorTowerApp;
  timestamp: number;
}

export interface CacheData {
  [appId: string]: CacheEntry;
}