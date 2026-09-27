import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import './i18n';
import './design/tokens.css';
import './design/components.css';
import './features/carer/carer.css';
import { App } from './app/App';
import { CalmFallback } from './design/CalmFallback';

// Updates install silently on the next launch. No prompt is ever shown in Person mode.
registerSW({ immediate: true });

// A root boundary so even a failure while loading shows one calm sentence and a way home.
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <CalmFallback onBackToToday={() => window.location.reload()}>
      <App />
    </CalmFallback>
  </StrictMode>,
);
