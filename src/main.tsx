import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { storageService } from './services/EnterpriseKnowledgeStorageService';
import { KnowledgeExtractionEngine } from './core/import_engine/KnowledgeExtractionEngine';
import { initializeRepositories } from './core/knowledge/initializeRepositories';
import {
  visionProviderRegistry,
  PassiveReferenceProvider,
  GeminiVisionProvider,
  GeminiProviderConfig
} from './spatial/VisionRuntime';

// Register enterprise repositories
initializeRepositories();

// Configuration-based Spatial Recognition Provider Bootstrap
type VisionProviderSelectionMode = 'PASSIVE' | 'MOCK' | 'GEMINI' | 'SDK';

const configuredVisionMode: VisionProviderSelectionMode =
  ((typeof import.meta !== 'undefined' && import.meta.env?.VITE_SPATIAL_VISION_MODE) as VisionProviderSelectionMode) || 'GEMINI';

// 1. Register Passive Reference Provider
const passiveProvider = new PassiveReferenceProvider();
visionProviderRegistry.registerProvider(passiveProvider);

// 2. Register Gemini Vision Provider (configured according to selection mode)
const geminiTransportMode = configuredVisionMode === 'MOCK' ? 'MOCK' : (configuredVisionMode === 'SDK' ? 'SDK' : 'PROXY');
const geminiProvider = new GeminiVisionProvider(
  new GeminiProviderConfig({
    transportMode: geminiTransportMode
  })
);
visionProviderRegistry.registerProvider(geminiProvider);

// 3. Set default provider according to configuration
if (configuredVisionMode === 'PASSIVE') {
  visionProviderRegistry.setDefaultProvider(passiveProvider.capabilities().providerId);
} else {
  visionProviderRegistry.setDefaultProvider(geminiProvider.capabilities().providerId);
}

console.log(`[URJAFLUX AI OS] Spatial Vision Provider bootstrap complete. Configured mode: '${configuredVisionMode}', Active Default Provider: '${visionProviderRegistry.getDefaultProvider().capabilities().displayName}'`);

(window as any).storageService = storageService;
(window as any).KnowledgeExtractionEngine = KnowledgeExtractionEngine;
import { KnowledgeUploadPipelineService } from './services/knowledgeUploadPipelineService';
import { UniversalIngestionEngine } from './core/knowledge_ingestion/services/UniversalIngestionEngine';
import { EnterprisePdfStorageService } from './core/storage/EnterprisePdfStorageService';

(window as any).KnowledgeUploadPipelineService = KnowledgeUploadPipelineService;
(window as any).UniversalIngestionEngine = UniversalIngestionEngine;
(window as any).EnterprisePdfStorageService = EnterprisePdfStorageService;
import './index.css';
import { GlobalErrorBoundary } from './components/GlobalErrorBoundary.tsx';
import { LanguageProvider } from './localization/LanguageProvider.tsx';

if (typeof window !== 'undefined') {
  const isExtensionError = (message: string) => {
    const msg = String(message || '').toLowerCase();
    return (
      msg.includes('emit') ||
      msg.includes('addlistener') ||
      msg.includes('chrome-extension') ||
      msg.includes('ethereum') ||
      msg.includes('inpage') ||
      msg.includes('metamask') ||
      msg.includes('rabby') ||
      msg.includes('phantom') ||
      msg.includes('wallet')
    );
  };

  window.addEventListener('error', (event) => {
    if (isExtensionError(event.message || String(event.error))) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  }, true);

  window.addEventListener('unhandledrejection', (event) => {
    if (isExtensionError(String(event.reason?.message || event.reason))) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  }, true);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GlobalErrorBoundary>
      <LanguageProvider>
        <App />
      </LanguageProvider>
    </GlobalErrorBoundary>
  </StrictMode>,
);

