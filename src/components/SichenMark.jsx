export function SichenMark({ className = '' }) {
  const classes = ['sichen-mark', className].filter(Boolean).join(' ');

  return <span className={classes} aria-hidden="true"><i /><i /><i /></span>;
}
