import { useState } from 'react'
import { IconMoon, IconSun } from './Icons.jsx'

export default function ThemeToggle() {
  // index.html đã gán data-theme trước khi React chạy
  const [theme, setTheme] = useState(() => document.documentElement.dataset.theme || 'light')
  const isDark = theme === 'dark'

  const toggle = () => {
    const next = isDark ? 'light' : 'dark'
    document.documentElement.dataset.theme = next
    try { localStorage.setItem('theme', next) } catch { /* trình duyệt chặn lưu trữ: bỏ qua */ }
    setTheme(next)
  }

  const label = isDark ? 'Chuyển sang giao diện sáng' : 'Chuyển sang giao diện tối'
  return (
    <button type="button" className="icon-btn" onClick={toggle} aria-label={label} title={label}>
      {isDark ? <IconSun /> : <IconMoon />}
    </button>
  )
}
