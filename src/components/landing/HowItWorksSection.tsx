import s from './landing.module.scss'

const STEPS = [
  {
    num: '01',
    title: 'Опишите себя и ЦА',
    desc: 'Расскажите что вы делаете и кто вам нужен. Чем подробнее — тем точнее AI подберёт компании.',
  },
  {
    num: '02',
    title: 'AI находит лиды',
    desc: 'Claude анализирует вашу ЦА и составляет список реальных компаний с контактами ЛПР и email.',
  },
  {
    num: '03',
    title: 'Письма уходят автоматически',
    desc: 'Каждое письмо персонализировано. Задержки между отправками имитируют живого человека.',
  },
  {
    num: '04',
    title: 'Вы работаете только с ответами',
    desc: 'Дашборд показывает кто ответил. Вы подключаетесь только тогда, когда клиент готов говорить.',
  },
]

export function HowItWorksSection() {
  return (
    <section className={s.how}>
      <div className={s.how__inner}>
        <div className={s.section__eyebrow}>Как это работает</div>
        <h2 className={s.section__title}>От ЦА до первого ответа</h2>
        <p className={s.section__subtitle}>
          Весь процесс занимает меньше часа. Дальше Knok работает сам.
        </p>
        <div className={s.how__steps}>
          {STEPS.map((step, i) => (
            <div key={step.num} className={s.how__step}>
              <div className={s.how__step_num}>{step.num}</div>
              {i < STEPS.length - 1 && <div className={s.how__step_line} />}
              <div className={s.how__step_content}>
                <h3 className={s.how__step_title}>{step.title}</h3>
                <p className={s.how__step_desc}>{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
