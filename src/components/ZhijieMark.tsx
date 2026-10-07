export function ZhijieMark({ className = '' }: { className?: string }) {
  return (
    <svg className={`zhijie-mark ${className}`} viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 6h12a9 9 0 0 1 9 9v12M6 5v12a9 9 0 0 0 9 9h12" />
      <path d="M5 15h11a1 1 0 0 1 1 1v11M15 5v11a1 1 0 0 0 1 1h11" />
    </svg>
  );
}
