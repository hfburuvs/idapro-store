import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import { HelmetProvider } from 'react-helmet-async'
import './index.css'
import App from './App.tsx'

// Add global error handler for uncaught errors
try {
  const originalConsoleError = console.error;
  console.error = function(...args: any[]) {
    originalConsoleError.apply(console, args);
    // Log to a simple error display if root exists
    const root = document.getElementById('root');
    if (root && root.children.length === 0) {
      root.innerHTML = `<div style="padding:20px;font-family:sans-serif;max-width:800px;margin:0 auto;">
        <h2 style="color:#c00;">Rendering Error</h2>
        <p style="color:#666;">The app failed to render. Check the browser console for details.</p>
        <pre style="background:#f5f5f5;padding:10px;border-radius:4px;overflow:auto;font-size:12px;">${(args[0] || '').toString().replace(/</g, '&lt;')}</pre>
        <p style="margin-top:20px;color:#999;font-size:12px;">This is a diagnostic message for debugging purposes.</p>
      </div>`;
    }
  };
} catch (e) { /* ignore */ }

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </BrowserRouter>,
)
