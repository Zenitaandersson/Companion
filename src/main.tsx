import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import './i18n';
import './design/tokens.css';
import './design/components.css';
import './features/carer/carer.css';
import { App } from './app/App';

// Updates install silently on the next launch. No prompt is ever shown in Person mode.
registerSW({ immediate: true });

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
