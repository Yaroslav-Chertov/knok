import type { Settings } from '@/types'
import s from './dashboard.module.scss'

interface SettingsPanelProps {
  settings: Settings
  onUpdate: (field: keyof Settings, value: string | number) => void
  onSave: () => void
}

export function SettingsPanel({ settings, onUpdate, onSave }: SettingsPanelProps) {
  return (
    <div className={s.panel}>
      <div className={s.panel__header}>
        <div>
          <h1 className={s.panel__title}>Настройки</h1>
          <p className={s.panel__subtitle}>Профиль и интеграции</p>
        </div>
        <button className="btn btn--primary btn--sm" onClick={onSave}>Сохранить</button>
      </div>
      <div className={s.settings_grid}>
        <div className={s.settings_section}>
          <div className={s.settings_section__title}>О компании</div>
          <div className="form-group">
            <label className="form-label">Название</label>
            <input className="form-input" value={settings.companyName || ''} onChange={e => onUpdate('companyName', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Описание и услуги</label>
            <textarea className="form-textarea" rows={4} value={settings.about || ''} onChange={e => onUpdate('about', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Целевая аудитория</label>
            <textarea className="form-textarea" rows={3} value={settings.targetAudience || ''} onChange={e => onUpdate('targetAudience', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Шаблон письма</label>
            <textarea className="form-textarea" rows={6} style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13 }}
              value={settings.emailTemplate || ''} onChange={e => onUpdate('emailTemplate', e.target.value)} />
          </div>
        </div>
        <div className={s.settings_section}>
          <div className={s.settings_section__title}>Интеграции</div>
          <div className="form-group">
            <label className="form-label">Claude API Key</label>
            <input className="form-input" type="password" value={settings.apiKey || ''} onChange={e => onUpdate('apiKey', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">EmailJS Service ID</label>
            <input className="form-input" value={settings.emailjsService || ''} onChange={e => onUpdate('emailjsService', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">EmailJS Template ID</label>
            <input className="form-input" value={settings.emailjsTemplate || ''} onChange={e => onUpdate('emailjsTemplate', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">EmailJS Public Key</label>
            <input className="form-input" value={settings.emailjsKey || ''} onChange={e => onUpdate('emailjsKey', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Email отправителя</label>
            <input className="form-input" type="email" value={settings.senderEmail || ''} onChange={e => onUpdate('senderEmail', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Писем в день: {settings.dailyLimit || 30}</label>
            <div className="range-wrap">
              <input type="range" className="range" min={5} max={50}
                value={settings.dailyLimit || 30} onChange={e => onUpdate('dailyLimit', +e.target.value)} />
              <span className="range-label">{settings.dailyLimit || 30}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
