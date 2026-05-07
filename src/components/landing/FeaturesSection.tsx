import s from './FeaturesSection.module.scss'

const features = [
  {
    icon: '🔍',
    title: 'AI находит клиентов',
    desc: 'Опишите целевую аудиторию — Claude API составит список реальных компаний с контактами ЛПР. Никаких ручных поисков.',
    tag: 'Поиск',
  },
  {
    icon: '✍️',
    title: 'Персонализированные письма',
    desc: 'Каждое письмо адаптируется под получателя: имя, компания, должность. Выглядит как написанное вручную.',
    tag: 'Персонализация',
  },
  {
    icon: '🚀',
    title: 'Автоматическая рассылка',
    desc: 'Настройте лимит и задержку — Knok сам отправит письма через EmailJS. Вы только следите за ответами.',
    tag: 'Автоматизация',
  },
  {
    icon: '📊',
    title: 'Дашборд лидов',
    desc: 'Все контакты, статусы и история в одном месте. Фильтры, поиск, экспорт в CSV — ничего лишнего.',
    tag: 'Аналитика',
  },
  {
    icon: '🔒',
    title: 'Ваши данные у вас',
    desc: 'Все настройки и лиды хранятся локально в браузере. Никакого облака, никаких серверов — полный контроль.',
    tag: 'Безопасность',
  },
  {
    icon: '💸',
    title: 'Бесплатно для старта',
    desc: 'Claude API + EmailJS (200 писем/мес) — достаточно для тестирования гипотез без единого рубля.',
    tag: 'Стоимость',
  },
]

const steps = [
  { n: '01', title: 'Опишите ЦА', desc: 'Расскажите кто ваш идеальный клиент и что вы предлагаете' },
  { n: '02', title: 'AI ищет', desc: 'Claude находит реальные компании и контакты ЛПР под вашу задачу' },
  { n: '03', title: 'Настройте письмо', desc: 'Напишите шаблон или улучшите его с помощью AI' },
  { n: '04', title: 'Получайте ответы', desc: 'Knok отправляет письма автоматически — вы подключаетесь когда клиент ответил' },
]

export default function FeaturesSection() {
  return (
    <>
      {/* How it works */}
      <section className={s.how} id="features">
        <div className={s.section__container}>
          <div className={s.section__eyebrow}>Как это работает</div>
          <h2 className={s.section__title}>4 шага до первого ответа</h2>
          <p className={s.section__subtitle}>От идеи до входящего лида за 15 минут</p>
          <div className={s.steps}>
            {steps.map((step, i) => (
              <div key={step.n} className={s.step}>
                <div className={s.step__number}>{step.n}</div>
                {i < steps.length - 1 && <div className={s.step__connector} />}
                <div className={s.step__content}>
                  <div className={s.step__title}>{step.title}</div>
                  <div className={s.step__desc}>{step.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features grid */}
      <section className={s.features}>
        <div className={s.section__container}>
          <div className={s.section__eyebrow}>Возможности</div>
          <h2 className={s.section__title}>Всё что нужно для аутрича</h2>
          <p className={s.section__subtitle}>Никаких лишних фич — только то, что реально помогает продавать</p>
          <div className={s.grid}>
            {features.map(f => (
              <div key={f.title} className={s.feature_card}>
                <div className={s.feature_card__icon}>{f.icon}</div>
                <div className={s.feature_card__tag}>{f.tag}</div>
                <h3 className={s.feature_card__title}>{f.title}</h3>
                <p className={s.feature_card__desc}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social proof / stats */}
      <section className={s.stats}>
        <div className={s.section__container}>
          <div className={s.stats__grid}>
            {[
              { val: '15 мин', label: 'до первой рассылки', sub: 'от регистрации до отправки' },
              { val: '200', label: 'писем бесплатно', sub: 'каждый месяц через EmailJS' },
              { val: '100%', label: 'локальное хранение', sub: 'данные только у вас' },
              { val: 'AI', label: 'пишет за вас', sub: 'персонализация каждого письма' },
            ].map(item => (
              <div key={item.label} className={s.stat}>
                <div className={s.stat__val}>{item.val}</div>
                <div className={s.stat__label}>{item.label}</div>
                <div className={s.stat__sub}>{item.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
