// Bộ icon nét đơn giản, kế thừa màu chữ (currentColor)
const base = {
  width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
  strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true,
}

export const IconGrid = (props) => (
  <svg {...base} {...props}><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></svg>
)
export const IconList = (props) => (
  <svg {...base} {...props}><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" /></svg>
)
export const IconPlus = (props) => (
  <svg {...base} {...props}><path d="M12 5v14M5 12h14" /></svg>
)
export const IconSun = (props) => (
  <svg {...base} {...props}><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" /></svg>
)
export const IconMoon = (props) => (
  <svg {...base} {...props}><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" /></svg>
)
export const IconUser = (props) => (
  <svg {...base} {...props}><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></svg>
)
export const IconUsers = (props) => (
  <svg {...base} {...props}><circle cx="9" cy="8" r="3.5" /><path d="M2 21a7 7 0 0 1 14 0" /><path d="M16 4.5a3.5 3.5 0 0 1 0 7M22 21a7 7 0 0 0-4.5-6.5" /></svg>
)
export const IconLogout = (props) => (
  <svg {...base} {...props}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="M16 17l5-5-5-5M21 12H9" /></svg>
)
export const IconSearch = (props) => (
  <svg {...base} {...props}><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>
)

export const IconShield = (props) => (
  <svg {...base} {...props}><path d="M12 3l8 3v5.5c0 4.6-3.2 8.3-8 9.5-4.8-1.2-8-4.9-8-9.5V6l8-3z" /><path d="M8.7 12.2l2.4 2.4 4.3-4.6" /></svg>
)
export const IconBell = (props) => (
  <svg {...base} {...props}><path d="M6 8a6 6 0 0 1 12 0c0 7 3 8 3 8H3s3-1 3-8" /><path d="M10.3 21a1.9 1.9 0 0 0 3.4 0" /></svg>
)
export const IconFile = (props) => (
  <svg {...base} {...props}><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5z" /><path d="M14 3v5h5M9 13h6M9 17h6" /></svg>
)
export const IconAlert = (props) => (
  <svg {...base} {...props}><path d="M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" /><path d="M12 9v4M12 17h.01" /></svg>
)
export const IconPhone = (props) => (
  <svg {...base} {...props}><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z" /></svg>
)
export const IconHelp = (props) => (
  <svg {...base} {...props}><circle cx="12" cy="12" r="9" /><path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 2.5-3 4.5M12 17.5h.01" /></svg>
)
export const IconDownload = (props) => (
  <svg {...base} {...props}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" /></svg>
)
export const IconEye = (props) => (
  <svg {...base} {...props}><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" /><circle cx="12" cy="12" r="3" /></svg>
)
export const IconClock = (props) => (
  <svg {...base} {...props}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
)
export const IconWallet = (props) => (
  <svg {...base} {...props}><path d="M3 7a2 2 0 0 1 2-2h13v4" /><path d="M3 7v11a2 2 0 0 0 2 2h14a1 1 0 0 0 1-1v-3" /><path d="M21 9H5M21 13h-4a2 2 0 0 0 0 4h4v-4z" /></svg>
)
export const IconTrendUp = (props) => (
  <svg {...base} width="14" height="14" {...props}><path d="M22 7l-8.5 8.5-5-5L2 17" /><path d="M16 7h6v6" /></svg>
)
export const IconSettings = (props) => (
  <svg {...base} {...props}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" /></svg>
)
export const IconTarget = (props) => (
  <svg {...base} {...props}><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1.2" /></svg>
)
export const IconChevronRight = (props) => (
  <svg {...base} width="16" height="16" {...props}><path d="M9 6l6 6-6 6" /></svg>
)
export const IconMap = (props) => (
  <svg {...base} {...props}><path d="M9 4L3 6.5v13L9 17l6 3 6-2.5v-13L15 7 9 4z" /><path d="M9 4v13M15 7v13" /></svg>
)
export const IconChart = (props) => (
  <svg {...base} {...props}><path d="M3 3v18h18" /><path d="M7 15l4-5 3 3 5-7" /></svg>
)

// ---------- Biểu tượng bổ sung cho giao diện nổi bật ----------
export const IconGlobe = (props) => (
  <svg {...base} {...props}><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" /></svg>
)
export const IconBolt = (props) => (
  <svg {...base} {...props}><path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" /></svg>
)
export const IconBriefcase = (props) => (
  <svg {...base} {...props}><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3 13h18" /></svg>
)
export const IconCart = (props) => (
  <svg {...base} {...props}><circle cx="9" cy="20" r="1.5" /><circle cx="18" cy="20" r="1.5" /><path d="M2 3h3l2.4 12.2a2 2 0 0 0 2 1.6h8.1a2 2 0 0 0 2-1.5L21 8H6" /></svg>
)
export const IconHeart = (props) => (
  <svg {...base} {...props}><path d="M12 21s-8-5.2-8-11a4.6 4.6 0 0 1 8-3 4.6 4.6 0 0 1 8 3c0 5.8-8 11-8 11z" /></svg>
)
export const IconDots = (props) => (
  <svg {...base} {...props}><circle cx="5" cy="12" r="1.4" /><circle cx="12" cy="12" r="1.4" /><circle cx="19" cy="12" r="1.4" /></svg>
)
export const IconUserCheck = (props) => (
  <svg {...base} {...props}><circle cx="9" cy="8" r="4" /><path d="M2 21a7 7 0 0 1 13-3.6M16 17l2 2 4-4.5" /></svg>
)
export const IconArrowRight = (props) => (
  <svg {...base} {...props}><path d="M5 12h14M13 6l6 6-6 6" /></svg>
)
