import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';

// Sidan börjar alltid överst vid omladdning. Chrome på iPhone återställde annars skrollningen medan sidan bara visade
// "Hämtar kalendern …", och rubriken hamnade under adressraden (#39). Kalendern laddas ändå om från början.
history.scrollRestoration = 'manual';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
