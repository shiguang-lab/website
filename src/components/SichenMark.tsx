export function SichenMark({ className = '' }: { className?: string }) {
  const classes = ['sichen-mark', className].filter(Boolean).join(' ');

  return <span className={classes} aria-hidden="true"><i /><i /><i /></span>;
}
