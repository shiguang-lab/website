/** @param {{ name: string }} props */
export function AuthProviderIcon({ name }) {
  if (name === 'wechat') {
    return (
      <svg viewBox="0 0 32 32" aria-hidden="true">
        <path d="M13.2 6.3c-5.1 0-9.2 3.2-9.2 7.2 0 2.3 1.4 4.4 3.6 5.7l-.9 3 3.2-1.7c1 .3 2.1.5 3.3.5h.8a7.6 7.6 0 0 1-.4-2.3c0-4.3 4.1-7.7 9.2-7.7h.5c-1.2-2.8-5.2-4.7-10.1-4.7Z" />
        <path d="M28 18.6c0-3.4-3.6-6.2-8-6.2s-8 2.8-8 6.2 3.6 6.2 8 6.2c1 0 2-.1 2.8-.4l2.8 1.5-.7-2.6c1.9-1.1 3.1-2.8 3.1-4.7Z" />
        <circle cx="10" cy="12.6" r="1" className="provider-eye" />
        <circle cx="16.2" cy="12.6" r="1" className="provider-eye" />
        <circle cx="17.3" cy="17.8" r=".9" className="provider-eye" />
        <circle cx="22.8" cy="17.8" r=".9" className="provider-eye" />
      </svg>
    );
  }

  if (name === 'github') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 2.5a9.7 9.7 0 0 0-3.07 18.9c.48.08.66-.2.66-.46v-1.7c-2.68.58-3.25-1.14-3.25-1.14-.44-1.1-1.07-1.4-1.07-1.4-.88-.6.07-.59.07-.59.97.07 1.48 1 1.48 1 .86 1.48 2.26 1.05 2.81.8.09-.63.34-1.05.61-1.3-2.14-.24-4.39-1.07-4.39-4.77 0-1.05.38-1.92 1-2.59-.1-.24-.43-1.22.1-2.55 0 0 .81-.26 2.67.99A9.3 9.3 0 0 1 12 7.36c.83 0 1.64.11 2.43.33 1.85-1.25 2.66-.99 2.66-.99.53 1.33.2 2.31.1 2.55.62.67 1 1.54 1 2.59 0 3.71-2.26 4.52-4.4 4.76.35.3.65.88.65 1.78v2.56c0 .26.18.55.66.46A9.7 9.7 0 0 0 12 2.5Z" />
      </svg>
    );
  }

  if (name === 'google') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path fill="#4285F4" d="M21.8 12.2c0-.7-.1-1.4-.2-2H12v3.8h5.5a4.7 4.7 0 0 1-2 3.1v2.6h3.2c1.9-1.8 3.1-4.4 3.1-7.5Z" />
        <path fill="#34A853" d="M12 22c2.7 0 5-.9 6.7-2.4l-3.2-2.6c-.9.6-2 1-3.5 1-2.7 0-5-1.8-5.8-4.3H3v2.7A10 10 0 0 0 12 22Z" />
        <path fill="#FBBC05" d="M6.2 13.7a6 6 0 0 1 0-3.4V7.6H3a10 10 0 0 0 0 8.8l3.2-2.7Z" />
        <path fill="#EA4335" d="M12 6c1.5 0 2.8.5 3.9 1.6l2.9-2.9C17 3 14.7 2 12 2a10 10 0 0 0-9 5.6l3.2 2.7C7 7.8 9.3 6 12 6Z" />
      </svg>
    );
  }

  if (name === 'feishu') {
    return (
      <img src="/assets/feishu-logo.png" width="700" height="700" alt="" aria-hidden="true" />
    );
  }

  if (name === 'linkedin') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="3" y="3" width="18" height="18" rx="3" />
        <circle cx="8" cy="8" r="1.3" className="provider-cutout" />
        <path className="provider-cutout" d="M7 10.5h2v6.5H7zM11 10.5h2v.9c.7-.8 1.5-1.2 2.5-1.2 2 0 2.8 1.3 2.8 3.5V17h-2v-3c0-1.2-.4-1.9-1.4-1.9-1.2 0-1.7.8-1.7 2.2V17H11v-6.5Z" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M17.8 3.2 5.1 8.1c-.9.4-.9 1.7.1 2l5.1 1.6-3.1 2.1c-.7.5-.4 1.6.4 1.7l3.5.4-1 3.5c-.2.8.8 1.3 1.4.8l3.1-3 2.1.7c.7.2 1.4-.3 1.4-1l1.2-12.6c.1-.8-.7-1.4-1.5-1.1Z" />
    </svg>
  );
}
