"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveSettings, callClaude } from "@/lib/storage";
import type { Settings } from "@/types";
import s from "./SetupWizard.module.scss";

interface Props {
  settings: Settings;
  onChange: (field: keyof Settings, value: string | number) => void;
}

export default function SetupWizard({ settings, onChange }: Props) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [toast, setToast] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 3200);
  }

  function validate(n: number): boolean {
    if (
      n === 1 &&
      (!settings.companyName || !settings.about || !settings.targetAudience)
    ) {
      showToast("Заполните все обязательные поля");
      return false;
    }
    if (n === 2 && (!settings.emailSubject || !settings.emailTemplate)) {
      showToast("Введите тему и текст письма");
      return false;
    }
    if (n === 3 && (!settings.senderEmail || !settings.startDate)) {
      showToast("Укажите email и дату начала");
      return false;
    }
    return true;
  }

  function goTo(n: number) {
    if (n > step && !validate(step)) return;
    setStep(n);
    setTimeout(
      () =>
        document
          .getElementById("setup")
          ?.scrollIntoView({ behavior: "smooth" }),
      50,
    );
  }

  async function aiSuggest(type: "subject" | "template") {
    if (!settings.apiKey) {
      showToast("Введите Claude API Key");
      return;
    }
    setAiLoading(true);
    try {
      if (type === "subject") {
        const res = await callClaude(
          settings.apiKey,
          `Ты эксперт по холодным email-рассылкам. Компания: ${settings.about}. ЦА: ${settings.targetAudience}. Придумай 3 темы письма для холодного аутрича. До 8 слов, на русском, без спама. Верни ТОЛЬКО строки, по одной в строке, без нумерации.`,
          300,
        );
        const line = res.trim().split("\n").filter(Boolean)[0];
        if (line) {
          onChange("emailSubject", line);
          showToast("✓ Тема добавлена");
        }
      } else {
        const res = await callClaude(
          settings.apiKey,
          `Ты эксперт по B2B продажам. О компании: ${settings.about}. ЦА: ${settings.targetAudience}. Текущий шаблон: ${settings.emailTemplate || "(пустой)"}. Улучши или напиши холодное письмо. До 200 слов, польза для получателя, переменные {имя} {компания} {должность}, чёткий CTA, русский язык. Верни ТОЛЬКО текст письма.`,
          800,
        );
        onChange("emailTemplate", res.trim());
        showToast("✓ Письмо улучшено");
      }
    } catch (e: any) {
      showToast("Ошибка: " + e.message);
    } finally {
      setAiLoading(false);
    }
  }

  function saveAndLaunch() {
    if (!validate(3)) return;
    saveSettings(settings);
    showToast("Сохранено!");
    setTimeout(() => router.push("/dashboard"), 700);
  }

  const stepLabels = ["О вас", "Шаблон", "Настройки", "Запуск"];

  return (
    <section className={s.setup} id="setup">
      <div className={s.setup__container}>
        {/* Progress */}
        <div className={s.progress}>
          {stepLabels.map((label, i) => {
            const n = i + 1;
            return (
              <div key={n} style={{ display: "contents" }}>
                <div
                  className={[
                    s.progress__step,
                    step === n ? s["progress__step--active"] : "",
                    step > n ? s["progress__step--done"] : "",
                  ].join(" ")}
                >
                  <div className={s.progress__num}>{step > n ? "✓" : n}</div>
                  <div className={s.progress__label}>{label}</div>
                </div>
                {i < 3 && <div className={s.progress__line} />}
              </div>
            );
          })}
        </div>

        <div className={s.card}>
          {/* Step 1 */}
          {step === 1 && (
            <div>
              <div className={s.step__badge}>Шаг 1 из 4</div>
              <h2 className={s.step__title}>Расскажите о себе и ЦА</h2>
              <p className={s.step__desc}>
                Чем подробнее — тем точнее AI подберёт клиентов
              </p>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Название компании</label>
                  <input
                    className="form-input"
                    placeholder="Дизайн-студия «Boo»"
                    value={settings.companyName}
                    onChange={(e) => onChange("companyName", e.target.value)}
                  />
                </div>
                <div className="form-group form-group--full">
                  <label className="form-label">Что вы делаете</label>
                  <textarea
                    className="form-textarea"
                    rows={4}
                    placeholder="Мы дизайн-студия, делаем продуктовый дизайн, исследования, айдентику..."
                    value={settings.about}
                    onChange={(e) => onChange("about", e.target.value)}
                  />
                </div>
                <div className="form-group form-group--full">
                  <label className="form-label">Целевая аудитория</label>
                  <textarea
                    className="form-textarea"
                    rows={4}
                    placeholder="Средний и крупный бизнес в РФ. Примеры: Авито, Яндекс, ВК..."
                    value={settings.targetAudience}
                    onChange={(e) => onChange("targetAudience", e.target.value)}
                  />
                </div>
                <div className="form-group form-group--full">
                  <label className="form-label">
                    Примеры компаний (ссылки или названия)
                  </label>
                  <textarea
                    className="form-textarea"
                    rows={2}
                    placeholder="avito.ru, yandex.ru, 12storeez.com..."
                    value={settings.examples}
                    onChange={(e) => onChange("examples", e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">
                    Claude API Key <span className="form-hint">(для AI)</span>
                  </label>
                  <input
                    className="form-input"
                    type="password"
                    placeholder="sk-ant-api03-..."
                    value={settings.apiKey}
                    onChange={(e) => onChange("apiKey", e.target.value)}
                  />
                  <div className="form-helper">
                    <a
                      href="https://console.anthropic.com"
                      target="_blank"
                      className="form-link"
                    >
                      Получить бесплатно →
                    </a>
                    <span>Хранится локально</span>
                  </div>
                </div>
              </div>
              <div className={s.step__actions}>
                <button
                  className="btn btn--primary btn--lg"
                  onClick={() => goTo(2)}
                >
                  Продолжить →
                </button>
              </div>
            </div>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <div>
              <div className={s.step__badge}>Шаг 2 из 4</div>
              <h2 className={s.step__title}>Шаблон холодного письма</h2>
              <p className={s.step__desc}>
                AI персонализирует его под каждого получателя
              </p>
              <div className="form-grid">
                <div className="form-group form-group--full">
                  <div className="label-row">
                    <label className="form-label">Тема письма</label>
                    <button
                      className="btn btn--ghost btn--xs"
                      onClick={() => aiSuggest("subject")}
                      disabled={aiLoading}
                    >
                      ✦ AI предложит
                    </button>
                  </div>
                  <input
                    className="form-input"
                    placeholder="Партнёрство / попасть в пул поставщиков"
                    value={settings.emailSubject}
                    onChange={(e) => onChange("emailSubject", e.target.value)}
                  />
                </div>
                <div className="form-group form-group--full">
                  <div className="label-row">
                    <label className="form-label">Текст письма</label>
                    <button
                      className="btn btn--ghost btn--xs"
                      onClick={() => aiSuggest("template")}
                      disabled={aiLoading}
                    >
                      ✦ Улучшить с AI
                    </button>
                  </div>
                  <textarea
                    className="form-textarea"
                    rows={12}
                    style={{ fontFamily: "var(--font-mono)", fontSize: 13 }}
                    placeholder={
                      "Добрый день, {имя},\n\nМеня зовут Ярослав, я из дизайн-студии «Луч»..."
                    }
                    value={settings.emailTemplate}
                    onChange={(e) => onChange("emailTemplate", e.target.value)}
                  />
                  <div className="form-helper">
                    <span>
                      Используйте <code className="code-tag">{"{имя}"}</code>{" "}
                      <code className="code-tag">{"{компания}"}</code>{" "}
                      <code className="code-tag">{"{должность}"}</code>
                    </span>
                  </div>
                </div>
              </div>
              {aiLoading && (
                <div className="ai-loader">
                  <div className="spinner" />
                  <span>AI работает...</span>
                </div>
              )}
              <div className={s.step__actions}>
                <button
                  className="btn btn--ghost btn--lg"
                  onClick={() => goTo(1)}
                >
                  ← Назад
                </button>
                <button
                  className="btn btn--primary btn--lg"
                  onClick={() => goTo(3)}
                >
                  Продолжить →
                </button>
              </div>
            </div>
          )}

          {/* Step 3 */}
          {step === 3 && (
            <div>
              <div className={s.step__badge}>Шаг 3 из 4</div>
              <h2 className={s.step__title}>Настройки рассылки</h2>
              <p className={s.step__desc}>
                EmailJS — 200 писем/месяц бесплатно
              </p>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Email отправителя</label>
                  <input
                    className="form-input"
                    type="email"
                    placeholder="you@company.com"
                    value={settings.senderEmail}
                    onChange={(e) => onChange("senderEmail", e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Дата начала</label>
                  <input
                    className="form-input"
                    type="date"
                    value={settings.startDate}
                    onChange={(e) => onChange("startDate", e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">EmailJS Service ID</label>
                  <input
                    className="form-input"
                    placeholder="service_xxxxxxx"
                    value={settings.emailjsService}
                    onChange={(e) => onChange("emailjsService", e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">EmailJS Template ID</label>
                  <input
                    className="form-input"
                    placeholder="template_xxxxxxx"
                    value={settings.emailjsTemplate}
                    onChange={(e) =>
                      onChange("emailjsTemplate", e.target.value)
                    }
                  />
                </div>
                <div className="form-group form-group--full">
                  <label className="form-label">EmailJS Public Key</label>
                  <input
                    className="form-input"
                    placeholder="xxxxxxxxxxxxxxxx"
                    value={settings.emailjsKey}
                    onChange={(e) => onChange("emailjsKey", e.target.value)}
                  />
                  <div className="form-helper">
                    <a
                      href="https://www.emailjs.com"
                      target="_blank"
                      className="form-link"
                    >
                      Создать аккаунт EmailJS →
                    </a>
                    <span>Бесплатно до 200 писем/месяц</span>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Писем в день</label>
                  <div className="range-wrap">
                    <input
                      type="range"
                      className="range"
                      min={5}
                      max={50}
                      value={settings.dailyLimit}
                      onChange={(e) => onChange("dailyLimit", +e.target.value)}
                    />
                    <span className="range-label">{settings.dailyLimit}</span>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Задержка (сек)</label>
                  <div className="range-wrap">
                    <input
                      type="range"
                      className="range"
                      min={30}
                      max={300}
                      step={10}
                      value={settings.sendDelay}
                      onChange={(e) => onChange("sendDelay", +e.target.value)}
                    />
                    <span className="range-label">{settings.sendDelay}</span>
                  </div>
                </div>
              </div>
              <div className={s.step__actions}>
                <button
                  className="btn btn--ghost btn--lg"
                  onClick={() => goTo(2)}
                >
                  ← Назад
                </button>
                <button
                  className="btn btn--primary btn--lg"
                  onClick={() => goTo(4)}
                >
                  Продолжить →
                </button>
              </div>
            </div>
          )}

          {/* Step 4 */}
          {step === 4 && (
            <div>
              <div className={s.step__badge}>Шаг 4 из 4</div>
              <h2 className={s.step__title}>Готово к запуску!</h2>
              <p className={s.step__desc}>
                Сохраните настройки и перейдите в дашборд
              </p>
              <div className={s.summary}>
                {[
                  ["Компания", settings.companyName],
                  ["Email", settings.senderEmail],
                  [
                    "Дата начала",
                    settings.startDate
                      ? new Date(settings.startDate).toLocaleDateString(
                          "ru-RU",
                          { day: "numeric", month: "long", year: "numeric" },
                        )
                      : "—",
                  ],
                  ["Писем в день", String(settings.dailyLimit)],
                ].map(([k, v]) => (
                  <div key={k} className={s.summary__row}>
                    <span>{k}</span>
                    <span>{v || "—"}</span>
                  </div>
                ))}
              </div>
              <div className={s.launch_note}>
                <span className={s.launch_note__icon}>💡</span>
                <div>
                  <strong>Следующий шаг:</strong> в дашборде AI найдёт компании
                  из вашей ЦА и подберёт контакты ЛПР.
                </div>
              </div>
              <div className={s.step__actions}>
                <button
                  className="btn btn--ghost btn--lg"
                  onClick={() => goTo(3)}
                >
                  ← Назад
                </button>
                <button
                  className="btn btn--primary btn--lg"
                  onClick={saveAndLaunch}
                >
                  Сохранить и открыть дашборд →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {toast && <div className="toast">{toast}</div>}
    </section>
  );
}
