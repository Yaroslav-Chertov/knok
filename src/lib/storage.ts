import type { Lead, Settings } from '@/types'

/* ─── Settings ─── */
export const defaultSettings: Settings = {
  companyName: '',
  about: '',
  targetAudience: '',
  examples: '',
  apiKey: '',
  emailSubject: '',
  emailTemplate: '',
  senderEmail: '',
  startDate: new Date().toISOString().split('T')[0],
  emailjsService: '',
  emailjsTemplate: '',
  emailjsKey: '',
  dailyLimit: 30,
  sendDelay: 90,
}

export function loadSettings(): Settings {
  if (typeof window === 'undefined') return defaultSettings
  try {
    const raw = localStorage.getItem('cr_settings')
    return raw ? { ...defaultSettings, ...JSON.parse(raw) } : defaultSettings
  } catch { return defaultSettings }
}

export function saveSettings(s: Settings): void {
  localStorage.setItem('cr_settings', JSON.stringify(s))
}

/* ─── Leads ─── */
export function loadLeads(): Lead[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem('cr_leads') || '[]')
  } catch { return [] }
}

export function saveLeads(leads: Lead[]): void {
  localStorage.setItem('cr_leads', JSON.stringify(leads))
}

/* ─── Daily counter ─── */
export function getTodaySent(): number {
  try {
    const today = new Date().toDateString()
    const data = JSON.parse(localStorage.getItem('cr_daily') || '{}')
    return data.date === today ? (data.count || 0) : 0
  } catch { return 0 }
}

export function incrementTodaySent(): void {
  const today = new Date().toDateString()
  try {
    const data = JSON.parse(localStorage.getItem('cr_daily') || '{}')
    if (data.date !== today) {
      localStorage.setItem('cr_daily', JSON.stringify({ date: today, count: 1 }))
    } else {
      data.count = (data.count || 0) + 1
      localStorage.setItem('cr_daily', JSON.stringify(data))
    }
  } catch {}
}

/* ─── Helpers ─── */
export function genId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

export function personalize(template: string, lead: Lead): string {
  const firstName = (lead.contact || '').split(' ')[0] || 'Коллега'
  return template
    .replace(/\{имя\}/gi, firstName)
    .replace(/\{фамилия\}/gi, (lead.contact || '').split(' ')[1] || '')
    .replace(/\{компания\}/gi, lead.company || '')
    .replace(/\{должность\}/gi, lead.position || '')
}

export function formatDateShort(d: string): string {
  if (!d) return ''
  return new Date(d).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
}

export function formatDateLong(d: string): string {
  if (!d) return ''
  return new Date(d).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
}

export const STATUS_LABELS: Record<string, string> = {
  new: 'Новый',
  sent: 'Отправлено',
  replied: 'Ответил',
  no_reply: 'Без ответа',
  skip: 'Пропуск',
}

/* ─── Claude API ─── */
export async function callClaude(apiKey: string, prompt: string, maxTokens = 1500): Promise<string> {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: maxTokens,
      messages: [{ role: 'user', content: prompt }],
    }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as any).error?.message || `API Error ${res.status}`)
  }
  const data = await res.json()
  return data.content?.[0]?.text || ''
}

/* ─── Export CSV ─── */
export function exportLeadsCSV(leads: Lead[]): void {
  const headers = ['Компания', 'Сайт', 'ЛПР', 'Должность', 'Email', 'Статус', 'Дата отправки', 'Заметка']
  const rows = leads.map(l =>
    [l.company, l.website, l.contact, l.position, l.email,
     STATUS_LABELS[l.status] || l.status,
     l.sentAt ? formatDateShort(l.sentAt) : '',
     l.note
    ].map(v => `"${(v || '').replace(/"/g, '""')}"`).join(',')
  )
  const csv = [headers.join(','), ...rows].join('\n')
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `knok-leads-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}
