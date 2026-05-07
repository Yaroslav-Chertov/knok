import Link from 'next/link'
import s from './landing.module.scss'

const FOOTER_LINKS = {
  'Продукт': ['Возможности', 'Безопасность', 'Обновления'],
  'Поддержка': ['Документация', 'FAQ', 'Связаться'],
  'Компания': ['О нас', 'Блог', 'Контакты'],
}

export function Footer() {
  return (
    <footer className={s.footer}>
      <div className={s.footer__inner}>
        <div className={s.footer__top}>
          <div className={s.footer__brand}>
            <div className={s.footer__logo}>
              <span className={s.footer__logo_icon}>◈</span>
              Knok
            </div>
            <p className={s.footer__tagline}>
              Умная холодная рассылка на базе AI.<br />
              Находим клиентов — вы закрываете сделки.
            </p>
            <div className={s.footer__badges}>
              <span className={s.footer__badge}>🔒 Данные локально</span>
              <span className={s.footer__badge}>⚡ Работает сразу</span>
            </div>
          </div>
          <div className={s.footer__nav}>
            {Object.entries(FOOTER_LINKS).map(([group, links]) => (
              <div key={group} className={s.footer__nav_group}>
                <div className={s.footer__nav_title}>{group}</div>
                {links.map((link) => (
                  <a key={link} href="#" className={s.footer__nav_link}>{link}</a>
                ))}
              </div>
            ))}
          </div>
        </div>
        <div className={s.footer__bottom}>
          <span>© 2025 Knok. Аутрич без боли.</span>
          <div className={s.footer__legal}>
            <a href="#" className={s.footer__legal_link}>Условия использования</a>
            <a href="#" className={s.footer__legal_link}>Политика конфиденциальности</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
