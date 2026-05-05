'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import {
  loadLeads, saveLeads, loadSettings, saveSettings,
  genId, personalize, formatDateShort, STATUS_LABELS,
  getTodaySent, incrementTodaySent, callClaude, exportLeadsCSV
} from '@/lib/storage'
import type { Lead, LeadStatus, Settings } from '@/types'
import s from './page.module.scss'

type Panel = 'leads' | 'campaign' | 'settings'
type CampStatus = 'idle' | 'running' | 'paused' | 'scheduled'

const STATUS_FILTERS: { key: string; label: string }[] = [
  { key: 'all', label: 'Все' },
  { key: 'new', label: 'Новые' },
  { key: 'sent', label: 'Отправлено' },
  { key: 'replied', label: 'Ответили' },
  { key: 'no_reply', label: 'Без ответа' },
  { key: 'skip', label: 'Пропуск' },
]

const emptyLead = (): Partial<Lead> => ({ company: '', website: '', contact: '', position: '', email: '', note: '' })

export default function Dashboard() {
  const [panel, setPanel] = useState<Panel>('leads')
  const [leads, setLeads] = useState<Lead[]>([])
  const [settings, setSettings] = useState<Settings>({} as Settings)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [toast, setToast] = useState('')
  const [aiRunning, setAiRunning] = useState(false)
  const [aiLog, setAiLog] = useState<string[]>([])
  const [aiText, setAiText] = useState('')
  const [campStatus, setCampStatus] = useState<CampStatus>('idle')
  const [addModal, setAddModal] = useState(false)
  const [editModal, setEditModal] = useState<Lead | null>(null)
  const [previewModal, setPreviewModal] = useState<Lead | null>(null)
  const [newLead, setNewLead] = useState<Partial<Lead>>(emptyLead())

  useEffect(() => {
    setLeads(loadLeads())
    setSettings(loadSettings())
  }, [])

  function persist(updated: Lead[]) {
    setLeads(updated)
    saveLeads(updated)
  }

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(''), 3200)
  }

  function addLog(msg: string) {
    setAiLog(prev => [...prev, msg])
  }

  // ─── Filters ───────────────────────────────────────────
  const filtered = leads.filter(l => {
    const matchStatus = filter === 'all' || l.status === filter
    const q = search.toLowerCase()
    const matchSearch = !q || [l.company, l.email, l.contact, l.position].some(v => (v || '').toLowerCase().includes(q))
    return matchStatus && matchSearch
  })

  // ─── Stats ─────────────────────────────────────────────
  const totalSent = leads.filter(l => ['sent', 'replied', 'no_reply'].includes(l.status)).length
  const totalReplied = leads.filter(l => l.status === 'replied').length

  // ─── CRUD ──────────────────────────────────────────────
  function addLead(partial: Partial<Lead>) {
    const lead: Lead = {
      id: genId(),
      status: 'new',
      createdAt: new Date().toISOString(),
      company: '',
      ...partial,
    }
    persist([...leads, lead])
  }

  function updateLead(id: string, updates: Partial<Lead>) {
    persist(leads.map(l => l.id === id ? { ...l, ...updates } : l))
  }

  function deleteLead(id: string) {
    persist(leads.filter(l => l.id !== id))
    setSelected(prev => { const s = new Set(prev); s.delete(id); return s })
    showToast('Лид удалён')
  }

  // ─── Checkboxes ────────────────────────────────────────
  function toggleAll(checked: boolean) {
    setSelected(checked ? new Set(filtered.map(l => l.id)) : new Set())
  }

  function toggleOne(id: string) {
    setSelected(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s })
  }

  function deleteSelected() {
    if (!confirm(`Удалить ${selected.size} лидов?`)) return
    persist(leads.filter(l => !selected.has(l.id)))
    setSelected(new Set())
    showToast('Удалено')
  }

  // ─── AI Find Leads ─────────────────────────────────────
  async function findLeadsWithAI() {
    if (!settings.apiKey) { showToast('Добавьте Claude API Key в Настройках'); setPanel('settings'); return }
    setAiRunning(true)
    setAiLog([])
    setAiText('AI анализирует вашу ЦА...')
    addLog('Инициализация...')

    try {
      setAiText('Генерация списка компаний...')
      addLog('Запрос к Claude API...')

      const raw = await callClaude(settings.apiKey, `Ты эксперт по B2B продажам и бизнес-разведке.

О компании: ${settings.about}
ЦА: ${settings.targetAudience}
Примеры: ${settings.examples}

Составь список из 15 реальных российских компаний, подходящих под ЦА.
Верни ТОЛЬКО JSON массив без пояснений и markdown:
[{"company":"Авито","website":"avito.ru","industry":"Маркетплейс","contact":"Иван Петров","position":"Директор по маркетингу","email":"i.petrov@avito.ru","note":"Крупнейший маркетплейс РФ"}]
Email формируй по паттерну firstname.lastname@domain. Должности: директор по маркетингу/продукту, CMO, CPO, Head of Design.`, 2000)

      addLog('Парсинг ответа...')
      let companies: any[] = []
      try {
        const clean = raw.replace(/```json|```/g, '').trim()
        companies = JSON.parse(clean)
      } catch {
        const match = raw.match(/\[[\s\S]*\]/)
        if (match) companies = JSON.parse(match[0])
        else throw new Error('Не удалось распарсить ответ AI')
      }

      addLog(`Найдено ${companies.length} компаний`)
      setAiText(`Добавление лидов...`)

      let added = 0
      const current = loadLeads()
      const newLeads = [...current]

      for (const c of companies) {
        if (!c.company) continue
        if (current.find(l => l.company.toLowerCase() === c.company.toLowerCase())) {
          addLog(`Пропуск дубликата: ${c.company}`); continue
        }
        const lead: Lead = {
          id: genId(), status: 'new', createdAt: new Date().toISOString(),
          company: c.company, website: c.website || '', contact: c.contact || '',
          position: c.position || '', email: c.email || '',
          note: c.note || c.industry || '', aiGenerated: true,
        }
        newLeads.push(lead)
        addLog(`✓ ${c.company} — ${c.contact || 'контакт не найден'}`)
        added++
        await sleep(60)
      }

      persist(newLeads)
      setAiText(`✓ Добавлено ${added} новых лидов`)
      showToast(`✓ Добавлено ${added} лидов`)
      setTimeout(() => setAiRunning(false), 4000)

    } catch (e: any) {
      setAiText('Ошибка: ' + e.message)
      showToast('Ошибка: ' + e.message)
      setTimeout(() => setAiRunning(false), 5000)
    }
  }

  // ─── Send email ────────────────────────────────────────
  async function sendEmail(lead: Lead): Promise<boolean> {
    if (!lead.email) return false
    const { emailjsService, emailjsTemplate, emailjsKey, senderEmail, companyName, emailSubject, emailTemplate } = settings
    if (!emailjsService || !emailjsTemplate || !emailjsKey) {
      showToast('Настройте EmailJS в Настройках'); return false
    }
    try {
      const emailjs = (window as any).emailjs
      if (!emailjs) throw new Error('EmailJS не загружен')
      emailjs.init({ publicKey: emailjsKey })
      await emailjs.send(emailjsService, emailjsTemplate, {
        to_email: lead.email,
        to_name: lead.contact || lead.company,
        from_name: companyName || 'Команда',
        reply_to: senderEmail,
        subject: personalize(emailSubject || 'Сотрудничество', lead),
        message: personalize(emailTemplate || '', lead),
      })
      updateLead(lead.id, { status: 'sent', sentAt: new Date().toISOString() })
      incrementTodaySent()
      return true
    } catch (e: any) { showToast('Ошибка отправки: ' + e.message); return false }
  }

  async function sendToLead(id: string) {
    const lead = leads.find(l => l.id === id)
    if (!lead) return
    setPreviewModal(null)
    const ok = await sendEmail(lead)
    if (ok) showToast(`✓ Отправлено: ${lead.email}`)
  }

  async function sendSelected() {
    const toSend = leads.filter(l => selected.has(l.id) && l.email)
    if (!toSend.length) { showToast('Нет email в выбранных'); return }
    if (!confirm(`Отправить ${toSend.length} письмам?`)) return
    let sent = 0
    const limit = settings.dailyLimit || 30
    const delay = (settings.sendDelay || 90) * 1000
    for (const lead of toSend) {
      if (getTodaySent() >= limit) { showToast(`Дневной лимит (${limit})`); break }
      showToast(`Отправка: ${lead.company}...`)
      await sendEmail(lead)
      sent++
      if (sent < toSend.length) await sleep(delay)
    }
    showToast(`✓ Отправлено ${sent} писем`)
    setSelected(new Set())
  }

  // ─── Campaign ──────────────────────────────────────────
  function startCampaign() {
    if (!settings.emailjsService) { showToast('Настройте EmailJS'); setPanel('settings'); return }
    const startDate = new Date(settings.startDate)
    if (startDate > new Date()) { setCampStatus('scheduled'); showToast('Рассылка запланирована'); return }
    setCampStatus('running')
    showToast('▶ Рассылка запущена')
  }

  function pauseCampaign() { setCampStatus('paused'); showToast('⏸ Пауза') }

  // ─── Settings save ─────────────────────────────────────
  function saveSet() { saveSettings(settings); showToast('✓ Сохранено') }
  function updSet(field: keyof Settings, value: string | number) {
    setSettings(prev => ({ ...prev, [field]: value }))
  }

  // ─── Add lead modal ────────────────────────────────────
  function submitAdd() {
    if (!newLead.company) { showToast('Введите название'); return }
    addLead(newLead)
    setAddModal(false)
    setNewLead(emptyLead())
    showToast('✓ Лид добавлен')
  }

  // ─── Edit lead modal ───────────────────────────────────
  function submitEdit() {
    if (!editModal) return
    updateLead(editModal.id, editModal)
    setEditModal(null)
    showToast('✓ Сохранено')
  }

  const sentToday = getTodaySent()
  const rate = totalSent > 0 ? Math.round(totalReplied / totalSent * 100) : 0

  return (
    <div className={s.layout}>
      <div className="ambient">
        <div className="ambient__orb ambient__orb--1" />
        <div className="ambient__orb ambient__orb--2" />
        <div className="ambient__orb ambient__orb--3" />
      </div>

      {/* Sidebar */}
      <aside className={s.sidebar}>
        <Link href="/" className={s.sidebar__logo}>
          <span style={{ color: 'var(--accent)' }}>◈</span> Knok
        </Link>
        <nav className={s.sidebar__nav}>
          {([['leads','◎','Лиды'],['campaign','◈','Кампания'],['settings','◇','Настройки']] as const).map(([key, icon, label]) => (
            <button key={key} className={`${s.sidebar__link} ${panel === key ? s['sidebar__link--active'] : ''}`} onClick={() => setPanel(key)}>
              <span className={s['sidebar__link-icon']}>{icon}</span>
              {label}
              {key === 'leads' && <span className={s.sidebar__badge}>{leads.length}</span>}
            </button>
          ))}
        </nav>
        <div className={s.sidebar__stats}>
          {[['stat-mini', leads.length, 'Лидов'], ['stat-mini', totalSent, 'Отправлено'], ['stat-mini', totalReplied, 'Ответили']].map(([, val, label]) => (
            <div key={String(label)} className={s['stat-mini']}>
              <div className={s['stat-mini__val']}>{val}</div>
              <div className={s['stat-mini__label']}>{label}</div>
            </div>
          ))}
        </div>
        <Link href="/" className={s.sidebar__back}>← На главную</Link>
      </aside>

      <main className={s.main}>

        {/* ── LEADS PANEL ── */}
        {panel === 'leads' && (
          <div className={s.panel}>
            <div className={s.panel__header}>
              <div>
                <h1 className={s.panel__title}>Лиды</h1>
                <p className={s.panel__subtitle}>Компании и контакты для рассылки</p>
              </div>
              <div className={s.panel__actions}>
                <button className="btn btn--ghost btn--sm" onClick={() => exportLeadsCSV(leads)}>↓ CSV</button>
                <button className="btn btn--outline btn--sm" onClick={() => setAddModal(true)}>+ Добавить</button>
                <button className="btn btn--primary btn--sm" onClick={findLeadsWithAI} disabled={aiRunning}>
                  <span>✦</span> Найти с AI
                </button>
              </div>
            </div>

            {aiRunning && (
              <div className={s['ai-progress']}>
                <div className={s['ai-progress__header']}>
                  <div className="spinner" /><span>{aiText}</span>
                </div>
                <div className={s['ai-progress__log']}>
                  {aiLog.map((l, i) => <div key={i}>› {l}</div>)}
                </div>
              </div>
            )}

            <div className={s.toolbar}>
              <input className={s.toolbar__search} placeholder="🔍 Поиск..." value={search} onChange={e => setSearch(e.target.value)} />
              <div className={s.filters}>
                {STATUS_FILTERS.map(f => (
                  <button key={f.key} className={`${s['filter-pill']} ${filter === f.key ? s['filter-pill--active'] : ''}`} onClick={() => setFilter(f.key)}>
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            <div className={s['table-wrap']}>
              <table className={s.table}>
                <thead>
                  <tr>
                    <th><input type="checkbox" className={s.check} onChange={e => toggleAll(e.target.checked)} /></th>
                    <th>Компания</th><th>ЛПР / Должность</th><th>Email</th><th>Статус</th><th>Дата</th><th>Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr><td colSpan={7}>
                      <div className={s.empty}>
                        <div className={s.empty__icon}>◈</div>
                        <div className={s.empty__title}>Лидов пока нет</div>
                        <div className={s.empty__desc}>Нажмите «Найти с AI» или добавьте вручную</div>
                        <button className="btn btn--primary btn--sm" onClick={findLeadsWithAI}>✦ Найти с AI</button>
                      </div>
                    </td></tr>
                  ) : filtered.map(lead => (
                    <tr key={lead.id}>
                      <td><input type="checkbox" className={s.check} checked={selected.has(lead.id)} onChange={() => toggleOne(lead.id)} /></td>
                      <td>
                        <div className={s['cell-company']}>{lead.company}</div>
                        {lead.website && <div className={s['cell-sub']}><a href={lead.website.startsWith('http') ? lead.website : 'https://'+lead.website} target="_blank" style={{color:'inherit',textDecoration:'none'}}>{lead.website}</a></div>}
                      </td>
                      <td>
                        <div>{lead.contact || '—'}</div>
                        {lead.position && <div className={s['cell-sub']}>{lead.position}</div>}
                      </td>
                      <td className={s['cell-email']}>{lead.email || '—'}</td>
                      <td><span className={`status-badge status-badge--${lead.status}`}>{STATUS_LABELS[lead.status]}</span></td>
                      <td className={s['cell-date']}>{lead.sentAt ? formatDateShort(lead.sentAt) : lead.createdAt ? formatDateShort(lead.createdAt) : '—'}</td>
                      <td>
                        <div className={s['row-actions']}>
                          <button className={`${s['row-btn']} ${s['row-btn--send']}`} title="Отправить" onClick={() => setPreviewModal(lead)}>📬</button>
                          <button className={s['row-btn']} title="Редактировать" onClick={() => setEditModal({...lead})}>✎</button>
                          <button className={`${s['row-btn']} ${s['row-btn--del']}`} title="Удалить" onClick={() => deleteLead(lead.id)}>✕</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {selected.size > 0 && (
              <div className={s['bulk-bar']}>
                <span>{selected.size} выбрано</span>
                <button className="btn btn--primary btn--sm" onClick={sendSelected}>📬 Отправить</button>
                <button className="btn btn--ghost btn--sm" onClick={deleteSelected}>✕ Удалить</button>
              </div>
            )}
          </div>
        )}

        {/* ── CAMPAIGN PANEL ── */}
        {panel === 'campaign' && (
          <div className={s.panel}>
            <div className={s.panel__header}>
              <div><h1 className={s.panel__title}>Кампания</h1><p className={s.panel__subtitle}>Управление рассылкой</p></div>
            </div>
            <div className={s['camp-grid']}>
              <div className={s['camp-card']}>
                <div className={s['camp-card__title']}>Статус рассылки</div>
                <div className={s['camp-status']}>
                  <div className={`${s['status-dot']} ${s[`status-dot--${campStatus}`]}`} />
                  <span>{{ idle:'Не запущена', running:'Активна', paused:'На паузе', scheduled:'Запланирована' }[campStatus]}</span>
                </div>
                <div className={s['camp-meta']}>
                  {[['Дата начала', settings.startDate ? new Date(settings.startDate).toLocaleDateString('ru-RU',{day:'numeric',month:'short'}) : '—'],['Лимит/день', String(settings.dailyLimit||30)],['Отправлено сегодня', String(sentToday)]].map(([k,v]) => (
                    <div key={k} className={s['camp-meta__row']}><span>{k}</span><span>{v}</span></div>
                  ))}
                </div>
                <div className={s['camp-card__actions']}>
                  {campStatus !== 'running'
                    ? <button className="btn btn--primary btn--sm" onClick={startCampaign}>▶ Запустить</button>
                    : <button className="btn btn--ghost btn--sm" onClick={pauseCampaign}>⏸ Пауза</button>}
                </div>
              </div>

              <div className={s['camp-card']}>
                <div className={s['camp-card__title']}>Статистика</div>
                <div className={s['stats-grid']}>
                  {[['Всего',leads.length],['Отправлено',totalSent],['Ответили',totalReplied],['Конверсия',rate+'%']].map(([l,v]) => (
                    <div key={String(l)} className={s['stat-box']}>
                      <div className={s['stat-box__val']}>{v}</div>
                      <div className={s['stat-box__label']}>{l}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className={`${s['camp-card']} ${s['camp-card--full']}`}>
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16}}>
                  <div className={s['camp-card__title']}>Шаблон письма</div>
                  <button className="btn btn--ghost btn--xs" onClick={() => setPanel('settings')}>✎ Редактировать</button>
                </div>
                <div className={s['email-preview']}>
                  <div className={s['email-preview__subject']}><strong>Тема:</strong> {settings.emailSubject || '—'}</div>
                  <div className={s['email-preview__body']}>{settings.emailTemplate || '—'}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── SETTINGS PANEL ── */}
        {panel === 'settings' && (
          <div className={s.panel}>
            <div className={s.panel__header}>
              <div><h1 className={s.panel__title}>Настройки</h1><p className={s.panel__subtitle}>Профиль и интеграции</p></div>
              <button className="btn btn--primary btn--sm" onClick={saveSet}>Сохранить</button>
            </div>
            <div className={s['settings-grid']}>
              <div className={s['settings-section']}>
                <div className={s['settings-section__title']}>О компании</div>
                <div className="form-group"><label className="form-label">Название</label><input className="form-input" value={settings.companyName||''} onChange={e => updSet('companyName',e.target.value)} /></div>
                <div className="form-group"><label className="form-label">Описание и услуги</label><textarea className="form-textarea" rows={4} value={settings.about||''} onChange={e => updSet('about',e.target.value)} /></div>
                <div className="form-group"><label className="form-label">Целевая аудитория</label><textarea className="form-textarea" rows={3} value={settings.targetAudience||''} onChange={e => updSet('targetAudience',e.target.value)} /></div>
              </div>
              <div className={s['settings-section']}>
                <div className={s['settings-section__title']}>Интеграции</div>
                <div className="form-group"><label className="form-label">Claude API Key</label><input className="form-input" type="password" value={settings.apiKey||''} onChange={e => updSet('apiKey',e.target.value)} /></div>
                <div className="form-group"><label className="form-label">EmailJS Service ID</label><input className="form-input" value={settings.emailjsService||''} onChange={e => updSet('emailjsService',e.target.value)} /></div>
                <div className="form-group"><label className="form-label">EmailJS Template ID</label><input className="form-input" value={settings.emailjsTemplate||''} onChange={e => updSet('emailjsTemplate',e.target.value)} /></div>
                <div className="form-group"><label className="form-label">EmailJS Public Key</label><input className="form-input" value={settings.emailjsKey||''} onChange={e => updSet('emailjsKey',e.target.value)} /></div>
                <div className="form-group"><label className="form-label">Email отправителя</label><input className="form-input" type="email" value={settings.senderEmail||''} onChange={e => updSet('senderEmail',e.target.value)} /></div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Add Lead Modal */}
      {addModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setAddModal(false)}>
          <div className="modal">
            <div className="modal__header"><h3 className="modal__title">Добавить лид</h3><button className="modal__close" onClick={() => setAddModal(false)}>✕</button></div>
            <div className="form-grid">
              {([['Компания','company','text','Авито'],['Сайт','website','text','avito.ru'],['Имя ЛПР','contact','text','Иван Петров'],['Должность','position','text','Директор по маркетингу'],['Email','email','email','ivan@avito.ru'],['Заметка','note','text','']] as const).map(([label, field, type, ph]) => (
                <div key={field} className={`form-group ${['email','note'].includes(field) ? 'form-group--full' : ''}`}>
                  <label className="form-label">{label}</label>
                  <input className="form-input" type={type} placeholder={ph} value={(newLead as any)[field]||''} onChange={e => setNewLead(p => ({...p,[field]:e.target.value}))} />
                </div>
              ))}
            </div>
            <div className="modal__actions"><button className="btn btn--ghost btn--sm" onClick={() => setAddModal(false)}>Отмена</button><button className="btn btn--primary btn--sm" onClick={submitAdd}>Добавить</button></div>
          </div>
        </div>
      )}

      {/* Edit Lead Modal */}
      {editModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setEditModal(null)}>
          <div className="modal">
            <div className="modal__header"><h3 className="modal__title">Редактировать</h3><button className="modal__close" onClick={() => setEditModal(null)}>✕</button></div>
            <div className="form-grid">
              {([['Компания','company'],['Сайт','website'],['Имя ЛПР','contact'],['Должность','position']] as const).map(([label, field]) => (
                <div key={field} className="form-group">
                  <label className="form-label">{label}</label>
                  <input className="form-input" value={(editModal as any)[field]||''} onChange={e => setEditModal(p => p ? {...p,[field]:e.target.value} : p)} />
                </div>
              ))}
              <div className="form-group form-group--full"><label className="form-label">Email</label><input className="form-input" type="email" value={editModal.email||''} onChange={e => setEditModal(p => p ? {...p,email:e.target.value} : p)} /></div>
              <div className="form-group">
                <label className="form-label">Статус</label>
                <select className="form-select" value={editModal.status} onChange={e => setEditModal(p => p ? {...p,status:e.target.value as LeadStatus} : p)}>
                  {Object.entries(STATUS_LABELS).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div className="form-group form-group--full"><label className="form-label">Заметка</label><input className="form-input" value={editModal.note||''} onChange={e => setEditModal(p => p ? {...p,note:e.target.value} : p)} /></div>
            </div>
            <div className="modal__actions"><button className="btn btn--ghost btn--sm" onClick={() => setEditModal(null)}>Отмена</button><button className="btn btn--primary btn--sm" onClick={submitEdit}>Сохранить</button></div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setPreviewModal(null)}>
          <div className="modal modal--wide">
            <div className="modal__header"><h3 className="modal__title">Предпросмотр письма</h3><button className="modal__close" onClick={() => setPreviewModal(null)}>✕</button></div>
            <div className="form-group" style={{marginBottom:14}}>
              <label className="form-label">Тема</label>
              <div style={{background:'rgba(255,255,255,0.04)',border:'1px solid var(--border)',borderRadius:'var(--radius-sm)',padding:'10px 14px',fontSize:14}}>{personalize(settings.emailSubject||'',previewModal)}</div>
            </div>
            <div className="form-group">
              <label className="form-label">Текст</label>
              <div style={{background:'rgba(255,255,255,0.04)',border:'1px solid var(--border)',borderRadius:'var(--radius-sm)',padding:'12px 14px',fontFamily:'JetBrains Mono, monospace',fontSize:13,lineHeight:1.85,whiteSpace:'pre-wrap',minHeight:200,maxHeight:320,overflowY:'auto',color:'var(--text-2)'}}>{personalize(settings.emailTemplate||'',previewModal)}</div>
            </div>
            <div className="modal__actions">
              <button className="btn btn--ghost btn--sm" onClick={() => setPreviewModal(null)}>Закрыть</button>
              <button className="btn btn--primary btn--sm" disabled={!previewModal.email} onClick={() => sendToLead(previewModal.id)}>📬 Отправить</button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className="toast">{toast}</div>}

      {/* EmailJS */}
      <script src="https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js" async />
    </div>
  )
}

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)) }
