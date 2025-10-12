/**
 * HTML Escape function
 */
function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Render article sections (Interview format)
 */
function renderArticleSections(sections = []) {
  if (!Array.isArray(sections) || sections.length === 0) {
    return '';
  }

  return sections
    .map(
      (section, index) => `
        <article class="interview-block animate-on-scroll">
          <div class="interview-content">
            <div class="interview-meta">
              <span class="interview-number">Chapter ${String(index + 1).padStart(2, '0')}</span>
            </div>
            <h3 class="interview-heading">${escapeHtml(section.heading)}</h3>
            <div class="interview-body">
              <p>${escapeHtml(section.content)}</p>
            </div>
          </div>
        </article>
      `,
    )
    .join('\n');
}

/**
 * Render summary (Key Takeaways)
 */
function renderSummary(summary = []) {
  if (!Array.isArray(summary) || summary.length === 0) {
    return '';
  }

  const items = summary.map((item) => `<li>${escapeHtml(item)}</li>`).join('\n');
  return `
    <div class="key-takeaways animate-on-scroll">
      <h3>Key Takeaways</h3>
      <ul>
        ${items}
      </ul>
    </div>
  `;
}

export function generateHTMLPage({ formData, persona, scenario, article, videoUrl, videoId }) {
  const nickname = escapeHtml(formData?.q8 ?? '');
  const personaAchievements = Array.isArray(persona?.achievements) ? persona.achievements.map(escapeHtml) : [];
  const scenarioAdvice = Array.isArray(scenario?.advice) ? scenario.advice.map(escapeHtml) : [];
  const safeVideoUrl = videoUrl ? escapeHtml(videoUrl) : `/output/${escapeHtml(videoId ?? '')}.mp4`;

  return `<!DOCTYPE html>
<html lang="ja">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Future You — ${nickname}</title>
    <meta name="description" content="${nickname} さんへ、3年後の自分からのメッセージ">
    <style>
      /* ============================================
         🍎 Apple HIG Design System v2 - Result Page
         ============================================ */
      
      /* Reset */
      *, *::before, *::after {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
      }
      
      :root {
        /* ============================================
           PRIMARY COLORS
           ============================================ */
        color-scheme: light dark;
        
        --color-label-primary: #000000;
        --color-label-secondary: rgba(60,60,67,0.6);
        --color-label-tertiary: rgba(60,60,67,0.3);
        
        --color-background: #ffffff;
        --color-background-secondary: #f5f5f7;
        --color-background-tertiary: #ffffff;
        
        --color-separator: rgba(60,60,67,0.29);
        
        /* ============================================
           ACCENT COLORS
           ============================================ */
        --color-accent-blue: #007aff;
        --color-accent-gold: #d4a574;
        
        /* ============================================
           FONT SCALE
           ============================================ */
        --font-size-largeTitle: clamp(34px, 4vw, 48px);
        --font-weight-largeTitle: 700;
        --line-height-largeTitle: 1.1;
        --letter-spacing-largeTitle: -0.02em;
        
        --font-size-title1: clamp(28px, 3.2vw, 34px);
        --font-weight-title1: 700;
        --line-height-title1: 1.2;
        --letter-spacing-title1: -0.015em;
        
        --font-size-title2: clamp(22px, 2.5vw, 28px);
        --font-weight-title2: 700;
        --line-height-title2: 1.25;
        --letter-spacing-title2: -0.01em;
        
        --font-size-title3: clamp(20px, 2.2vw, 22px);
        --font-weight-title3: 600;
        --line-height-title3: 1.3;
        --letter-spacing-title3: -0.008em;
        
        --font-size-headline: 17px;
        --font-weight-headline: 600;
        --line-height-headline: 1.35;
        --letter-spacing-headline: -0.005em;
        
        --font-size-body: 17px;
        --font-weight-body: 400;
        --line-height-body: 1.47;
        --letter-spacing-body: -0.0025em;
        
        --font-size-callout: 16px;
        --line-height-callout: 1.375;
        
        --font-size-subheadline: 15px;
        --line-height-subheadline: 1.33;
        
        --font-size-footnote: 13px;
        --line-height-footnote: 1.38;
        
        --font-size-caption1: 12px;
        --line-height-caption1: 1.33;
        
        --font-size-caption2: 11px;
        --line-height-caption2: 1.27;
        --letter-spacing-caption2: 0.006em;
        
        /* ============================================
           SPACING
           ============================================ */
        --space-4: 16px;
        --space-6: 24px;
        --space-8: 32px;
        --space-10: 40px;
        --space-12: 48px;
        --space-16: 64px;
        --space-20: 80px;
        --space-24: 96px;
        --space-32: 128px;
        
        --container-max-width: 1200px;
        --content-max-width: 692px;
        --container-padding-mobile: 20px;
        --container-padding-tablet: 40px;
        --container-padding-desktop: 80px;
        
        --section-spacing-mobile: 60px;
        --section-spacing-tablet: 80px;
        --section-spacing-desktop: 120px;
        
        /* ============================================
           EFFECTS
           ============================================ */
        --shadow-image: 0 10px 40px rgba(0,0,0,0.12), 0 4px 16px rgba(0,0,0,0.08);
        --radius-large: 12px;
        --radius-xlarge: 18px;
        
        --ease-apple: cubic-bezier(0.28, 0.11, 0.32, 1);
        --duration-normal: 300ms;
        --duration-slow: 500ms;
        --duration-slower: 800ms;
      }
      
      /* ============================================
         DARK MODE
         ============================================ */
      @media (prefers-color-scheme: dark) {
        :root {
          --color-label-primary: #ffffff;
          --color-label-secondary: rgba(235,235,245,0.6);
          --color-label-tertiary: rgba(235,235,245,0.3);
          
          --color-background: #000000;
          --color-background-secondary: #1c1c1e;
          --color-background-tertiary: #2c2c2e;
          
          --color-separator: rgba(84,84,88,0.65);
        }
      }
      
      /* ============================================
         BASE STYLES
         ============================================ */
      html {
        scroll-behavior: smooth;
      }
      
      body {
        margin: 0;
        font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Hiragino Kaku Gothic ProN", "Hiragino Sans", sans-serif;
        background: var(--color-background);
        color: var(--color-label-primary);
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        font-size: var(--font-size-body);
        font-weight: var(--font-weight-body);
        line-height: var(--line-height-body);
        letter-spacing: var(--letter-spacing-body);
      }
      
      /* ============================================
         LAYOUT
         ============================================ */
      .container {
        max-width: var(--container-max-width);
        margin: 0 auto;
        padding-left: var(--container-padding-mobile);
        padding-right: var(--container-padding-mobile);
      }
      
      @media (min-width: 768px) {
        .container {
          padding-left: var(--container-padding-tablet);
          padding-right: var(--container-padding-tablet);
        }
      }
      
      @media (min-width: 1024px) {
        .container {
          padding-left: var(--container-padding-desktop);
          padding-right: var(--container-padding-desktop);
        }
      }
      
      .content-wrapper {
        max-width: var(--content-max-width);
        margin: 0 auto;
      }
      
      /* ============================================
         HERO SECTION
         ============================================ */
      .hero {
        position: relative;
        min-height: 60vh;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(180deg, #000000 0%, #1a1a1a 100%);
        padding: var(--space-32) var(--container-padding-mobile);
      }
      
      .hero__content {
        text-align: center;
        animation: fadeIn var(--duration-slower) var(--ease-apple);
      }
      
      .hero__eyebrow {
        font-size: var(--font-size-subheadline);
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: rgba(255,255,255,0.5);
        margin-bottom: 16px;
      }
      
      .hero__title {
        font-size: clamp(48px, 8vw, 96px);
        font-weight: 700;
        letter-spacing: -0.03em;
        line-height: 1;
        color: #ffffff;
        margin-bottom: 20px;
        background: linear-gradient(180deg, #ffffff 0%, rgba(255,255,255,0.8) 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }
      
      .hero__subtitle {
        font-size: var(--font-size-title3);
        line-height: 1.4;
        color: rgba(255,255,255,0.7);
        max-width: 600px;
        margin: 0 auto;
      }
      
      /* ============================================
         VIDEO SECTION
         ============================================ */
      .video-section {
        background-color: #000000;
        padding: var(--section-spacing-mobile) 0;
      }
      
      @media (min-width: 1024px) {
        .video-section {
          padding: var(--section-spacing-desktop) 0;
        }
      }
      
      .video-wrapper {
        position: relative;
        max-width: 1200px;
        margin: 0 auto;
      }
      
      .video-container {
        position: relative;
        width: 100%;
        aspect-ratio: 16 / 9;
        border-radius: var(--radius-xlarge);
        overflow: hidden;
        box-shadow: var(--shadow-image);
        background-color: #000000;
      }
      
      @media (max-width: 733px) {
        .video-container {
          border-radius: 0;
          margin-left: calc(var(--container-padding-mobile) * -1);
          margin-right: calc(var(--container-padding-mobile) * -1);
          width: 100vw;
        }
      }
      
      .video-player {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
      }
      
      .video-caption {
        text-align: center;
        margin-top: var(--space-6);
        font-size: var(--font-size-footnote);
        color: rgba(255,255,255,0.5);
      }
      
      /* ============================================
         INTRO SECTION
         ============================================ */
      .intro-section {
        background-color: var(--color-background-secondary);
        padding: var(--section-spacing-mobile) 0;
      }
      
      @media (min-width: 1024px) {
        .intro-section {
          padding: var(--section-spacing-desktop) 0;
        }
      }
      
      .intro-eyebrow {
        font-size: var(--font-size-caption1);
        font-weight: 600;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        color: var(--color-label-secondary);
        margin-bottom: var(--space-6);
        text-align: center;
      }
      
      .intro-text {
        font-size: var(--font-size-title3);
        line-height: 1.5;
        color: var(--color-label-primary);
        text-align: center;
        max-width: 820px;
        margin: 0 auto;
      }
      
      @media (max-width: 733px) {
        .intro-text {
          font-size: var(--font-size-body);
          text-align: left;
        }
      }
      
      /* ============================================
         MAIN CONTENT
         ============================================ */
      .main-content {
        background-color: var(--color-background);
        padding: var(--section-spacing-mobile) 0;
      }
      
      @media (min-width: 1024px) {
        .main-content {
          padding: var(--section-spacing-desktop) 0;
        }
      }
      
      .content-header {
        margin-bottom: var(--space-20);
      }
      
      .content-title {
        font-size: var(--font-size-title1);
        font-weight: var(--font-weight-title1);
        line-height: var(--line-height-title1);
        letter-spacing: var(--letter-spacing-title1);
        color: var(--color-label-primary);
      }
      
      /* ============================================
         INTERVIEW BLOCKS
         ============================================ */
      .interview-block {
        margin-bottom: var(--space-32);
      }
      
      .interview-block:last-child {
        margin-bottom: 0;
      }
      
      @media (max-width: 733px) {
        .interview-block {
          margin-bottom: var(--space-20);
        }
      }
      
      .interview-meta {
        margin-bottom: var(--space-4);
      }
      
      .interview-number {
        display: inline-block;
        font-size: var(--font-size-caption2);
        font-weight: 600;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: var(--color-accent-gold);
      }
      
      .interview-heading {
        font-size: var(--font-size-title2);
        font-weight: var(--font-weight-title2);
        line-height: var(--line-height-title2);
        letter-spacing: var(--letter-spacing-title2);
        color: var(--color-label-primary);
        margin-bottom: var(--space-6);
      }
      
      .interview-body {
        font-size: var(--font-size-body);
        line-height: var(--line-height-body);
        color: var(--color-label-primary);
      }
      
      .interview-body p {
        margin-bottom: var(--space-6);
      }
      
      .interview-body p:last-child {
        margin-bottom: 0;
      }
      
      .interview-body blockquote {
        margin: var(--space-10) 0;
        padding-left: var(--space-6);
        border-left: 3px solid var(--color-accent-gold);
        font-size: var(--font-size-title3);
        font-weight: 500;
        line-height: 1.4;
        color: var(--color-label-secondary);
        font-style: italic;
      }
      
      /* ============================================
         KEY TAKEAWAYS
         ============================================ */
      .key-takeaways {
        background: linear-gradient(135deg, rgba(0, 122, 255, 0.05), rgba(212, 165, 116, 0.05));
        border-radius: var(--radius-xlarge);
        padding: var(--space-10);
        margin-top: var(--space-32);
      }
      
      .key-takeaways h3 {
        font-size: var(--font-size-title2);
        font-weight: var(--font-weight-title2);
        color: var(--color-label-primary);
        margin-bottom: var(--space-6);
      }
      
      .key-takeaways ul {
        list-style: none;
        padding: 0;
        margin: 0;
      }
      
      .key-takeaways li {
        font-size: var(--font-size-body);
        line-height: var(--line-height-body);
        color: var(--color-label-primary);
        padding-left: var(--space-8);
        margin-bottom: var(--space-4);
        position: relative;
      }
      
      .key-takeaways li::before {
        content: '✓';
        position: absolute;
        left: 0;
        color: var(--color-accent-blue);
        font-weight: 700;
      }
      
      .key-takeaways li:last-child {
        margin-bottom: 0;
      }
      
      /* ============================================
         FOOTER
         ============================================ */
      footer {
        background: var(--color-background-secondary);
        padding: var(--space-20) 0;
        text-align: center;
      }
      
      .footer-text {
        font-size: var(--font-size-footnote);
        color: var(--color-label-secondary);
        margin-bottom: var(--space-4);
      }
      
      .footer-detail {
        font-size: var(--font-size-caption2);
        color: var(--color-label-tertiary);
      }
      
      /* ============================================
         ANIMATIONS
         ============================================ */
      @keyframes fadeIn {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }
      
      @keyframes slideUp {
        from {
          opacity: 0;
          transform: translateY(30px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      .animate-on-scroll {
        opacity: 0;
        transform: translateY(30px);
        transition: opacity var(--duration-slow) var(--ease-apple),
                    transform var(--duration-slow) var(--ease-apple);
      }
      
      .animate-on-scroll.is-visible {
        opacity: 1;
        transform: translateY(0);
      }
      
      /* ============================================
         FOCUS STYLES
         ============================================ */
      *:focus {
        outline: none;
      }
      
      *:focus-visible {
        outline: 2px solid var(--color-accent-blue);
        outline-offset: 3px;
      }
      
      /* ============================================
         REDUCED MOTION
         ============================================ */
      @media (prefers-reduced-motion: reduce) {
        *,
        *::before,
        *::after {
          animation-duration: 0.01ms !important;
          transition-duration: 0.01ms !important;
        }
      }
    </style>
  </head>
  <body>
    <!-- ============================================
         HERO SECTION
         ============================================ -->
    <section class="hero">
      <div class="hero__content">
        <div class="hero__eyebrow">Future You Message</div>
        <h1 class="hero__title">${nickname}</h1>
        <p class="hero__subtitle">3年後のあなたからのメッセージ</p>
      </div>
    </section>

    <!-- ============================================
         VIDEO SECTION
         ============================================ -->
    <section class="video-section">
      <div class="container">
        <div class="video-wrapper">
          <div class="video-container">
            <video 
              class="video-player"
              src="${safeVideoUrl}"
              controls
              autoplay
              muted
              playsinline
            ></video>
          </div>
          <p class="video-caption">未来のあなたから、今のあなたへ</p>
        </div>
      </div>
    </section>

    <!-- ============================================
         INTRO SECTION
         ============================================ -->
    <section class="intro-section">
      <div class="container">
        <div class="content-wrapper">
          <div class="intro-eyebrow">From Your Future Self</div>
          <p class="intro-text">
            ${escapeHtml(scenario?.summary ?? '')}
          </p>
        </div>
      </div>
    </section>

    <!-- ============================================
         MAIN CONTENT
         ============================================ -->
    <section class="main-content">
      <div class="container">
        <div class="content-wrapper">
          
          <!-- Persona / Career Title -->
          <header class="content-header">
            <h2 class="content-title">
              ${escapeHtml(persona?.career ?? '')}
            </h2>
          </header>
          
          <!-- Article Content -->
          ${renderArticleSections(article?.sections)}
          
          <!-- Key Takeaways -->
          ${renderSummary(article?.summary)}
          
        </div>
      </div>
    </section>

    <!-- ============================================
         FOOTER
         ============================================ -->
    <footer>
      <div class="container">
        <p class="footer-text">Future You System · ${new Date().getFullYear()}</p>
        <p class="footer-detail">Video ID: ${escapeHtml(videoId ?? '')}</p>
      </div>
    </footer>

    <!-- ============================================
         JAVASCRIPT - Scroll Animations
         ============================================ -->
    <script>
      // Intersection Observer for scroll animations
      const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
      };

      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      }, observerOptions);

      // Observe all animatable elements
      const animateElements = document.querySelectorAll('.animate-on-scroll');
      animateElements.forEach(el => observer.observe(el));
    </script>
  </body>
</html>`;
}
