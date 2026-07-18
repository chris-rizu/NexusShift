import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';

// Very simple test to see if anything renders
function App() {
  return (
    <div style={{
      padding: '20px',
      backgroundColor: '#f3f4f6',
      minHeight: '100vh',
      color: '#1f2937'
    }}>
      <h1 style={{ fontSize: '24px', marginBottom: '16px', color: '#1f2937' }}>
        Hello from React!
      </h1>
      <p style={{ fontSize: '16px', color: '#6b7280' }}>
        If you can see this, React is working!
      </p>
      <div style={{
        padding: '10px',
        backgroundColor: '#3b82f6',
        color: 'white',
        borderRadius: '4px',
        display: 'inline-block'
      }}>
        App is rendering correctly
      </div>
    </div>
  );
}

// Log to console to help debug
console.log('Main.tsx loaded');
console.log('Looking for root element...');

const rootElement = document.getElementById('root');

console.log('Root element:', rootElement);

if (!rootElement) {
  console.error('❌ ERROR: Root element not found!');
  document.body.innerHTML = '<div style="color:red; font-size:20px; padding:20px;">Error: Root element not found</div>';
} else {
  console.log('✓ Root element found, creating React root...');

  try {
    const reactRoot = createRoot(rootElement);
    console.log('✓ React root created, rendering App...');

    reactRoot.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );

    console.log('✓ App rendered successfully!');
  } catch (error) {
    console.error('❌ ERROR rendering app:', error);
    document.body.innerHTML = '<div style="color:red; font-size:20px; padding:20px;">Error rendering app: ' + error + '</div>';
  }
}

export default {};
