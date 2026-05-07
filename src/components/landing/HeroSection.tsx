'use client'
import s from './HeroSection.module.scss'

export default function HeroSection() {
  return (
    <section className={s.hero}>
      <div className={`glass-tag ${s.hero__eyebrow}`}>
        AI ищет · AI пишет · Вы закрываете
      </div>
      <h1 className={s.hero__title}>
        Новые клиенты начинаются
        <br />
        <span className={s.hero__accent}>с первого письма</span>
      </h1>
      <p className={s.hero__subtitle}>
        Опишите кто вам нужен — AI найдёт компании, подберёт контакты и
        отправит письма. Вы подключаетесь только когда клиент ответил.
      </p>
      <div className={s.hero__cta}>
        <button
          className="btn btn--primary btn--lg"
          onClick={() =>
            document.getElementById('setup')?.scrollIntoView({ behavior: 'smooth' })
          }
        >
          Настроить рассылку <span className="btn__arrow">→</span>
        </button>
        <span className={s.hero__note}>бесплатно, без карты</span>
      </div>
      <div className={s.hero__pills}>
        {[
          ['🔍', 'Находит ЛПР и email'],
          ['✦', 'Пишет как человек'],
          ['📬', 'Рассылает автоматически'],
          ['📊', 'Показывает кто ответил'],
        ].map(([icon, label]) => (
          <div key={label} className={s.pill}>
            <span className={s.pill__icon}>{icon}</span>
            <span>{label}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
