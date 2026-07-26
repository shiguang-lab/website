import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './styles/semi.less';
import './styles/tailwind.less';
import './styles/home.less';
import './styles/sichen.less';
import './styles/login.less';
import './styles/account.less';
import { App } from './App';
import { startUmamiAutoTracking } from './analytics/umami';
import { AuthProvider } from './auth/AuthProvider';

startUmamiAutoTracking();

const root = document.getElementById('root');
const application = (
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);

if (!root) throw new Error('Missing #root element');

if (root.childElementCount > 0) {
  hydrateRoot(root, application);
} else {
  createRoot(root).render(application);
}
