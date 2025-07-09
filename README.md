# Apple App Store Revenue MCP Server

An MCP (Model Context Protocol) server that fetches revenue and download data for Apple App Store apps using the Sensor Tower API.

## Features

- 📊 Fetch last month's revenue and download estimates for iOS apps
- 💾 Persistent file-based cache with 30-day expiration
- ⚡ Batch requests for multiple app IDs
- 🛡️ Graceful handling of rate limits (429 errors)
- 📈 Returns app metadata including ratings, version, and bundle ID

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/sensortower-mcp.git
cd sensortower-mcp
```

2. Install dependencies:
```bash
npm install
```

3. Build the TypeScript code:
```bash
npm run build
```

## Usage

### Running the Server

Start the MCP server:
```bash
npm start
```

For development with auto-rebuild:
```bash
npm run dev
```

### Available Tools

#### `fetch-app-revenue`

Fetches revenue data for one or more Apple App Store apps.

**Input:**
- `app_ids`: Array of iOS app IDs (strings)

**Output:**
Returns a JSON object containing:
- Revenue and download data for each app
- Cache statistics
- Timestamp of the request

**Example Request:**
```json
{
  "app_ids": ["1514586439", "1570844427"]
}
```

**Example Response:**
```json
{
  "results": {
    "1514586439": {
      "source": "api",
      "app_name": "SmoothSwing",
      "publisher": "Thomas Turnbull",
      "last_month_revenue": "$20k",
      "last_month_downloads": "60k",
      "bundle_id": "com.Smooth-Swing.Golf-GPS-Smooth-Swing",
      "version": "3.1.0",
      "rating": 4.85152,
      "last_updated": "2023-05-08T00:00:00Z"
    },
    "1570844427": {
      "source": "cache",
      "app_name": "Ace Trace - Shot Tracker",
      "publisher": "Ivkin LLC",
      "last_month_revenue": "$20k",
      "last_month_downloads": "10k",
      "bundle_id": "org.acetrace",
      "version": "8.10",
      "rating": 4.41791,
      "last_updated": "2025-07-08T00:00:00Z"
    }
  },
  "cache_stats": {
    "totalEntries": 2,
    "validEntries": 2
  },
  "timestamp": "2025-07-09T12:00:00.000Z"
}
```

### Integration with Claude Desktop

To use this MCP server with Claude Desktop, add the following to your Claude Desktop configuration:

```json
{
  "mcpServers": {
    "appstore-revenue": {
      "command": "node",
      "args": ["/path/to/sensortower-mcp/dist/index.js"],
      "description": "Fetch Apple App Store revenue data"
    }
  }
}
```

## Cache Management

The server maintains a cache in the `.cache` directory to minimize API requests:
- Cache entries expire after 30 days
- Cache is automatically created on first run
- Invalid or expired entries are automatically removed

## Error Handling

- **Rate Limiting (429)**: The server will return an error message if rate limited by Sensor Tower
- **Invalid App IDs**: Returns an error for each app ID not found
- **Network Errors**: Gracefully handles connection issues

## Project Structure

```
sensortower-mcp/
├── src/
│   ├── index.ts              # Server entry point
│   ├── appstore-revenue.ts   # Tool registration
│   ├── api-client.ts         # Sensor Tower API client
│   ├── cache.ts              # Cache implementation
│   └── types.ts              # TypeScript interfaces
├── dist/                     # Compiled JavaScript
├── .cache/                   # Cache storage
├── package.json
├── tsconfig.json
└── README.md
```

## Notes

- No API key is required for Sensor Tower API access
- The server fetches data for iOS apps only
- Revenue and download numbers are estimates provided by Sensor Tower

## License

MIT