import { Controller, Get, Header } from '@nestjs/common';
import { AppService } from './app.service.js';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Header('Content-Type', 'text/html; charset=utf-8')
  getInvitationPage(): string {
    return `<!DOCTYPE html>
<html lang="uz">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Nozim & Nozima</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap"
      rel="stylesheet"
    />
    <style>
      :root {
        --bg-ivory: #e9e1d6;
        --bg-muted: #d9d0c4;
        --bg-card: #f5f2ee;
        --gold: #c5a777;
        --gold-soft: rgba(197, 167, 119, 0.65);
        --text: #2c2a27;
        --text-soft: rgba(44, 42, 39, 0.72);
        --navy: #1d2e38;
        --navy-soft: #2f3b47;
        --line: rgba(44, 42, 39, 0.18);
        --shadow: rgba(37, 39, 41, 0.12);
        --white: #f8f7f5;
        --button: rgba(255, 255, 255, 0.1);
      }

      * {
        box-sizing: border-box;
      }

      html {
        scroll-behavior: smooth;
      }

      body {
        margin: 0;
        background: var(--bg-ivory);
        color: var(--text);
        font-family: 'Inter', sans-serif;
      }

      a {
        color: inherit;
        text-decoration: none;
      }

      .page-shell {
        min-height: 100vh;
      }

      .hero {
        position: relative;
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        background-image: linear-gradient(
            rgba(75, 71, 62, 0.2),
            rgba(75, 71, 62, 0.2)
          ),
          url('https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=1800&q=80');
        background-size: cover;
        background-position: center;
      }

      .lang-pill {
        position: absolute;
        top: 24px;
        right: 26px;
        width: 52px;
        height: 36px;
        border: 1px solid rgba(255, 255, 255, 0.35);
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.18);
        backdrop-filter: blur(6px);
        color: rgba(255, 255, 255, 0.92);
        font-size: 11px;
        letter-spacing: 0.08em;
        display: grid;
        place-items: center;
      }

      .hero-inner {
        width: min(100%, 540px);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 42px 28px;
      }

      .hero-card {
        width: min(100%, 520px);
        min-height: 470px;
        padding: 28px 26px 22px;
        background: rgba(255, 255, 255, 0.08);
        border: 1px solid rgba(255, 255, 255, 0.28);
        box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.15) inset;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        backdrop-filter: blur(3px);
      }

      .hero-kicker {
        margin-bottom: 10px;
        color: rgba(255, 255, 255, 0.8);
        font-size: 12px;
        letter-spacing: 0.22em;
        text-transform: uppercase;
        text-align: center;
      }

      .hero-title {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        font-family: 'Cormorant Garamond', serif;
        font-weight: 500;
        font-style: italic;
        letter-spacing: -0.06em;
        color: rgba(255, 255, 255, 0.88);
        line-height: 0.82;
        text-shadow: 0 2px 12px rgba(0, 0, 0, 0.14);
      }

      .hero-title .name {
        font-size: clamp(4.3rem, 7vw, 8.2rem);
      }

      .hero-title .amp {
        font-size: clamp(2rem, 3vw, 3.2rem);
        margin: 10px 0;
        font-style: italic;
      }

      .hero-date {
        margin-top: 18px;
        font-size: 13px;
        color: rgba(255, 255, 255, 0.74);
        letter-spacing: 0.28em;
        text-transform: uppercase;
      }

      .hero-footer {
        margin-top: 24px;
        color: rgba(255, 255, 255, 0.78);
        letter-spacing: 0.18em;
        text-transform: uppercase;
        font-size: 11px;
      }

      .floating-btn {
        position: fixed;
        right: 18px;
        width: 52px;
        height: 52px;
        border-radius: 50%;
        border: 1px solid rgba(197, 167, 119, 0.6);
        background: rgba(255, 255, 255, 0.45);
        box-shadow: 0 8px 22px rgba(53, 54, 51, 0.08);
        display: grid;
        place-items: center;
        z-index: 12;
        color: var(--gold);
        font-size: 20px;
      }

      .scroll-btn {
        bottom: 78px;
        background: rgba(255, 255, 255, 0.8);
      }

      .music-btn {
        bottom: 18px;
        background: linear-gradient(135deg, rgba(197, 167, 119, 0.12), rgba(197, 167, 119, 0.26));
      }

      .section {
        padding: 84px 24px;
      }

      .soft-section {
        background: var(--bg-ivory);
      }

      .quote {
        max-width: 760px;
        margin: 0 auto;
        text-align: center;
      }

      .arabic {
        margin: 0 auto 18px;
        font-size: clamp(2rem, 3vw, 3.3rem);
        line-height: 1.5;
        font-family: 'Cormorant Garamond', serif;
        color: var(--gold);
        font-weight: 500;
      }

      .divider {
        width: 100px;
        height: 1px;
        background: linear-gradient(to right, transparent, var(--gold-soft), transparent);
        margin: 0 auto 26px;
      }

      .quote-text {
        margin: 0 auto;
        max-width: 760px;
        font-family: 'Cormorant Garamond', serif;
        font-size: clamp(2.1rem, 3.3vw, 3.5rem);
        line-height: 1.2;
        color: rgba(44, 42, 39, 0.9);
        font-weight: 500;
        font-style: italic;
      }

      .quote-meta {
        margin-top: 24px;
        font-size: 16px;
        letter-spacing: 0.18em;
        text-transform: uppercase;
        color: rgba(44, 42, 39, 0.7);
      }

      .family-wrap {
        background: rgba(255, 255, 255, 0.3);
        padding: 64px 24px 72px;
        border-top: 1px solid rgba(44, 42, 39, 0.08);
      }

      .family {
        max-width: 820px;
        margin: 0 auto;
        text-align: center;
      }

      .eyebrow,
      .countdown-label,
      .final-eyebrow {
        font-size: 12px;
        letter-spacing: 0.3em;
        text-transform: uppercase;
        color: var(--gold);
      }

      .family-title,
      .countdown-title,
      .final-title {
        font-family: 'Cormorant Garamond', serif;
        font-weight: 500;
        color: rgba(44, 42, 39, 0.9);
        font-style: italic;
        margin-top: 8px;
      }

      .family-title {
        font-size: clamp(2.5rem, 5vw, 4.3rem);
        line-height: 0.9;
      }

      .family-divider {
        width: 180px;
        height: 1px;
        background: var(--gold-soft);
        margin: 20px auto 24px;
        position: relative;
      }

      .family-divider::before,
      .family-divider::after,
      .countdown-divider::before,
      .countdown-divider::after,
      .final-divider::before,
      .final-divider::after {
        content: '';
        position: absolute;
        top: 50%;
        width: 5px;
        height: 5px;
        border-radius: 50%;
        background: var(--gold);
        transform: translateY(-50%);
      }

      .family-divider::before,
      .countdown-divider::before,
      .final-divider::before {
        left: 0;
      }

      .family-divider::after,
      .countdown-divider::after,
      .final-divider::after {
        right: 0;
      }

      .family-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 28px 50px;
        max-width: 540px;
        margin: 0 auto;
      }

      .family-col {
        position: relative;
        padding: 0 26px;
      }

      .family-col + .family-col::before {
        content: '';
        position: absolute;
        left: -2px;
        top: 10px;
        bottom: 10px;
        width: 1px;
        background: rgba(44, 42, 39, 0.18);
      }

      .family-name {
        font-weight: 600;
        font-size: 18px;
        margin-bottom: 10px;
        color: rgba(44, 42, 39, 0.9);
      }

      .family-name .plus {
        display: inline-block;
        width: 14px;
        color: var(--gold);
        font-size: 20px;
      }

      .family-role {
        font-family: 'Cormorant Garamond', serif;
        font-style: italic;
        font-size: 1.1rem;
        color: rgba(44, 42, 39, 0.8);
      }

      .family-quote {
        max-width: 520px;
        margin: 26px auto 0;
        font-family: 'Cormorant Garamond', serif;
        font-size: clamp(1.2rem, 2vw, 1.8rem);
        line-height: 1.4;
        color: rgba(44, 42, 39, 0.86);
        font-style: italic;
      }

      .countdown {
        max-width: 420px;
        margin: 0 auto;
        text-align: center;
      }

      .countdown-title {
        font-size: clamp(2.6rem, 5vw, 4rem);
      }

      .countdown-divider {
        width: 180px;
        height: 1px;
        background: rgba(44, 42, 39, 0.22);
        margin: 14px auto 0;
        position: relative;
      }

      .countdown-grid {
        margin-top: 30px;
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 14px;
      }

      .count-box {
        min-height: 112px;
        border: 1px solid rgba(44, 42, 39, 0.14);
        background: rgba(255, 255, 255, 0.12);
        padding: 18px 8px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.22) inset;
      }

      .count-value {
        font-family: 'Cormorant Garamond', serif;
        font-size: clamp(2rem, 3vw, 3rem);
        line-height: 1;
        color: rgba(44, 42, 39, 0.9);
      }

      .count-label {
        margin-top: 8px;
        font-size: 10px;
        letter-spacing: 0.18em;
        text-transform: uppercase;
        color: rgba(44, 42, 39, 0.7);
      }

      .calendar-card {
        max-width: 520px;
        margin: 32px auto 0;
        background: rgba(255, 255, 255, 0.08);
        border: 1px solid rgba(44, 42, 39, 0.14);
        padding: 18px 20px 14px;
      }

      .calendar-header {
        text-align: center;
        font-family: 'Cormorant Garamond', serif;
        font-size: clamp(2rem, 3vw, 2.8rem);
        letter-spacing: 0.14em;
        text-transform: uppercase;
        color: rgba(44, 42, 39, 0.9);
        padding: 10px 0 18px;
      }

      .calendar-weekdays,
      .calendar-days {
        display: grid;
        grid-template-columns: repeat(7, minmax(0, 1fr));
        gap: 12px 8px;
      }

      .calendar-weekdays {
        margin: 0 0 18px;
        font-size: 10px;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        color: rgba(44, 42, 39, 0.7);
      }

      .calendar-day {
        min-height: 42px;
        display: grid;
        place-items: center;
        font-size: 14px;
        color: rgba(44, 42, 39, 0.85);
      }

      .calendar-day.empty {
        opacity: 0.2;
      }

      .calendar-day.active {
        color: var(--gold);
        position: relative;
        font-weight: 700;
      }

      .calendar-day.active::before {
        content: '';
        position: absolute;
        inset: 4px 10px;
        border-radius: 50%;
        background: rgba(197, 167, 119, 0.14);
        z-index: -1;
      }

      .location-card {
        max-width: 560px;
        margin: 0 auto;
        background: rgba(255, 255, 255, 0.12);
        border: 1px solid rgba(44, 42, 39, 0.16);
        box-shadow: 0 18px 28px rgba(46, 39, 24, 0.06);
        text-align: center;
        padding: 32px 24px 28px;
      }

      .location-icon {
        width: 56px;
        height: 56px;
        border: 1px solid rgba(197, 167, 119, 0.55);
        border-radius: 50%;
        display: grid;
        place-items: center;
        margin: 0 auto 22px;
        color: var(--gold);
        font-size: 26px;
        background: rgba(255, 255, 255, 0.1);
      }

      .location-title {
        font-family: 'Cormorant Garamond', serif;
        font-weight: 500;
        font-size: clamp(2.2rem, 4vw, 3.2rem);
        color: rgba(44, 42, 39, 0.94);
        font-style: italic;
      }

      .location-address {
        margin-top: 18px;
        font-size: 14px;
        line-height: 1.7;
        color: rgba(44, 42, 39, 0.76);
      }

      .location-time {
        margin-top: 12px;
        font-size: 13px;
        letter-spacing: 0.12em;
        text-transform: lowercase;
      }

      .location-button {
        display: inline-flex;
        align-items: center;
        gap: 10px;
        margin-top: 26px;
        padding: 12px 18px;
        border: 1px solid rgba(44, 42, 39, 0.24);
        border-radius: 999px;
        letter-spacing: 0.18em;
        text-transform: uppercase;
        font-size: 11px;
        color: rgba(44, 42, 39, 0.78);
        background: rgba(255, 255, 255, 0.1);
      }

      .final-hero {
        background: var(--navy);
        min-height: 88vh;
        display: grid;
        place-items: center;
        position: relative;
      }

      .final-inner {
        text-align: center;
        color: rgba(255, 255, 255, 0.93);
      }

      .final-star {
        margin: 0 auto 8px;
        width: 14px;
        height: 14px;
        position: relative;
        transform: rotate(45deg);
        background: var(--gold);
      }

      .final-star::before,
      .final-star::after {
        content: '';
        position: absolute;
        background: var(--gold);
      }

      .final-star::before {
        width: 14px;
        height: 2px;
        left: 0;
        top: 6px;
      }

      .final-star::after {
        width: 2px;
        height: 14px;
        left: 6px;
        top: 0;
      }

      .final-title {
        font-size: clamp(4rem, 7vw, 8rem);
        line-height: 0.9;
        font-weight: 500;
        color: rgba(233, 220, 198, 0.95);
        letter-spacing: -0.065em;
        font-family: 'Cormorant Garamond', serif;
      }

      .final-subtitle {
        margin-top: 14px;
        font-size: 16px;
        font-family: 'Cormorant Garamond', serif;
        color: rgba(255, 255, 255, 0.8);
        font-style: italic;
      }

      .final-date {
        margin-top: 22px;
        font-size: 14px;
        letter-spacing: 0.26em;
        color: rgba(255, 255, 255, 0.68);
      }

      .final-social {
        display: inline-flex;
        align-items: center;
        gap: 12px;
        padding: 18px 26px;
        margin-top: 28px;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.02);
        border: 1px solid rgba(255, 255, 255, 0.22);
        color: rgba(255, 255, 255, 0.85);
        font-size: 12px;
        letter-spacing: 0.18em;
        text-transform: lowercase;
      }

      .final-social .insta {
        width: 18px;
        height: 18px;
        border: 1px solid rgba(255, 255, 255, 0.6);
        border-radius: 5px;
        display: inline-grid;
        place-items: center;
        font-size: 8px;
      }

      @media (max-width: 768px) {
        .hero-card {
          min-height: 360px;
          padding-top: 24px;
        }

        .hero-kicker {
          letter-spacing: 0.12em;
          font-size: 10px;
        }

        .hero-title .name {
          font-size: clamp(3.6rem, 16vw, 5rem);
        }

        .section {
          padding-top: 72px;
          padding-bottom: 72px;
        }

        .family-grid {
          gap: 18px;
          max-width: 440px;
        }

        .family-col {
          padding: 0 8px;
        }

        .countdown-grid {
          gap: 10px;
        }

        .count-box {
          min-height: 92px;
        }

        .calendar-card {
          padding-left: 12px;
          padding-right: 12px;
        }
      }

      @media (max-width: 560px) {
        .hero {
          min-height: 92vh;
        }

        .hero-inner {
          padding-left: 20px;
          padding-right: 20px;
        }

        .hero-card {
          min-height: 320px;
          padding-left: 18px;
          padding-right: 18px;
        }

        .hero-title .name {
          font-size: clamp(3rem, 17vw, 4.5rem);
        }

        .hero-date {
          letter-spacing: 0.18em;
          font-size: 11px;
        }

        .hero-footer {
          letter-spacing: 0.12em;
          font-size: 10px;
        }

        .quote-text {
          font-size: clamp(1.8rem, 8vw, 2.6rem);
        }

        .family-grid {
          grid-template-columns: 1fr;
        }

        .family-col + .family-col::before {
          display: none;
        }

        .family-name {
          font-size: 1.2rem;
        }

        .countdown-grid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }

        .calendar-weekdays,
        .calendar-days {
          gap: 8px 4px;
        }

        .calendar-day {
          min-height: 36px;
          font-size: 12px;
        }

        .final-title {
          font-size: clamp(3rem, 16vw, 5rem);
        }

        .final-social {
          letter-spacing: 0.1em;
          padding-left: 16px;
          padding-right: 16px;
        }

        .floating-btn {
          right: 14px;
          width: 46px;
          height: 46px;
        }
      }
    </style>
  </head>
  <body>
    <div class="page-shell">
      <header class="hero" id="top">
        <button class="lang-pill" aria-label="Tilni tanlash">UZ</button>

        <div class="hero-inner">
          <div class="hero-card">
            <div class="hero-kicker">Nikoh to'yiga taklifnoma</div>
            <div class="hero-title" aria-label="Nozim and Nozima">
              <span class="name">Nozim</span>
              <span class="amp">&amp;</span>
              <span class="name">Nozima</span>
            </div>
            <div class="hero-date">- 19 . 09 . 2026 -</div>
            <div class="hero-footer">Davomi bor — pastga suring</div>
          </div>
        </div>

        <a class="floating-btn scroll-btn" href="#quote" aria-label="Pastga o‘tish">↓</a>
        <button class="floating-btn music-btn" aria-label="Musiqa">♫</button>
      </header>

      <main>
        <section class="section soft-section quote" id="quote">
          <div class="arabic">بِسْمِ ٱللّٰهِ ٱلرَّحْمٰنِ ٱلرَّحِيمِ</div>
          <div class="divider"></div>
          <p class="quote-text">
            «Yana bir oyatlardan biri — sizlarga o'zingizdan, ko'ngillarizga
            izonganiz va orangizga muhabbat va rahmat solib qo'ygandir.»
          </p>
          <div class="quote-meta">(Rum surasi, 21-oyat)</div>
        </section>

        <section class="family-wrap">
          <div class="family">
            <div class="eyebrow">Katta hurmat bilan</div>
            <h2 class="family-title">Rostam va Nodira<br />Soliyevlar</h2>
            <div class="family-divider"></div>
            <div class="family-grid">
              <div class="family-col">
                <div class="family-name">Rostam va Nodira <span class="plus">+</span></div>
                <div class="family-role">Soliyevlar</div>
              </div>
              <div class="family-col">
                <div class="family-name">Akmal va Dilbar <span class="plus">+</span></div>
                <div class="family-role">Karimovlar</div>
              </div>
            </div>
            <p class="family-quote">
              Farzandlarimizning baxtli kunini Siz bilan birga nishonlashdan
              mamnunmiz.
            </p>
          </div>
        </section>

        <section class="section soft-section">
          <div class="countdown">
            <div class="countdown-label">Sizni taklif etamiz</div>
            <h2 class="countdown-title">Ikki yuraq bir bo'lib,<br />yang hayot ostonasida turbiz</h2>
            <div class="countdown-divider"></div>

            <div class="countdown-grid" aria-label="Wedding countdown">
              <div class="count-box">
                <div class="count-value" id="days">00</div>
                <div class="count-label">Kun</div>
              </div>
              <div class="count-box">
                <div class="count-value" id="hours">00</div>
                <div class="count-label">Soat</div>
              </div>
              <div class="count-box">
                <div class="count-value" id="minutes">00</div>
                <div class="count-label">Daqiqa</div>
              </div>
              <div class="count-box">
                <div class="count-value" id="seconds">00</div>
                <div class="count-label">Soniya</div>
              </div>
            </div>
          </div>
        </section>

        <section class="section soft-section" style="padding-top: 0;">
          <div class="calendar-card" aria-label="Wedding date calendar">
            <div class="calendar-header">Sentyabr 2026</div>
            <div class="calendar-weekdays">
              <div>Du</div>
              <div>Se</div>
              <div>Ch</div>
              <div>Pa</div>
              <div>Ju</div>
              <div>Sh</div>
              <div>Ya</div>
            </div>
            <div class="calendar-days">
              <div class="calendar-day empty"></div>
              <div class="calendar-day empty"></div>
              <div class="calendar-day">1</div>
              <div class="calendar-day">2</div>
              <div class="calendar-day">3</div>
              <div class="calendar-day">4</div>
              <div class="calendar-day">5</div>

              <div class="calendar-day">6</div>
              <div class="calendar-day">7</div>
              <div class="calendar-day">8</div>
              <div class="calendar-day">9</div>
              <div class="calendar-day">10</div>
              <div class="calendar-day">11</div>
              <div class="calendar-day">12</div>

              <div class="calendar-day">13</div>
              <div class="calendar-day">14</div>
              <div class="calendar-day">15</div>
              <div class="calendar-day">16</div>
              <div class="calendar-day">17</div>
              <div class="calendar-day active">18</div>
              <div class="calendar-day">19</div>

              <div class="calendar-day">20</div>
              <div class="calendar-day">21</div>
              <div class="calendar-day">22</div>
              <div class="calendar-day">23</div>
              <div class="calendar-day">24</div>
              <div class="calendar-day">25</div>
              <div class="calendar-day">26</div>

              <div class="calendar-day">27</div>
              <div class="calendar-day">28</div>
              <div class="calendar-day">29</div>
              <div class="calendar-day">30</div>
              <div class="calendar-day empty"></div>
              <div class="calendar-day empty"></div>
              <div class="calendar-day empty"></div>
            </div>
          </div>
        </section>

        <section class="section soft-section" style="padding-top: 32px;">
          <div class="location-card">
            <div class="location-icon">⌖</div>
            <div class="location-title">Baxtiyor restorani</div>
            <div class="location-address">
              Toshkent sh., Yunusobod tumani,<br />Amir Temur ko'chasi 108<br />
              <span style="display:block; margin-top: 6px;">Soat 18:00 dan</span>
            </div>
            <a class="location-button" href="https://maps.google.com/?q=Amir+Temur+ko%27chasi+108+Toshkent" target="_blank" rel="noreferrer">
              Manzili ko'rish →
            </a>
          </div>
        </section>

        <section class="final-hero" aria-label="Invitation footer">
          <div class="final-inner">
            <div class="final-star"></div>
            <div class="final-title">Nozim &amp; Nozima</div>
            <div class="final-subtitle">Sizni kutib qolamiz</div>
            <div class="final-date">19 . 09 . 2026</div>
            <div class="final-social">
              <span class="insta">◎</span>
              <span>@tashrifnoma.uz</span>
            </div>
          </div>
        </section>
      </main>
    </div>

    <script>
      (function () {
        var targetDate = new Date('2026-09-19T18:00:00');

        function updateCountdown() {
          var now = new Date();
          var difference = targetDate.getTime() - now.getTime();

          if (difference <= 0) {
            document.getElementById('days').textContent = '00';
            document.getElementById('hours').textContent = '00';
            document.getElementById('minutes').textContent = '00';
            document.getElementById('seconds').textContent = '00';
            return;
          }

          var days = Math.floor(difference / (1000 * 60 * 60 * 24));
          var hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
          var minutes = Math.floor((difference / (1000 * 60)) % 60);
          var seconds = Math.floor((difference / 1000) % 60);

          document.getElementById('days').textContent = String(days).padStart(2, '0');
          document.getElementById('hours').textContent = String(hours).padStart(2, '0');
          document.getElementById('minutes').textContent = String(minutes).padStart(2, '0');
          document.getElementById('seconds').textContent = String(seconds).padStart(2, '0');
        }

        updateCountdown();
        setInterval(updateCountdown, 1000);
      })();
    </script>
  </body>
</html>`;
  }

  @Get('hello')
  getHello(): string {
    return this.appService.getHello();
  }
}
