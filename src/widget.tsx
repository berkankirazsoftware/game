import React from 'react';
import { createRoot } from 'react-dom/client';
import BoosteWidgetApp from './components/BoosteWidgetApp';
import './index.css';

declare global {
  interface Window {
    Booste: {
      init: (config: WidgetConfig) => void;
    }
  }
}

interface WidgetConfig {
  target: string;
  games: string[];
  type: 'popup' | 'embedded';
  theme: string;
  userId?: string;
  boosteId?: string;
}

const Booste = {
  init: (config: WidgetConfig) => {
    // If popup, append a div to body
    let container: Element | null = null;

    if (config.type === 'popup') {
      container = document.createElement('div');
      container.id = 'booste-widget-root';
      document.body.appendChild(container); // Append to body for popup
    } else {
      // For embedded, find the target
      container = document.querySelector(config.target);
    }

    if (!container) {
      console.error(`Booste Widget: Container ${config.target} not found`);
      return;
    }

    const root = createRoot(container);
    root.render(
      <React.StrictMode>
        <BoosteWidgetApp config={config} />
      </React.StrictMode>
    );
  }
};

window.Booste = Booste;
console.log('Booste Widget Loaded');
