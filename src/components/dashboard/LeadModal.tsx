'use client'
import { useEffect } from 'react'
import type { Lead, LeadStatus } from '@/types'
import { STATUS_LABELS } from '@/lib/storage'

interface AddModalProps {
  lead: Partial<Lead>
  onChange: (updates: Partial<Lead>) => void
  onSubmit: () => void
  onClose: () => void
}

interface EditModalProps {
  lead: Lead
  onChange: (updates: Partial<Lead>) => void
  onSubmit: () => void
  onClose: () => void
}

interface PreviewModalProps {
  subject: string
  body: string
  email: string
  onSend: () => void
  onClose: () => void
}

function useEscClose(onClose: () => void) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])
}

export function AddLeadModal({ lead, onChange, onSubmit, onClose }: AddModalProps) {
  useEscClose(onClose)
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal__header">
          <h3 className="modal__title">Добавить лид</h3>
          <button className="modal__close" onClick={onClose}>✕</button>
        </div>
        <div className="form-grid">
          {([['Компания','company','text','Авито'],['Сайт','website','text','avito.ru'],['Имя ЛПР','contact','text','Иван Петров'],['Должность','position','text','Директор по маркетингу'],['Email','email','email','ivan@avito.ru'],['Заметка','note','text','']] as const).map(([label, field, type, ph]) => (
            <div key={field} className={`form-group ${['email','note'].includes(field) ? 'form-group--full' : ''}`}>
              <label className="form-label">{label}</label>
              <input className="form-input" type={type} placeholder={ph} value={(lead as any)[field]||''} onChange={e => onChange({ [field]: e.target.value })} />
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

export function EditLeadModal({ lead, onChange, onSubmit, onClose }: EditModalProps) {
  useEscClose(onClose)
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal__header">
          <h3 className="modal__title">Редактировать</h3>
          <button className="modal__close" onClick={onClose}>✕</button>
        </div>
        <div className="form-grid">
          {([['Компания','company'],['Сайт','website'],['Имя ЛПР','contact'],['Должность','position']] as const).map(([label, field]) => (
            <div key={field} className="form-group">
              <label className="form-label">{label}</label>
              <input className="form-input" value={(lead as any)[field]||''} onChange={e => onChange({ [field]: e.target.value })} />
            </div>
          ))}
          <div className="form-group form-group--full">
            <label className="form-label">Email</label>
            <input className="form-input" type="email" value={lead.email||''} onChange={e => onChange({ email: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Статус</label>
            <select className="form-select" value={lead.status} onChange={e => onChange({ status: e.target.value as LeadStatus })}>
              {Object.entries(STATUS_LABELS).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div className="form-group form-group--full">
            <label className="form-label">Заметка</label>
            <input className="form-input" value={lead.note||''} onChange={e => onChange({ note: e.target.value })} />
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

export function PreviewModal({ subject, body, email, onSend, onClose }: PreviewModalProps) {
  useEscClose(onClose)
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal modal--wide">
        <div className="modal__header">
          <h3 className="modal__title">Предпросмотр письма</h3>
          <button className="modal__close" onClick={onClose}>✕</button>
        </div>
        <div className="form-group" style={{ marginBottom: 14 }}>
          <label className="form-label">Тема</label>
          <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '10px 14px', fontSize: 14 }}>{subject}</div>
        </div>
        <div className="form-group">
          <label className="form-label">Текст</label>
          <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '12px 14px', fontFamily: 'var(--font-mono)', fontSize: 13, lineHeight: 1.85, whiteSpace: 'pre-wrap', minHeight: 180, maxHeight: 300, overflowY: 'auto', color: 'var(--text-2)' }}>{body}</div>
        </div>
        <div className="modal__actions">
          <button className="btn btn--ghost btn--sm" onClick={onClose}>Закрыть</button>
          <button className="btn btn--primary btn--sm" disabled={!email} onClick={onSend}>📬 Отправить</button>
        </div>
      </div>
    </div>
  )
}
