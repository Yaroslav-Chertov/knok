import type { Lead, Settings } from '@/types'
import { getTodaySent } from '@/lib/storage'
import s from './dashboard.module.scss'

type CampStatus = 'idle' | 'running' | 'paused' | 'scheduled'

interface CampaignPanelProps {
  leads: Lead[]
  settings: Settings
  campStatus: CampStatus
  totalSent: number
  totalReplied: number
  onStart: () => void
  onPause: () => void
  onGoSettings: () => void
}

const CAMP_STATUS_LABELS: Record<CampStatus, string> = {
  idle: 'Не запущена',
  running: 'Активна',
  paused: 'На паузе',
  scheduled: 'Запланирована',
}

export function CampaignPanel({ leads, settings, campStatus, totalSent, totalReplied, onStart, onPause, onGoSettings }: CampaignPanelProps) {
  const sentToday = getTodaySent()
  const rate = totalSent > 0 ? Math.round(totalReplied / totalSent * 100) : 0

  return (
    <div className={s.panel}>
      <div className={s.panel__header}>
        <div>
          <h1 className={s.panel__title}>Кампания</h1>
          <p className={s.panel__subtitle}>Управление рассылкой</p>
        </div>
      </div>
      <div className={s.camp_grid}>
        <div className={s.camp_card}>
          <div className={s.camp_card__title}>Статус рассылки</div>
          <div className={s.camp_status}>
            <div className={`${s.status_dot} ${s[`status_dot--${campStatus}`]}`} />
            <span>{CAMP_STATUS_LABELS[campStatus]}</span>
          </div>
          <div className={s.camp_meta}>
            {[
              ['Дата начала', settings.startDate ? new Date(settings.startDate).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }) : '—'],
              ['Лимит/день', String(settings.dailyLimit || 30)],
              ['Отправлено сегодня', String(sentToday)],
            ].map(([k, v]) => (
              <div key={k} className={s.camp_meta__row}><span>{k}</span><span>{v}</span></div>
            ))}
          </div>
          <div className={s.camp_card__actions}>
            {campStatus !== 'running'
              ? <button className="btn btn--primary btn--sm" onClick={onStart}>▶ Запустить</button>
              : <button className="btn btn--ghost btn--sm" onClick={onPause}>⏸ Пауза</button>}
          </div>
        </div>

        <div className={s.camp_card}>
          <div className={s.camp_card__title}>Статистика</div>
          <div className={s.stats_grid}>
            {[['Всего', leads.length], ['Отправлено', totalSent], ['Ответили', totalReplied], ['Конверсия', rate + '%']].map(([l, v]) => (
              <div key={String(l)} className={s.stat_box}>
                <div className={s.stat_box__val}>{v}</div>
                <div className={s.stat_box__label}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        <div className={`${s.camp_card} ${s['camp_card--full']}`}>
          <div className={s.camp_card__header}>
            <div className={s.camp_card__title}>Шаблон письма</div>
            <button className="btn btn--ghost btn--xs" onClick={onGoSettings}>✎ Редактировать</button>
          </div>
          <div className={s.email_preview}>
            <div className={s.email_preview__subject}><strong>Тема:</strong> {settings.emailSubject || '—'}</div>
            <div className={s.email_preview__body}>{settings.emailTemplate || '—'}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
