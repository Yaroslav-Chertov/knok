'use client'
import Link from 'next/link'
import s from './Sidebar.module.scss'

type Panel = 'leads' | 'campaign' | 'settings'

interface Props {
  panel: Panel
  onPanel: (p: Panel) => void
  leadsCount: number
  totalSent: number
  totalReplied: number
  mobileOpen: boolean
  onClose: () => void
}

const NAV_ITEMS: [Panel, string, string][] = [
  ['leads', '◎', 'Лиды'],
  ['campaign', '◈', 'Кампания'],
  ['settings', '◇', 'Настройки'],
]

export default function Sidebar({ panel, onPanel, leadsCount, totalSent, totalReplied, mobileOpen, onClose }: Props) {
  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && <div className={s.overlay} onClick={onClose} />}

      <aside className={`${s.sidebar} ${mobileOpen ? s['sidebar--open'] : ''}`}>
        <Link href="/" className={s.sidebar__logo}>
          <span style={{ color: 'var(--accent)' }}>◈</span> Knok
        </Link>

        <nav className={s.sidebar__nav}>
          {NAV_ITEMS.map(([key, icon, label]) => (
            <button
              key={key}
              className={`${s.sidebar__link} ${panel === key ? s['sidebar__link--active'] : ''}`}
              onClick={() => { onPanel(key); onClose() }}
            >
              <span className={s.sidebar__link_icon}>{icon}</span>
              <span className={s.sidebar__link_label}>{label}</span>
              {key === 'leads' && (
                <span className={s.sidebar__badge}>{leadsCount}</span>
              )}
            </button>
          ))}
        </nav>

        <div className={s.sidebar__stats}>
          {[
            [leadsCount, 'Лидов'],
            [totalSent, 'Отправлено'],
            [totalReplied, 'Ответили'],
          ].map(([val, label]) => (
            <div key={String(label)} className={s.stat_mini}>
              <div className={s.stat_mini__val}>{val}</div>
              <div className={s.stat_mini__label}>{label}</div>
            </div>
          ))}
        </div>

        <Link href="/" className={s.sidebar__back}>← На главную</Link>
      </aside>
    </>
  )
}
