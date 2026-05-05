'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { loadSettings, saveSettings, defaultSettings, callClaude } from '@/lib/storage'
import type { Settings } from '@/types'
import s from './page.module.scss'

export default function Home() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [settings, setSettings] = useState<Settings>(defaultSettings)
  const [toast, setToast] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [hasConfig, setHasConfig] = useState(false)

  useEffect(() => {
    const loaded = loadSettings()
    setSettings(loaded)
    setHasConfig(!!loaded.companyName)
  }, [])

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(''), 3200)
  }

  function upd(field: keyof Settings, value: string | number) {
    setSettings(prev => ({ ...prev, [field]: value }))
  }

  function validate(n: number): boolean {
    if (n === 1 && (!settings.companyName || !settings.about || !settings.targetAudience)) {
      showToast('Заполните все обязательные поля'); return false
    }
    if (n === 2 && (!settings.emailSubject || !settings.emailTemplate)) {
      showToast('Введите тему и текст письма'); return false
    }
    if (n === 3 && (!settings.senderEmail || !settings.startDate)) {
      showToast('Укажите email и дату начала'); return false
    }
    return true
  }

  function goTo(n: number) {
    if (n > step && !validate(step)) return
    setStep(n)
    setTimeout(() => document.getElementById('setup')?.scrollIntoView({ behavior: 'smooth' }), 50)
  }

  async function aiSuggest(type: 'subject' | 'template') {
    if (!settings.apiKey) { showToast('Введите Claude API Key'); return }
    setAiLoading(true)
    try {
      if (type === 'subject') {
        const res = await callClaude(settings.apiKey, `Ты эксперт по холодным email-рассылкам. Компания: ${settings.about}. ЦА: ${settings.targetAudience}. Придумай 3 темы письма для холодного аутрича. До 8 слов, на русском, без спама. Верни ТОЛЬКО строки, по одной в строке, без нумерации.`, 300)
        const line = res.trim().split('\n').filter(Boolean)[0]
        if (line) { upd('emailSubject', line); showToast('✓ Тема добавлена') }
      } else {
        const res = await callClaude(settings.apiKey, `Ты эксперт по B2B продажам. О компании: ${settings.about}. ЦА: ${settings.targetAudience}. Текущий шаблон: ${settings.emailTemplate || '(пустой)'}. Улучши или напиши холодное письмо. До 200 слов, польза для получателя, переменные {имя} {компания} {должность}, чёткий CTA, русский язык. Верни ТОЛЬКО текст письма.`, 800)
        upd('emailTemplate', res.trim())
        showToast('✓ Письмо улучшено')
      }
    } catch (e: any) { showToast('Ошибка: ' + e.message) }
    finally { setAiLoading(false) }
  }

  function saveAndLaunch() {
    if (!validate(3)) return
    saveSettings(settings)
    showToast('Сохранено!')
    setTimeout(() => router.push('/dashboard'), 700)
  }

  const stepLabels = ['О вас', 'Шаблон', 'Настройки', 'Запуск']

  return (
    <div className={s.page}>
      <div className="ambient">
        <div className="ambient__orb ambient__orb--1" />
        <div className="ambient__orb ambient__orb--2" />
        <div className="ambient__orb ambient__orb--3" />
      </div>

      <nav className="nav">
        <a href="/" className="nav__logo"><span className="nav__logo-icon">◈</span>Knok</a>
        <div className="nav__actions">
          {hasConfig && <Link href="/dashboard" className="btn btn--ghost btn--sm">Dashboard →</Link>}
          <button className="btn btn--primary btn--sm" onClick={() => document.getElementById('setup')?.scrollIntoView({ behavior: 'smooth' })}>Попробовать бесплатно</button>
        </div>
      </nav>

      <section className={s.hero}>
        <div className={`glass-tag ${s.hero__eyebrow}`}>AI ищет · AI пишет · Вы закрываете</div>
        <h1 className={s.hero__title}>
          Новые клиенты начинаются<br />
          <span className={s.hero__accent}>с первого письма</span>
        </h1>
        <p className={s.hero__subtitle}>Опишите кто вам нужен — AI найдёт компании, подберёт контакты и отправит письма. Вы подключаетесь только когда клиент ответил.</p>
        <div className={s.hero__cta}>
          <button className="btn btn--primary btn--lg" onClick={() => document.getElementById('setup')?.scrollIntoView({ behavior: 'smooth' })}>
            Настроить рассылку <span className="btn__arrow">→</span>
          </button>
          <span className={s.hero__note}>попробуйте бесплатно</span>
        </div>
        <div className={s.hero__pills}>
          {[['🔍','Находит ЛПР и email'],['✦','Пишет как человек'],['📬','Рассылает автоматически'],['📊','Показывает кто ответил']].map(([icon, label]) => (
            <div key={label} className={s.pill}><span className={s.pill__icon}>{icon}</span><span>{label}</span></div>
          ))}
        </div>
      </section>

      <section className={s.setup} id="setup">
        <div className={s.setup__container}>
          <div className={s.progress}>
            {stepLabels.map((label, i) => {
              const n = i + 1
              return (
                <div key={n} style={{ display: 'contents' }}>
                  <div className={[s.progress__step, step === n ? s['progress__step--active'] : '', step > n ? s['progress__step--done'] : ''].join(' ')}>
                    <div className={s.progress__num}>{step > n ? '✓' : n}</div>
                    <div className={s.progress__label}>{label}</div>
                  </div>
                  {i < 3 && <div className={s.progress__line} />}
                </div>
              )
            })}
          </div>

          <div className={s.card}>
            {step === 1 && (
              <div>
                <div className={s.step__badge}>Шаг 1 из 4</div>
                <h2 className={s.step__title}>Расскажите о себе и ЦА</h2>
                <p className={s.step__desc}>Чем подробнее — тем точнее AI подберёт клиентов</p>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Название компании</label>
                    <input className="form-input" placeholder="Дизайн-студия «Луч»" value={settings.companyName} onChange={e => upd('companyName', e.target.value)} />
                  </div>
                  <div className="form-group form-group--full">
                    <label className="form-label">Что вы делаете</label>
                    <textarea className="form-textarea" rows={4} placeholder="Мы дизайн-студия, делаем продуктовый дизайн, исследования, айдентику и разработку..." value={settings.about} onChange={e => upd('about', e.target.value)} />
                  </div>
                  <div className="form-group form-group--full">
                    <label className="form-label">Целевая аудитория</label>
                    <textarea className="form-textarea" rows={4} placeholder="Средний и крупный бизнес в РФ. Примеры: Авито, Яндекс, ВК, 12STOREEZ..." value={settings.targetAudience} onChange={e => upd('targetAudience', e.target.value)} />
                  </div>
                  <div className="form-group form-group--full">
                    <label className="form-label">Примеры компаний (ссылки или названия)</label>
                    <textarea className="form-textarea" rows={2} placeholder="avito.ru, yandex.ru, 12storeez.com..." value={settings.examples} onChange={e => upd('examples', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Claude API Key <span className="form-hint">(для AI)</span></label>
                    <input className="form-input" type="password" placeholder="sk-ant-api03-..." value={settings.apiKey} onChange={e => upd('apiKey', e.target.value)} />
                    <div className="form-helper"><a href="https://console.anthropic.com" target="_blank" className="form-link">Получить бесплатно →</a><span>Хранится локально</span></div>
                  </div>
                </div>
                <div className={s.step__actions}><button className="btn btn--primary btn--lg" onClick={() => goTo(2)}>Продолжить →</button></div>
              </div>
            )}

            {step === 2 && (
              <div>
                <div className={s.step__badge}>Шаг 2 из 4</div>
                <h2 className={s.step__title}>Шаблон холодного письма</h2>
                <p className={s.step__desc}>AI персонализирует его под каждого получателя</p>
                <div className="form-grid">
                  <div className="form-group form-group--full">
                    <div className="label-row"><label className="form-label">Тема письма</label><button className="btn btn--ghost btn--xs" onClick={() => aiSuggest('subject')} disabled={aiLoading}>✦ AI предложит</button></div>
                    <input className="form-input" placeholder="Партнёрство / попасть в пул поставщиков" value={settings.emailSubject} onChange={e => upd('emailSubject', e.target.value)} />
                  </div>
                  <div className="form-group form-group--full">
                    <div className="label-row"><label className="form-label">Текст письма</label><button className="btn btn--ghost btn--xs" onClick={() => aiSuggest('template')} disabled={aiLoading}>✦ Улучшить с AI</button></div>
                    <textarea className="form-textarea" rows={13} style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13 }} placeholder={'Добрый день, {имя},\n\nМеня зовут Ярослав, я из дизайн-студии «Луч»...'} value={settings.emailTemplate} onChange={e => upd('emailTemplate', e.target.value)} />
                    <div className="form-helper"><span>Используйте <code className="code-tag">{'{имя}'}</code> <code className="code-tag">{'{компания}'}</code> <code className="code-tag">{'{должность}'}</code></span></div>
                  </div>
                </div>
                {aiLoading && <div className="ai-loader"><div className="spinner" /><span>AI работает...</span></div>}
                <div className={s.step__actions}><button className="btn btn--ghost btn--lg" onClick={() => goTo(1)}>← Назад</button><button className="btn btn--primary btn--lg" onClick={() => goTo(3)}>Продолжить →</button></div>
              </div>
            )}

            {step === 3 && (
              <div>
                <div className={s.step__badge}>Шаг 3 из 4</div>
                <h2 className={s.step__title}>Настройки рассылки</h2>
                <p className={s.step__desc}>EmailJS — 200 писем/месяц бесплатно</p>
                <div className="form-grid">
                  <div className="form-group"><label className="form-label">Email отправителя</label><input className="form-input" type="email" placeholder="you@company.com" value={settings.senderEmail} onChange={e => upd('senderEmail', e.target.value)} /></div>
                  <div className="form-group"><label className="form-label">Дата начала</label><input className="form-input" type="date" value={settings.startDate} onChange={e => upd('startDate', e.target.value)} /></div>
                  <div className="form-group"><label className="form-label">EmailJS Service ID</label><input className="form-input" placeholder="service_xxxxxxx" value={settings.emailjsService} onChange={e => upd('emailjsService', e.target.value)} /></div>
                  <div className="form-group"><label className="form-label">EmailJS Template ID</label><input className="form-input" placeholder="template_xxxxxxx" value={settings.emailjsTemplate} onChange={e => upd('emailjsTemplate', e.target.value)} /></div>
                  <div className="form-group form-group--full">
                    <label className="form-label">EmailJS Public Key</label>
                    <input className="form-input" placeholder="xxxxxxxxxxxxxxxx" value={settings.emailjsKey} onChange={e => upd('emailjsKey', e.target.value)} />
                    <div className="form-helper"><a href="https://www.emailjs.com" target="_blank" className="form-link">Создать аккаунт EmailJS →</a><span>Бесплатно до 200 писем/месяц</span></div>
                  </div>
                  <div className="form-group"><label className="form-label">Писем в день</label><div className="range-wrap"><input type="range" className="range" min={5} max={50} value={settings.dailyLimit} onChange={e => upd('dailyLimit', +e.target.value)} /><span className="range-label">{settings.dailyLimit}</span></div></div>
                  <div className="form-group"><label className="form-label">Задержка (сек)</label><div className="range-wrap"><input type="range" className="range" min={30} max={300} step={10} value={settings.sendDelay} onChange={e => upd('sendDelay', +e.target.value)} /><span className="range-label">{settings.sendDelay}</span></div></div>
                </div>
                <div className={s.step__actions}><button className="btn btn--ghost btn--lg" onClick={() => goTo(2)}>← Назад</button><button className="btn btn--primary btn--lg" onClick={() => goTo(4)}>Продолжить →</button></div>
              </div>
            )}

            {step === 4 && (
              <div>
                <div className={s.step__badge}>Шаг 4 из 4</div>
                <h2 className={s.step__title}>Готово к запуску!</h2>
                <p className={s.step__desc}>Сохраните настройки и перейдите в дашборд</p>
                <div className={s.summary}>
                  {[['Компания', settings.companyName],['Email', settings.senderEmail],['Дата начала', settings.startDate ? new Date(settings.startDate).toLocaleDateString('ru-RU',{day:'numeric',month:'long',year:'numeric'}) : '—'],['Писем в день', String(settings.dailyLimit)]].map(([k,v]) => (
                    <div key={k} className={s.summary__row}><span>{k}</span><span>{v||'—'}</span></div>
                  ))}
                </div>
                <div className={s.launch_note}>
                  <span className={s.launch_note__icon}>💡</span>
                  <div><strong>Следующий шаг:</strong> в дашборде AI найдёт компании из вашей ЦА и подберёт контакты ЛПР.</div>
                </div>
                <div className={s.step__actions}><button className="btn btn--ghost btn--lg" onClick={() => goTo(3)}>← Назад</button><button className="btn btn--primary btn--lg" onClick={saveAndLaunch}>Сохранить и открыть дашборд →</button></div>
              </div>
            )}
          </div>
        </div>
      </section>

      <footer className={s.footer}>
        <div className={s.footer__inner}><span style={{color:'var(--accent)'}}>◈</span><span>Knok · Аутрич без боли</span></div>
      </footer>

      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}
