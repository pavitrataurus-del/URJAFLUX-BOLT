# DOMAIN-019: Plugin SDK Documentation

The URJAFLUX AI OS Plugin SDK represents the sole authorized contract through which any external module interacts with the platform.

## 1. SDK Registration API
To initialize a custom plugin, access the singleton proxy instance:

```typescript
import { PluginSDK } from "urjaflux-sdk";

const sdk = PluginSDK.getInstance();
```

## 2. Core Interfaces

### UI Extensions & Commands
Plugins can register custom commands and menu buttons without modifying core React code:

```typescript
export interface ICommand {
  commandId: string;
  displayName: string;
  execute: (context: Record<string, any>) => any;
}

// Registration
sdk.registerCommand("my-plugin-id", {
  commandId: "remedy-zoning-renderer",
  displayName: "Map North-East Compass Remedies",
  execute: (ctx) => {
    return "Remedy points painted successfully.";
  }
});
```

### Safe Astrology & Vastu Queries
Plugins can access curated, safe knowledge queries using:

```typescript
const vastuData = sdk.queryPublicLibrary("my-plugin-id", "VASTU", {
  direction: "North-East"
});
```
This avoids direct database access or leakage of client records.
