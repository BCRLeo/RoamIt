import './index.css';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import App from './App.tsx'
import Providers from './components/Providers/Providers.tsx';

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <Providers>
            <App />
        </Providers>
    </StrictMode>
);