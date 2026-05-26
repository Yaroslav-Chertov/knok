import Link from "next/link";
import s from "./Footer.module.scss";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className={s.footer}>
      <div className={s.footer__inner}>
        <div className={s.footer__brand}>
          <Link href="/" className={s.footer__logo}>
            <span className={s.footer__logo_icon}>◈</span>Knok
          </Link>
          <p className={s.footer__tagline}>
            AI-аутрич без боли. Находим клиентов,
            <br />
            пишем письма, вы закрываете сделки.
          </p>
          <div className={s.footer__social}>
            <a href="#" className={s.footer__social_link} aria-label="Telegram">
              <svg
                width="16"
                height="16"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.069l-2.057 9.697c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.92.524z" />
              </svg>
            </a>
            <a
              href="mailto:hello@knok.ai"
              className={s.footer__social_link}
              aria-label="Email"
            >
              <svg
                width="16"
                height="16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                viewBox="0 0 24 24"
              >
                <path
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </a>
          </div>
        </div>

        <div className={s.footer__links}>
          <div className={s.footer__col}>
            <div className={s.footer__col_title}>Продукт</div>
            <Link href="#setup" className={s.footer__link}>
              Попробовать
            </Link>
            <Link href="/dashboard" className={s.footer__link}>
              Дашборд
            </Link>
            <a href="#pricing" className={s.footer__link}>
              Тарифы
            </a>
          </div>
          <div className={s.footer__col}>
            <div className={s.footer__col_title}>Компания</div>
            <a href="#" className={s.footer__link}>
              Политика конфиденциальности
            </a>
            <a href="#" className={s.footer__link}>
              Условия использования
            </a>
          </div>
        </div>
      </div>

      <div className={s.footer__bottom}>
        <span>© {year} Knok. Все права защищены.</span>
        <span className={s.footer__bottom_made}>
          Сделано с <span className={s.footer__heart}>♥</span> для B2B команд
        </span>
      </div>
    </footer>
  );
}
