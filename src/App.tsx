import { Scrollbar } from '@shiguang2/components';
import { lazy, Suspense, type ReactNode } from 'react';
import { Route, Routes } from 'react-router-dom';
import { SICHEN_LANDING_PATH } from './config/productUrls';
import { HomePage } from './pages/HomePage';
import { SichenPage } from './pages/SichenPage';
import { AccountPage } from './pages/AccountPage';
import { PortalPage } from './pages/PortalPage';

const MicroAppPage = lazy(() => import('./pages/MicroAppPage').then((module) => ({ default: module.MicroAppPage })));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage').then((module) => ({ default: module.NotFoundPage })));
const LoginPage = lazy(() => import('./pages/LoginPage').then((module) => ({ default: module.LoginPage })));
const RegisterPage = lazy(() => import('./pages/RegisterPage').then((module) => ({ default: module.RegisterPage })));
const AuthCallbackPage = lazy(() => import('./pages/AuthCallbackPage').then((module) => ({ default: module.AuthCallbackPage })));
const TermsPage = lazy(() => import('./pages/LegalPage').then((module) => ({ default: module.TermsPage })));
const PrivacyPage = lazy(() => import('./pages/LegalPage').then((module) => ({ default: module.PrivacyPage })));
const LoginHelpPage = lazy(() => import('./pages/LoginHelpPage').then((module) => ({ default: module.LoginHelpPage })));

function DeferredPage({ children }: { children: ReactNode }) {
  return <Suspense fallback={<div className="tw:min-h-screen tw:bg-[#f7f8fa]" />}>{children}</Suspense>;
}

export function App() {
  return (
    <Scrollbar className="site-scrollbar" scrollX={false}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path={SICHEN_LANDING_PATH} element={<SichenPage />} />
        <Route path="/login" element={<DeferredPage><LoginPage /></DeferredPage>} />
        <Route path="/register" element={<DeferredPage><RegisterPage /></DeferredPage>} />
        <Route path="/account/*" element={<AccountPage />} />
        <Route path="/portal/*" element={<PortalPage />} />
        <Route path="/auth/callback" element={<DeferredPage><AuthCallbackPage /></DeferredPage>} />
        <Route path="/terms" element={<DeferredPage><TermsPage /></DeferredPage>} />
        <Route path="/privacy" element={<DeferredPage><PrivacyPage /></DeferredPage>} />
        <Route path="/login-help" element={<DeferredPage><LoginHelpPage /></DeferredPage>} />
        <Route path="/app/:appId/*" element={<DeferredPage><MicroAppPage /></DeferredPage>} />
        <Route path="*" element={<DeferredPage><NotFoundPage /></DeferredPage>} />
      </Routes>
    </Scrollbar>
  );
}
