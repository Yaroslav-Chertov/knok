'use client'
import type { Lead, LeadStatus } from '@/types'
import { STATUS_LABELS } from '@/lib/storage'
import s from './dashboard.module.scss'

const STATUS_FILTERS = [
  { key: 'all', label: 'Все' },
  { key: 'new', label: 'Новые' },
  { key: 'sent', label: 'Отправлено' },
  { key: 'replied', label: 'Ответили' },
  { key: 'no_reply', label: 'Без ответа' },
  { key: 'skip', label: 'Пропуск' },
]

interface LeadsPanelProps {
  leads: Lead[]
  filtered: Lead[]
  selected: Set<string>
  filter: string
  search: string
  aiRunning: boolean
  aiText: string
  aiLog: string[]
  onFilterChange: (f: string) => void
  onSearchChange: (s: string) => void
  onToggleAll: (checked: boolean) => void
  onToggleOne: (id: string) => void
  onDelete: (id: string) => void
  onEdit: (lead: Lead) => void
  onPreview: (lead: Lead) => void
  onAddModal: () => void
  onFindWithAI: () => void
  onExportCSV: () => void
  onSendSelected: () => void
  onDeleteSelected: () => void
}

export function LeadsPanel({
  leads, filtered, selected, filter, search, aiRunning, aiText, aiLog,
  onFilterChange, onSearchChange, onToggleAll, onToggleOne, onDelete, onEdit, onPreview,
  onAddModal, onFindWithAI, onExportCSV, onSendSelected, onDeleteSelected
}: LeadsPanelProps) {
  const formatDate = (d?: string) => {
    if (!d) return '—'
    return new Date(d).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
  }

  return (
    <div className={s.panel}>
      <div className={s.panel__header}>
        <div>
          <h1 className={s.panel__title}>Лиды</h1>
          <p className={s.panel__subtitle}>Компании и контакты для рассылки</p>
        </div>
        <div className={s.panel__actions}>
          <button className="btn btn--ghost btn--sm" onClick={onExportCSV}>↓ CSV</button>
          <button className="btn btn--outline btn--sm" onClick={onAddModal}>+ Добавить</button>
          <button className="btn btn--primary btn--sm" onClick={onFindWithAI} disabled={aiRunning}>
            <span>✦</span> Найти с AI
          </button>
        </div>
      </div>

      {aiRunning && (
        <div className={s.ai_progress}>
          <div className={s.ai_progress__header}>
            <div className="spinner" /><span>{aiText}</span>
          </div>
          <div className={s.ai_progress__log}>
            {aiLog.map((l, i) => <div key={i}>› {l}</div>)}
          </div>
        </div>
      )}

      <div className={s.toolbar}>
        <input
          className={s.toolbar__search}
          placeholder="🔍 Поиск..."
          value={search}
          onChange={e => onSearchChange(e.target.value)}
        />
        <div className={s.filters}>
          {STATUS_FILTERS.map(f => (
            <button
              key={f.key}
              className={`${s.filter_pill} ${filter === f.key ? s['filter_pill--active'] : ''}`}
              onClick={() => onFilterChange(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className={s.table_wrap}>
        <table className={s.table}>
          <thead>
            <tr>
              <th><input type="checkbox" className={s.check} onChange={e => onToggleAll(e.target.checked)} /></th>
              <th>Компания</th>
              <th className={s.th_hide_mobile}>ЛПР / Должность</th>
              <th className={s.th_hide_tablet}>Email</th>
              <th>Статус</th>
              <th className={s.th_hide_tablet}>Дата</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={7}>
                <div className={s.empty}>
                  <div className={s.empty__icon}>◈</div>
                  <div className={s.empty__title}>Лидов пока нет</div>
                  <div className={s.empty__desc}>Нажмите «Найти с AI» или добавьте вручную</div>
                  <button className="btn btn--primary btn--sm" onClick={onFindWithAI}>✦ Найти с AI</button>
                </div>
              </td></tr>
            ) : filtered.map(lead => (
              <tr key={lead.id}>
                <td><input type="checkbox" className={s.check} checked={selected.has(lead.id)} onChange={() => onToggleOne(lead.id)} /></td>
                <td>
                  <div className={s.cell_company}>{lead.company}</div>
                  {lead.website && (
                    <div className={s.cell_sub}>
                      <a href={lead.website.startsWith('http') ? lead.website : 'https://' + lead.website}
                        target="_blank" style={{ color: 'inherit', textDecoration: 'none' }}>
                        {lead.website}
                      </a>
                    </div>
                  )}
                </td>
                <td className={s.td_hide_mobile}>
                  <div>{lead.contact || '—'}</div>
                  {lead.position && <div className={s.cell_sub}>{lead.position}</div>}
                </td>
                <td className={s.td_hide_tablet}>
                  <div className={s.cell_email}>{lead.email || '—'}</div>
                </td>
                <td><span className={`status-badge status-badge--${lead.status}`}>{STATUS_LABELS[lead.status]}</span></td>
                <td className={s.td_hide_tablet}>
                  <div className={s.cell_date}>{lead.sentAt ? formatDate(lead.sentAt) : formatDate(lead.createdAt)}</div>
                </td>
                <td>
                  <div className={s.row_actions}>
                    <button className={`${s.row_btn} ${s['row_btn--send']}`} title="Отправить" onClick={() => onPreview(lead)}>📬</button>
                    <button className={s.row_btn} title="Редактировать" onClick={() => onEdit({ ...lead })}>✎</button>
                    <button className={`${s.row_btn} ${s['row_btn--del']}`} title="Удалить" onClick={() => onDelete(lead.id)}>✕</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected.size > 0 && (
        <div className={s.bulk_bar}>
          <span>{selected.size} выбрано</span>
          <button className="btn btn--primary btn--sm" onClick={onSendSelected}>📬 Отправить</button>
          <button className="btn btn--ghost btn--sm" onClick={onDeleteSelected}>✕ Удалить</button>
        </div>
      )}
    </div>
  )
}
