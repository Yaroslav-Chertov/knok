'use client'
import Link from 'next/link'
import s from './Navbar.module.scss'

interface NavbarProps {
  hasDashboard?: boolean
}

export default function Navbar({ hasDashboard }: NavbarProps) {
  return (
    <nav className="nav">
      <Link href="/" className="nav__logo">
        <span className="nav__logo-icon">◈</span>Knok
      </Link>
      <div className="nav__actions">
        {hasDashboard && (
          <Link href="/dashboard" className="btn btn--ghost btn--sm">
            Dashboard →
          </Link>
        )}
        <button
          className="btn btn--primary btn--sm"
          onClick={() =>
            document.getElementById('setup')?.scrollIntoView({ behavior: 'smooth' })
          }
        >
          Попробовать
        </button>
      </div>
    </nav>
  )
}
