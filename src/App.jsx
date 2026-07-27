import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import { SICHEN_LANDING_PATH } from './config/productUrls';
import { HomePage } from './pages/HomePage';
import { SichenPage } from './pages/SichenPage';

const MicroAppPage = lazy(() => import('./pages/MicroAppPage').then((module) => ({ default: module.MicroAppPage })));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage').then((module) => ({ default: module.NotFoundPage })));
const LoginPage = lazy(() => import('./pages/LoginPage').then((module) => ({ default: module.LoginPage })));
const RegisterPage = lazy(() => import('./pages/RegisterPage').then((module) => ({ default: module.RegisterPage })));
const AccountPage = lazy(() => import('./pages/AccountPage').then((module) => ({ default: module.AccountPage })));
const AuthCallbackPage = lazy(() => import('./pages/AuthCallbackPage').then((module) => ({ default: module.AuthCallbackPage })));

/** @param {{ children: import('react').ReactNode }} props */
function DeferredPage({ children }) {
  return <Suspense fallback={<div className="tw:min-h-screen tw:bg-[#f7f8fa]" />}>{children}</Suspense>;
}

export function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path={SICHEN_LANDING_PATH} element={<SichenPage />} />
      <Route path="/login" element={<DeferredPage><LoginPage /></DeferredPage>} />
      <Route path="/register" element={<DeferredPage><RegisterPage /></DeferredPage>} />
      <Route path="/account" element={<DeferredPage><AccountPage /></DeferredPage>} />
      <Route path="/auth/callback" element={<DeferredPage><AuthCallbackPage /></DeferredPage>} />
      <Route path="/app/:appId/*" element={<DeferredPage><MicroAppPage /></DeferredPage>} />
      <Route path="*" element={<DeferredPage><NotFoundPage /></DeferredPage>} />
    </Routes>
  );
}
