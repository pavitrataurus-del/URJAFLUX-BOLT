# ENTERPRISE DEPLOYMENT GUIDE
**URJAFLUX AI OS — Version BUILD-026I (RC-1)**

---

## 1. Overview
URJAFLUX AI OS is a full-stack enterprise platform combining Spatial Computing, Digital Twin Engines, Knowledge Graphs, and AI Reasoning. This guide details the deployment procedures for Cloud Run, Kubernetes, and containerized Docker environments.

## 2. Infrastructure Requirements
- **Node.js**: v20 LTS or higher
- **Container Port**: Port 3000 (Hardcoded ingress behind reverse proxy)
- **Host Binding**: `0.0.0.0`
- **Memory Recommendation**: Minimum 2 GB RAM (4 GB recommended for CAD/3D processing)
- **CPU Recommendation**: 2 vCPU minimum

## 3. Environment Variables Configuration
Ensure all required keys are defined in your deployment environment or `.env`:

```env
# Server Runtime
NODE_ENV=production
PORT=3000

# Firebase / Persistence (Optional for Cloud Sync)
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=

# AI Reasoning & LLM Services
GEMINI_API_KEY=
```

## 4. Build and Launch Commands

### Production Build
```bash
npm run build
```
This builds the React/Vite SPA assets into `dist/` and bundles the TypeScript backend server with `esbuild` into `dist/server.cjs`.

### Production Launch
```bash
npm run start
```
Starts the bundled server directly via `node dist/server.cjs` listening on `http://0.0.0.0:3000`.

## 5. Dockerfile Reference
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
RUN npm ci --only=production

EXPOSE 3000
CMD ["node", "dist/server.cjs"]
```
