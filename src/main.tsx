import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found');
}

try {
  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
} catch (error) {
  console.error('Failed to render app:', error);
  rootElement.innerHTML = `
    <div style="display: flex; align-items: center; justify-content: center; height: 100vh; font-family: sans-serif;">
      <div style="text-align: center; padding: 20px;">
        <h1 style="color: #dc2626; margin-bottom: 10px;">Application Error</h1>
        <p style="color: #4b5563;">Failed to load the application. Check the console for details.</p>
        <pre style="margin-top: 20px; padding: 10px; background: #f3f4f6; border-radius: 4px; text-align: left; font-size: 12px;">${error}</pre>
      </div>
    </div>
  `;
}
