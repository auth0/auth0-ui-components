import { createRoot } from 'react-dom/client';

import App from './App.tsx';
import './auth0-ui-components/styles/globals.css';
import './index.css';
import './i18n'; // Initialize i18n

createRoot(document.getElementById('root')!).render(<App />);
