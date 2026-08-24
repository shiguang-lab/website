export function ZhixuMark({ className = '' }: { className?: string }) {
  const classes = ['zhixu-mark', className].filter(Boolean).join(' ');

  return <span className={classes} aria-hidden="true"><i /><i /><i /><b /></span>;
}
