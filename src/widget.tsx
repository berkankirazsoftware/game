import React from 'react';
import { createRoot } from 'react-dom/client';
import BoosteWidgetApp from './components/BoosteWidgetApp';
import './index.css';

// Type definitions
interface WidgetConfig {
  target: string;
  games: string[];
  type: 'popup' | 'embedded';
  theme: string;
  userId?: string;
  boosteId?: string;
  apiUrl?: string; // Allow custom API URL to avoid CORS
  autoOpen?: boolean;
}

interface BoosteAPI {
  init: (config: WidgetConfig) => void;
  destroy: () => void;
  version: string;
}

// Encapsulate everything in IIFE to avoid global pollution
(function() {
  'use strict';
  
  // Check if already loaded
  if ((window as any).Booste) {
    console.warn('Booste Widget already loaded');
    return;
  }

  let currentRoot: ReturnType<typeof createRoot> | null = null;
  let currentContainer: HTMLElement | null = null;

  const BoosteWidget: BoosteAPI = {
    version: '1.0.0',
    
    init: (config: WidgetConfig) => {
      try {
        // Ensure DOM is ready before trying anything
        if (document.readyState === 'loading' || !document.body) {
          window.addEventListener('DOMContentLoaded', () => {
            BoosteWidget.init(config);
          });
          return;
        }

        // Validate config
        if (!config.target) {
          console.error('Booste Widget: target is required');
          return;
        }

        let container: HTMLElement | null = null;

        if (config.type === 'popup') {
          // Create popup container
          container = document.createElement('div');
          container.id = 'booste-widget-root';
          container.setAttribute('data-booste-widget', 'true');
          // Add styles to prevent conflicts
          container.style.cssText = 'all: initial; position: fixed; z-index: 999999;';
          document.body.appendChild(container);
        } else {
          // For embedded, find the target
          const targetElement = document.querySelector(config.target);
          if (!targetElement) {
            console.error(`Booste Widget: Container ${config.target} not found`);
            return;
          }
          container = targetElement as HTMLElement;
          container.setAttribute('data-booste-widget', 'true');
        }

        if (!container) {
          console.error('Booste Widget: Failed to create container');
          return;
        }

        // Store reference for cleanup
        currentContainer = container;

        // Create React root and render
        currentRoot = createRoot(container);
        currentRoot.render(
          <React.StrictMode>
            <BoosteWidgetApp config={config} />
          </React.StrictMode>
        );

        console.log('Booste Widget initialized successfully');
      } catch (error) {
        console.error('Booste Widget initialization error:', error);
      }
    },

    destroy: () => {
      try {
        if (currentRoot) {
          currentRoot.unmount();
          currentRoot = null;
        }
        if (currentContainer && currentContainer.parentNode) {
          currentContainer.parentNode.removeChild(currentContainer);
          currentContainer = null;
        }
        console.log('Booste Widget destroyed');
      } catch (error) {
        console.error('Booste Widget destroy error:', error);
      }
    }
  };

  // Expose to window with type safety
  (window as any).Booste = BoosteWidget;
  
  // Dispatch ready event
  if (typeof CustomEvent !== 'undefined') {
    window.dispatchEvent(new CustomEvent('BoosteWidgetReady', { 
      detail: { version: BoosteWidget.version } 
    }));
  }

  console.log('Booste Widget v' + BoosteWidget.version + ' loaded');
})();

// TypeScript declaration for global window object
declare global {
  interface Window {
    Booste?: BoosteAPI;
  }
}
