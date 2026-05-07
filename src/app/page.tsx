'use client'

import { useState, useEffect } from 'react'
import { loadSettings, defaultSettings } from '@/lib/storage'
import type { Settings } from '@/types'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import HeroSection from '@/components/landing/HeroSection'
import FeaturesSection from '@/components/landing/FeaturesSection'
import SetupWizard from '@/components/landing/SetupWizard'
import s from './page.module.scss'

export default function Home() {
  const [settings, setSettings] = useState<Settings>(defaultSettings)
  const [hasConfig, setHasConfig] = useState(false)

  useEffect(() => {
    const loaded = loadSettings()
    setSettings(loaded)
    setHasConfig(!!loaded.companyName)
  }, [])

  function upd(field: keyof Settings, value: string | number) {
    setSettings(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className={s.page}>
      <div className="ambient">
        <div className="ambient__orb ambient__orb--1" />
        <div className="ambient__orb ambient__orb--2" />
        <div className="ambient__orb ambient__orb--3" />
      </div>

      <Navbar hasDashboard={hasConfig} />
      <HeroSection />
      <FeaturesSection />
      <SetupWizard settings={settings} onChange={upd} />
      <Footer />
    </div>
  )
}
