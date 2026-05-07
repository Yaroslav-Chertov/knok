'use client'
import { useEffect } from 'react'
import type { Lead, LeadStatus } from '@/types'
import { STATUS_LABELS, personalize } from '@/lib/storage'
import type { Settings } from '@/types'

interface AddLeadModalProps {
  newLead: Partial<Lead>
  onUpdate: (field: keyof Lead, value: string) => void
  onSubmit: () => void
  onClose: () => void
}

interface EditLeadModalProps {
  lead: Lead
  onUpdate: (updates: Lead) => void
  onSubmit: () => void
  onClose: () => void
}

interface PreviewModalProps {
  lead: Lead
  settings: Settings
  onSend: (id: string) => void
  onClose: () => void
}

function useEscapeKey(onClose: () => void) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])
}

const LEAD_FIELDS = [
  { label: 'Компания', field: 'company', type: 'text', ph: 'Авито', full: false },
  { label: 'Сайт', field: 'website', type: 'text', ph: 'avito.ru', full: false },
  { label: 'Имя ЛПР', field: 'contact', type: 'text', ph: 'Иван Петров', full: false },
  { label: 'Должность', field: 'position', type: 'text', ph: 'Директор по маркетингу', full: false },
  { label: 'Email', field: 'email', type: 'email', ph: 'ivan@avito.ru', full: true },
  { label: 'Заметка', field: 'note', type: 'text', ph: '', full: true },
] as const

export function AddLeadModal({ newLead, onUpdate, onSubmit, onClose }: AddLeadModalProps) {
  useEscapeKey(onClose)
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal__header">
          <h3 className="modal__title">Добавить лид</h3>
          <button className="modal__close" onClick={onClose}>✕</button>
        </div>
        <div className="form-grid">
          {LEAD_FIELDS.map(({ label, field, type, ph, full }) => (
            <div key={field} className={`form-group ${full ? 'form-group--full' : ''}`}>
              <label className="form-label">{label}</label>
              <input className="form-input" type={type} placeholder={ph}
                value={(newLead as any)[field] || ''}
                onChange={e => onUpdate(field as keyof Lead, e.target.value)} />
            </div>
          ))}
        </div>
        <div className="modal__actions">
          <button className="btn btn--ghost btn--sm" onClick={onClose}>Отмена</button>
          <button className="btn btn--primary btn--sm" onClick={onSubmit}>Добавить</button>
        </div>
      </div>
    </div>
  )
}

export function EditLeadModal({ lead, onUpdate, onSubmit, onClose }: EditLeadModalProps) {
  useEscapeKey(onClose)
  const upd = (field: keyof Lead, value: string) => onUpdate({ ...lead, [field]: value })

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal__header">
          <h3 className="modal__title">Редактировать</h3>
          <button className="modal__close" onClick={onClose}>✕</button>
        </div>
        <div className="form-grid">
          {(['company', 'website', 'contact', 'position'] as const).map(field => (
            <div key={field} className="form-group">
              <label className="form-label">{{ company: 'Компания', website: 'Сайт', contact: 'Имя ЛПР', position: 'Должность' }[field]}</label>
              <input className="form-input" value={(lead as any)[field] || ''} onChange={e => upd(field, e.target.value)} />
            </div>
          ))}
          <div className="form-group form-group--full">
            <label className="form-label">Email</label>
            <input className="form-input" type="email" value={lead.email || ''} onChange={e => upd('email', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Статус</label>
            <select className="form-select" value={lead.status} onChange={e => upd('status', e.target.value)}>
              {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div className="form-group form-group--full">
            <label className="form-label">Заметка</label>
            <input className="form-input" value={lead.note || ''} onChange={e => upd('note', e.target.value)} />
          </div>
        </div>
        <div className="modal__actions">
          <button className="btn btn--ghost btn--sm" onClick={onClose}>Отмена</button>
          <button className="btn btn--primary btn--sm" onClick={onSubmit}>Сохранить</button>
        </div>
      </div>
    </div>
  )
}

export function PreviewModal({ lead, settings, onSend, onClose }: PreviewModalProps) {
  useEscapeKey(onClose)
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal modal--wide">
        <div className="modal__header">
          <h3 className="modal__title">Предпросмотр письма</h3>
          <button className="modal__close" onClick={onClose}>✕</button>
        </div>
        <div className="form-group" style={{ marginBottom: 14 }}>
          <label className="form-label">Тема</label>
          <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '10px 14px', fontSize: 14 }}>
            {personalize(settings.emailSubject || '', lead)}
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Текст письма</label>
          <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '12px 14px', fontFamily: 'JetBrains Mono, monospace', fontSize: 13, lineHeight: 1.85, whiteSpace: 'pre-wrap', minHeight: 200, maxHeight: 320, overflowY: 'auto', color: 'var(--text-2)' }}>
            {personalize(settings.emailTemplate || '', lead)}
          </div>
        </div>
        <div className="modal__actions">
          <button className="btn btn--ghost btn--sm" onClick={onClose}>Закрыть</button>
          <button className="btn btn--primary btn--sm" disabled={!lead.email} onClick={() => onSend(lead.id)}>📬 Отправить</button>
        </div>
      </div>
    </div>
  )
}
