/**
 * 平台标识图标。Windows 用四格徽标、macOS 用苹果剪影、Linux 用终端提示符,
 * 统一 currentColor 着色,尺寸由外层字号控制。
 * @param {{ name: 'windows' | 'mac' | 'linux', className?: string }} props
 */
export function PlatformGlyph({ name, className }) {
  if (name === 'windows') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M3 5.55 10.2 4.5v7H3v-5.95zM3 18.45V12.5h7.2v7L3 18.45zM11.4 4.32 21 3v8.5h-9.6V4.32zM21 12.5V21l-9.6-1.32V12.5H21z" />
      </svg>
    );
  }
  if (name === 'mac') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.03 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.56-1.702" />
      </svg>
    );
  }
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2.6" y="4" width="18.8" height="16" rx="3" />
      <path d="m7.4 9.4 3.2 2.8-3.2 2.8M12.8 15.4h4" />
    </svg>
  );
}
