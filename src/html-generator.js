function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderArticleSections(sections = []) {
  return sections
    .map(
      (section) => `
        <section class="article-section">
          <h3>${escapeHtml(section.heading)}</h3>
          <p>${escapeHtml(section.content)}</p>
        </section>
      `,
    )
    .join('\n');
}

function renderSummary(summary = []) {
  if (!Array.isArray(summary) || summary.length === 0) {
    return '';
  }

  const items = summary.map((item) => `<li>${escapeHtml(item)}</li>`).join('\n');
  return `
    <div class="summary-card">
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
  const safeVideoUrl = videoUrl
    ? escapeHtml(videoUrl)
    : `/output/${escapeHtml(videoId ?? '')}.mp4`;

  return `<!DOCTYPE html>
<html lang="ja">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Future You — ${nickname}</title>
    <style>
      /* ========================================
         🍎 Apple Design System - Reset & Base
         ======================================== */
      * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
      }
      
      :root {
        color-scheme: light;
        
        /* Apple Color Palette */
        --apple-white: #FFFFFF;
        --apple-gray-1: #F5F5F7;
        --apple-gray-2: #E8E8ED;
        --apple-gray-3: #D2D2D7;
        --apple-gray-4: #86868B;
        --apple-gray-5: #6E6E73;
        --apple-gray-6: #1D1D1F;
        --apple-black: #000000;
        
        /* Apple Blue */
        --apple-blue: #007AFF;
        --apple-blue-light: #5AC8FA;
        
        /* Spacing System */
        --space-xs: 8px;
        --space-sm: 16px;
        --space-md: 24px;
        --space-lg: 40px;
        --space-xl: 64px;
        --space-2xl: 96px;
        --space-3xl: 128px;
        
        /* Typography */
        --font-weight-regular: 400;
        --font-weight-medium: 500;
        --font-weight-semibold: 600;
        --font-weight-bold: 700;
        
        /* Border Radius */
        --radius-sm: 8px;
        --radius-md: 12px;
        --radius-lg: 18px;
        --radius-xl: 24px;
      }
      
      body {
        margin: 0;
        font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Hiragino Kaku Gothic ProN", "Hiragino Sans", sans-serif;
        background: var(--apple-white);
        color: var(--apple-gray-6);
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        line-height: 1.47059;
        letter-spacing: -0.022em;
      }
      
      /* ========================================
         🎭 Hero Header - Typography First
         ======================================== */
      .hero-header {
        background: var(--apple-gray-6);
        color: var(--apple-white);
        text-align: center;
        padding: var(--space-3xl) var(--space-md) var(--space-2xl);
        position: relative;
        overflow: hidden;
      }
      
      .hero-header::before {
        content: '';
        position: absolute;
        top: -50%;
        left: -50%;
        width: 200%;
        height: 200%;
        background: radial-gradient(circle at center, rgba(0, 122, 255, 0.08) 0%, transparent 70%);
        animation: pulse 8s ease-in-out infinite;
      }
      
      @keyframes pulse {
        0%, 100% { transform: scale(1); opacity: 0.5; }
        50% { transform: scale(1.1); opacity: 0.8; }
      }
      
      .hero-content {
        position: relative;
        z-index: 1;
        max-width: 980px;
        margin: 0 auto;
      }
      
      .hero-label {
        font-size: 17px;
        font-weight: var(--font-weight-semibold);
        letter-spacing: 0.05em;
        text-transform: uppercase;
        color: var(--apple-blue-light);
        margin-bottom: var(--space-sm);
      }
      
      .hero-title {
        font-size: clamp(48px, 8vw, 96px);
        font-weight: var(--font-weight-bold);
        line-height: 1.02;
        letter-spacing: -0.015em;
        margin-bottom: var(--space-md);
      }
      
      .hero-subtitle {
        font-size: clamp(21px, 3vw, 28px);
        font-weight: var(--font-weight-medium);
        line-height: 1.28571;
        letter-spacing: 0.007em;
        color: rgba(255, 255, 255, 0.7);
        max-width: 640px;
        margin: 0 auto;
      }
      
      /* ========================================
         📐 Layout - Spacious & Clean
         ======================================== */
      .container {
        max-width: 980px;
        margin: 0 auto;
        padding: 0 var(--space-md);
      }
      
      .section {
        padding: var(--space-2xl) 0;
      }
      
      .section-tight {
        padding: var(--space-xl) 0;
      }
      
      /* ========================================
         📦 Content Cards - Minimal Shadows
         ======================================== */
      .content-card {
        background: var(--apple-white);
        border-radius: var(--radius-xl);
        padding: clamp(var(--space-lg), 6vw, var(--space-xl));
        margin-bottom: var(--space-lg);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04),
                    0 4px 16px rgba(0, 0, 0, 0.06);
      }
      
      .content-card-dark {
        background: var(--apple-gray-6);
        color: var(--apple-white);
      }
      
      .content-card-feature {
        background: var(--apple-gray-1);
        box-shadow: none;
      }
      
      /* ========================================
         🎬 Video Section - Premium Display
         ======================================== */
      .video-section {
        background: var(--apple-black);
        padding: var(--space-2xl) var(--space-md);
        margin: var(--space-2xl) 0;
      }
      
      .video-container {
        max-width: 980px;
        margin: 0 auto;
      }
      
      .video-wrapper {
        position: relative;
        padding-bottom: 56.25%;
        height: 0;
        overflow: hidden;
        border-radius: var(--radius-lg);
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
      }
      
      .video-wrapper video {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      
      .video-caption {
        text-align: center;
        margin-top: var(--space-md);
        font-size: 17px;
        color: var(--apple-gray-4);
        letter-spacing: -0.022em;
      }
      
      /* ========================================
         ✨ Typography - Clear Hierarchy
         ======================================== */
      .section-title {
        font-size: clamp(32px, 5vw, 48px);
        font-weight: var(--font-weight-bold);
        line-height: 1.08349;
        letter-spacing: -0.003em;
        margin-bottom: var(--space-md);
      }
      
      .section-subtitle {
        font-size: clamp(19px, 3vw, 24px);
        font-weight: var(--font-weight-medium);
        line-height: 1.381;
        letter-spacing: 0.012em;
        color: var(--apple-gray-5);
        margin-bottom: var(--space-lg);
      }
      
      h2 {
        font-size: clamp(28px, 4vw, 40px);
        font-weight: var(--font-weight-bold);
        line-height: 1.1;
        letter-spacing: -0.015em;
        margin-bottom: var(--space-md);
      }
      
      h3 {
        font-size: clamp(21px, 3vw, 28px);
        font-weight: var(--font-weight-semibold);
        line-height: 1.28571;
        letter-spacing: 0.007em;
        margin-bottom: var(--space-sm);
        color: var(--apple-gray-6);
      }
      
      h4 {
        font-size: 19px;
        font-weight: var(--font-weight-semibold);
        line-height: 1.42105;
        letter-spacing: 0.012em;
        margin-bottom: var(--space-xs);
        color: var(--apple-gray-6);
      }
      
      p {
        font-size: 17px;
        line-height: 1.47059;
        letter-spacing: -0.022em;
        color: var(--apple-gray-6);
        margin-bottom: var(--space-md);
      }
      
      .lead-text {
        font-size: 21px;
        line-height: 1.381;
        letter-spacing: 0.011em;
        color: var(--apple-gray-5);
      }
      
      /* ========================================
         🎨 Persona Grid - Clean Layout
         ======================================== */
      .persona-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: var(--space-md);
        margin-top: var(--space-lg);
      }
      
      .persona-item {
        background: var(--apple-white);
        border-radius: var(--radius-lg);
        padding: var(--space-md);
        border: 1px solid var(--apple-gray-2);
      }
      
      .persona-item h4 {
        color: var(--apple-gray-5);
        font-size: 15px;
        font-weight: var(--font-weight-semibold);
        text-transform: uppercase;
        letter-spacing: 0.05em;
        margin-bottom: var(--space-sm);
      }
      
      .persona-item p {
        font-size: 17px;
        line-height: 1.47059;
        color: var(--apple-gray-6);
        margin: 0;
      }
      
      .persona-item ul {
        list-style: none;
        padding: 0;
        margin: 0;
      }
      
      .persona-item li {
        font-size: 17px;
        line-height: 1.47059;
        color: var(--apple-gray-6);
        padding-left: var(--space-sm);
        margin-bottom: var(--space-xs);
        position: relative;
      }
      
      .persona-item li::before {
        content: '•';
        position: absolute;
        left: 0;
        color: var(--apple-blue);
        font-weight: bold;
      }
      
      /* ========================================
         📄 Article Section
         ======================================== */
      .article-section {
        margin-bottom: var(--space-xl);
      }
      
      .article-section:last-of-type {
        margin-bottom: 0;
      }
      
      .article-section h3 {
        color: var(--apple-gray-6);
      }
      
      .article-section p {
        font-size: 17px;
        line-height: 1.58824;
        letter-spacing: -0.022em;
        color: var(--apple-gray-6);
      }
      
      /* ========================================
         💡 Highlight Boxes
         ======================================== */
      .highlight-box {
        background: var(--apple-gray-1);
        border-radius: var(--radius-lg);
        padding: var(--space-lg);
        margin: var(--space-lg) 0;
      }
      
      .highlight-box-blue {
        background: rgba(0, 122, 255, 0.08);
        border-left: 4px solid var(--apple-blue);
      }
      
      .highlight-box h3 {
        margin-top: 0;
      }
      
      .highlight-box ul {
        list-style: none;
        padding: 0;
        margin: 0;
      }
      
      .highlight-box li {
        font-size: 17px;
        line-height: 1.58824;
        color: var(--apple-gray-6);
        padding-left: var(--space-md);
        margin-bottom: var(--space-sm);
        position: relative;
      }
      
      .highlight-box li::before {
        content: '✓';
        position: absolute;
        left: 0;
        color: var(--apple-blue);
        font-weight: bold;
      }
      
      blockquote {
        border-left: 4px solid var(--apple-blue);
        padding-left: var(--space-md);
        margin: var(--space-lg) 0;
        font-size: 19px;
        line-height: 1.58;
        color: var(--apple-gray-6);
        font-style: italic;
      }
      
      /* ========================================
         🎯 Footer
         ======================================== */
      footer {
        background: var(--apple-gray-6);
        color: var(--apple-gray-4);
        text-align: center;
        padding: var(--space-xl) var(--space-md);
        font-size: 15px;
      }
      
      /* ========================================
         🎬 Animations & Micro-interactions
         ======================================== */
      
      /* Smooth scrolling */
      html {
        scroll-behavior: smooth;
      }
      
      /* Fade in on scroll */
      .content-card,
      .persona-grid,
      .article-section {
        animation: fadeIn 0.6s cubic-bezier(0.4, 0, 0.2, 1) both;
      }
      
      .content-card:nth-child(2) {
        animation-delay: 0.1s;
      }
      
      .content-card:nth-child(3) {
        animation-delay: 0.2s;
      }
      
      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateY(24px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      /* Interactive card hover */
      .content-card {
        transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1),
                    box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }
      
      .content-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08),
                    0 8px 32px rgba(0, 0, 0, 0.12);
      }
      
      /* Persona item hover */
      .persona-item {
        transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1),
                    box-shadow 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      }
      
      .persona-item:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
      }
      
      /* Video wrapper hover effect */
      .video-wrapper {
        transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1),
                    box-shadow 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      }
      
      .video-wrapper:hover {
        transform: scale(1.01);
        box-shadow: 0 24px 72px rgba(0, 0, 0, 0.5);
      }
      
      /* Smooth link hover */
      a {
        color: var(--apple-blue);
        text-decoration: none;
        transition: opacity 0.2s ease;
      }
      
      a:hover {
        opacity: 0.7;
      }
      
      /* Focus states for accessibility */
      *:focus-visible {
        outline: 2px solid var(--apple-blue);
        outline-offset: 4px;
        border-radius: var(--radius-sm);
      }
      
      /* Reduced motion for accessibility */
      @media (prefers-reduced-motion: reduce) {
        *,
        *::before,
        *::after {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
        }
      }
      
      /* ========================================
         📱 Responsive Design
         ======================================== */
      @media (max-width: 734px) {
        .hero-header {
          padding: var(--space-2xl) var(--space-md) var(--space-xl);
        }
        
        .section {
          padding: var(--space-xl) 0;
        }
        
        .section-tight {
          padding: var(--space-lg) 0;
        }
        
        .video-section {
          padding: var(--space-xl) var(--space-md);
          margin: var(--space-xl) 0;
        }
        
        .persona-grid {
          grid-template-columns: 1fr;
        }
        
        .content-card:hover {
          transform: none; /* Disable hover effects on mobile */
        }
        
        .persona-item:hover {
          transform: none;
        }
      }
      
      @media (max-width: 480px) {
        .hero-title {
          font-size: 48px;
        }
        
        .section-title {
          font-size: 32px;
        }
        
        h2 {
          font-size: 28px;
        }
      }
    </style>
  </head>
  <body>
    <!-- ========================================
         Hero Header
         ======================================== -->
    <header class="hero-header">
      <div class="hero-content">
        <p class="hero-label">Future You Message</p>
        <h1 class="hero-title">${nickname}</h1>
        <p class="hero-subtitle">3年後のあなたからのメッセージ</p>
      </div>
    </header>

    <!-- ========================================
         Video Section
         ======================================== -->
    <section class="video-section">
      <div class="video-container">
        <div class="video-wrapper">
          <video src="${safeVideoUrl}" controls autoplay muted playsinline></video>
        </div>
        <p class="video-caption">未来のあなたから、今のあなたへ</p>
      </div>
    </section>

    <!-- ========================================
         Main Content
         ======================================== -->
    <main class="container">
      <!-- Message Summary -->
      <section class="section">
        <h2 class="section-title">From Your Future Self</h2>
        <p class="lead-text">${escapeHtml(scenario?.summary ?? '')}</p>
      </section>

      <!-- Persona Section -->
      <section class="section-tight">
        <div class="content-card content-card-feature">
          <h2>${escapeHtml(persona?.career ?? '')}</h2>
          <div class="persona-grid">
            <div class="persona-item">
              <h4>Workplace</h4>
              <p>${escapeHtml(persona?.workplace ?? '')}</p>
            </div>
            <div class="persona-item">
              <h4>Lifestyle</h4>
              <p>${escapeHtml(persona?.lifestyle ?? '')}</p>
            </div>
            <div class="persona-item">
              <h4>Relationships</h4>
              <p>${escapeHtml(persona?.relationships ?? '')}</p>
            </div>
            <div class="persona-item">
              <h4>Personality</h4>
              <p>${escapeHtml(persona?.personality ?? '')}</p>
            </div>
            <div class="persona-item">
              <h4>Achievements</h4>
              <ul>
                ${personaAchievements.map((item) => `<li>${item}</li>`).join('')}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <!-- Message Structure -->
      <section class="section-tight">
        <div class="content-card">
          <h3>15秒メッセージ構成</h3>
          <p><strong>Opening:</strong> ${escapeHtml(scenario?.opening ?? '')}</p>
          <div class="highlight-box highlight-box-blue">
            <ul>
              ${scenarioAdvice.map((item) => `<li>${item}</li>`).join('')}
            </ul>
          </div>
          <p><strong>Closing:</strong> ${escapeHtml(scenario?.closing ?? '')}</p>
          <blockquote>${escapeHtml(scenario?.fullText ?? '')}</blockquote>
        </div>
      </section>

      <!-- Article Section -->
      <section class="section">
        <div class="content-card">
          <h2>${escapeHtml(article?.title ?? '')}</h2>
          <p class="section-subtitle">${escapeHtml(article?.subtitle ?? '')}</p>
          ${renderArticleSections(article?.sections)}
          ${renderSummary(article?.summary)}
          <div class="highlight-box">
            <h3>Conclusion</h3>
            <p>${escapeHtml(article?.conclusion ?? '')}</p>
          </div>
        </div>
      </section>
    </main>

    <!-- ========================================
         Footer
         ======================================== -->
    <footer>
      <p>Future You System · ${new Date().getFullYear()}</p>
      <p style="margin-top: 8px; font-size: 13px; opacity: 0.6;">Video ID: ${escapeHtml(videoId ?? '')}</p>
    </footer>
  </body>
</html>`;
}
