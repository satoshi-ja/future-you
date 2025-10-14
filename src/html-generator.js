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

export function generateHTMLPage({ formData, persona, scenario, article, videoUrl, videoId, recordId }) {
  const nickname = escapeHtml(formData?.q8 ?? '');
  const personaAchievements = Array.isArray(persona?.achievements) ? persona.achievements.map(escapeHtml) : [];
  const scenarioAdvice = Array.isArray(scenario?.advice) ? scenario.advice.map(escapeHtml) : [];
  const safeVideoUrl = videoUrl ? escapeHtml(videoUrl) : `/output/${escapeHtml(videoId ?? '')}.mp4`;
  const safeRecordId = escapeHtml(recordId ?? '');

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
         CHAT SECTION - Interactive Dialogue
         ============================================ */
      .chat-section {
        background: var(--color-background-secondary);
        padding: var(--section-spacing-mobile) 0;
        border-top: 1px solid var(--color-separator);
      }
      
      @media (min-width: 1024px) {
        .chat-section {
          padding: var(--section-spacing-desktop) 0;
        }
      }
      
      .chat-container {
        height: 100%;
        display: flex;
        flex-direction: column;
        background: var(--color-background);
      }
      
      /* Chat Header */
      .chat-header {
        text-align: center;
        margin-bottom: var(--space-10);
      }
      
      .chat-header h3 {
        font-size: var(--font-size-largeTitle);
        font-weight: var(--font-weight-largeTitle);
        line-height: var(--line-height-largeTitle);
        letter-spacing: var(--letter-spacing-largeTitle);
        color: var(--color-label-primary);
        margin: 0 0 var(--space-3) 0;
      }
      
      .chat-header-subtitle {
        font-size: var(--font-size-subheadline);
        line-height: 1.33;
        color: var(--color-label-secondary);
        margin: 0;
      }
      
      /* Chat Messages Container */
      .chat-messages {
        flex: 1;
        overflow-y: auto;
        padding: var(--space-6);
        background: var(--color-background-secondary);
        min-height: 300px;
      }
      
      .chat-message {
        margin-bottom: var(--space-4);
        padding: var(--space-4);
        border-radius: var(--radius-large);
        font-size: var(--font-size-body);
        line-height: var(--line-height-body);
        animation: slideUp var(--duration-normal) var(--ease-apple);
      }
      
      .chat-message.user {
        background: var(--color-accent-blue);
        color: #ffffff;
        margin-left: auto;
        max-width: 80%;
      }
      
      .chat-message:not(.user) {
        background: var(--color-background);
        color: var(--color-label-primary);
        border: 1px solid var(--color-separator);
        max-width: 90%;
      }
      
      /* Suggested Questions - Elegant Chips */
      .chat-suggested-questions {
        margin-bottom: var(--space-8);
      }
      
      .chat-suggested-questions p {
        font-size: var(--font-size-caption1);
        color: var(--color-label-tertiary);
        margin-bottom: var(--space-3);
        font-weight: 600;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        text-align: center;
      }
      
      .chat-suggestions {
        display: flex;
        flex-direction: column;
        gap: var(--space-2);
      }
      
      .chat-suggestion-btn {
        background: linear-gradient(135deg, 
          rgba(0, 122, 255, 0.05), 
          rgba(212, 165, 116, 0.05));
        border: 1.5px solid var(--color-separator);
        border-radius: 20px;
        padding: 10px 16px;
        font-size: var(--font-size-subheadline);
        line-height: 1.4;
        color: var(--color-accent-blue);
        cursor: pointer;
        transition: all var(--duration-fast) var(--ease-apple);
        text-align: center;
        position: relative;
        overflow: hidden;
        width: 100%;
        white-space: normal;
        word-wrap: break-word;
      }
      
      .chat-suggestion-btn::before {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(135deg, 
          rgba(0, 122, 255, 0.1), 
          rgba(212, 165, 116, 0.1));
        opacity: 0;
        transition: opacity var(--duration-fast) var(--ease-apple);
      }
      
      .chat-suggestion-btn:hover {
        border-color: var(--color-accent-blue);
        transform: translateY(-1px);
        box-shadow: 0 2px 8px rgba(0, 122, 255, 0.15);
      }
      
      .chat-suggestion-btn:hover::before {
        opacity: 1;
      }
      
      .chat-suggestion-btn:active {
        transform: translateY(0);
        box-shadow: none;
      }
      
      @media (max-width: 733px) {
        .chat-suggestion-btn {
          font-size: var(--font-size-callout);
        }
      }
      
      /* Chat Loading */
      .chat-loading {
        display: none;
        text-align: center;
        padding: var(--space-6);
        font-size: var(--font-size-subheadline);
        color: var(--color-label-secondary);
        font-style: italic;
      }
      
      .chat-loading.active {
        display: block;
        animation: fadeIn var(--duration-normal) var(--ease-apple);
      }
      
      /* Chat Input Area */
      .chat-input-area {
        margin-top: var(--space-8);
      }
      
      .chat-input-wrapper {
        display: flex;
        gap: var(--space-3);
        align-items: flex-end;
      }
      
      .chat-input {
        flex: 1;
        min-height: 56px;
        max-height: 120px;
        padding: 16px;
        font-family: inherit;
        font-size: var(--font-size-body);
        line-height: var(--line-height-body);
        color: var(--color-label-primary);
        background: var(--color-background);
        border: 1.5px solid var(--color-separator);
        border-radius: var(--radius-large);
        resize: none;
        transition: all var(--duration-fast) var(--ease-apple);
      }
      
      .chat-input:focus {
        outline: none;
        border-color: var(--color-accent-blue);
        box-shadow: 0 0 0 4px rgba(0, 122, 255, 0.1);
      }
      
      .chat-input::placeholder {
        color: var(--color-label-tertiary);
      }
      
      .chat-send-btn {
        min-width: 80px;
        height: 56px;
        padding: 0 24px;
        background: var(--color-accent-blue);
        color: #ffffff;
        border: none;
        border-radius: var(--radius-large);
        font-size: var(--font-size-body);
        font-weight: 600;
        cursor: pointer;
        transition: all var(--duration-fast) var(--ease-apple);
        flex-shrink: 0;
      }
      
      .chat-send-btn:hover {
        background: #0051d5;
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(0, 122, 255, 0.3);
      }
      
      .chat-send-btn:active {
        transform: translateY(0);
        box-shadow: none;
      }
      
      .chat-send-btn:disabled {
        background: var(--color-separator);
        color: var(--color-label-tertiary);
        cursor: not-allowed;
        transform: none;
        box-shadow: none;
      }
      
      @media (max-width: 733px) {
        .chat-container {
          border-radius: 0;
          padding: var(--space-8);
        }
        
        .chat-input-wrapper {
          flex-direction: column;
          gap: var(--space-3);
        }
        
        .chat-send-btn {
          width: 100%;
        }
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
         MODAL OVERLAY & CHAT MODAL - iMessage Style UX
         ============================================ */
      .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.4);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        opacity: 0;
        visibility: hidden;
        transition: opacity 0.3s var(--ease-apple), visibility 0.3s;
        z-index: 9998;
      }

      .modal-overlay.active {
        opacity: 1;
        visibility: visible;
      }

      /* Chat Modal - Narrow & Focused like iOS Messages */
      .chat-modal {
        position: fixed;
        top: 0;
        right: 0;
        width: 420px;
        max-width: 100%;
        height: 100%;
        background: var(--color-background);
        box-shadow: -4px 0 24px rgba(0, 0, 0, 0.15);
        transform: translateX(100%);
        transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        z-index: 9999;
        display: flex;
        flex-direction: column;
        overflow: hidden;
      }

      .chat-modal.active {
        transform: translateX(0);
      }

      /* Modal Header - Avatar-Centric Design */
      .modal-header {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: var(--space-8) var(--space-6) var(--space-6);
        border-bottom: 1px solid var(--color-separator);
        background: var(--color-background);
        position: relative;
      }

      .modal-close {
        position: absolute;
        top: var(--space-4);
        right: var(--space-4);
        width: 30px;
        height: 30px;
        border-radius: 50%;
        background: var(--color-background-secondary);
        border: none;
        color: var(--color-label-secondary);
        font-size: 20px;
        line-height: 1;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all var(--duration-fast) var(--ease-apple);
        font-weight: 300;
      }

      .modal-close:hover {
        background: var(--color-separator-opaque);
        color: var(--color-label-primary);
        transform: scale(1.1);
      }

      .modal-close:active {
        transform: scale(0.9);
      }

      /* Avatar - Warm & Inviting */
      .modal-avatar {
        width: 64px;
        height: 64px;
        border-radius: 50%;
        background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 32px;
        margin-bottom: var(--space-3);
        box-shadow: 0 4px 16px rgba(255, 215, 0, 0.35);
        animation: scaleIn 0.6s var(--ease-apple);
      }

      .modal-title {
        font-size: var(--font-size-title3);
        font-weight: var(--font-weight-title3);
        line-height: var(--line-height-title3);
        letter-spacing: var(--letter-spacing-title3);
        color: var(--color-label-primary);
        margin: 0 0 var(--space-1) 0;
        text-align: center;
      }

      .modal-subtitle {
        font-size: var(--font-size-footnote);
        line-height: var(--line-height-footnote);
        color: var(--color-label-secondary);
        text-align: center;
        margin: 0;
      }

      .modal-content {
        flex: 1;
        overflow-y: auto;
        padding: var(--space-6);
        background: var(--color-background-secondary);
      }

      @media (max-width: 768px) {
        .chat-modal {
          width: 100%;
        }
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

      /* ============================================
         FLOATING CHAT BUTTON (FAB)
         ============================================ */
      .chat-fab {
        position: fixed;
        bottom: 32px;
        right: 32px;
        width: 68px;
        height: 68px;
        background: linear-gradient(135deg, #007aff 0%, #4da6ff 100%);
        border-radius: 50%;
        border: none;
        box-shadow: 0 8px 28px rgba(0, 122, 255, 0.35),
                    0 4px 12px rgba(0, 0, 0, 0.15);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 32px;
        color: #ffffff;
        z-index: 1000;
        transition: all var(--duration-normal) var(--ease-apple);
        animation: fabPulse 3s ease-in-out infinite;
      }

      .chat-fab:hover {
        transform: scale(1.08) rotate(5deg);
        box-shadow: 0 12px 36px rgba(0, 122, 255, 0.45),
                    0 6px 16px rgba(0, 0, 0, 0.2);
      }

      .chat-fab:active {
        transform: scale(0.92);
      }

      .chat-fab.hidden {
        transform: scale(0);
        opacity: 0;
        pointer-events: none;
      }

      @keyframes fabPulse {
        0%, 100% {
          box-shadow: 0 8px 28px rgba(0, 122, 255, 0.35),
                      0 4px 12px rgba(0, 0, 0, 0.15);
        }
        50% {
          box-shadow: 0 12px 36px rgba(0, 122, 255, 0.5),
                      0 6px 16px rgba(0, 0, 0, 0.2);
        }
      }
      
      @media (max-width: 733px) {
        .chat-fab {
          bottom: 20px;
          right: 20px;
          width: 60px;
          height: 60px;
          font-size: 28px;
        }
      }

      .chat-fab-badge {
        position: absolute;
        top: -4px;
        right: -4px;
        width: 24px;
        height: 24px;
        background: #ff3b30;
        border-radius: 50%;
        border: 3px solid var(--color-background);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        font-weight: 700;
        color: #ffffff;
        animation: badgePulse 1.5s ease-in-out infinite;
      }

      @keyframes badgePulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.1); }
      }

      /* FAB Ripple Effect */
      .fab-ripple {
        position: absolute;
        width: 100%;
        height: 100%;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.6);
        transform: scale(0);
        opacity: 0;
        pointer-events: none;
      }

      .chat-fab:active .fab-ripple {
        animation: ripple 0.6s ease-out;
      }

      @keyframes ripple {
        to {
          transform: scale(2.5);
          opacity: 0;
        }
      }

      /* FAB Icon */
      .fab-icon {
        position: relative;
        z-index: 1;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      /* FAB Tooltip */
      .fab-tooltip {
        position: absolute;
        right: 76px;
        background: rgba(0, 0, 0, 0.9);
        color: #ffffff;
        padding: 8px 12px;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 500;
        white-space: nowrap;
        opacity: 0;
        pointer-events: none;
        transform: translateX(8px);
        transition: all 0.2s var(--ease-apple);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
      }

      .fab-tooltip::after {
        content: '';
        position: absolute;
        right: -6px;
        top: 50%;
        transform: translateY(-50%);
        width: 0;
        height: 0;
        border-left: 6px solid rgba(0, 0, 0, 0.9);
        border-top: 6px solid transparent;
        border-bottom: 6px solid transparent;
      }

      .chat-fab:hover .fab-tooltip,
      .chat-fab:focus .fab-tooltip {
        opacity: 1;
        transform: translateX(0);
      }

      /* Keyboard Focus */
      .chat-fab:focus {
        outline: 3px solid var(--color-accent-blue);
        outline-offset: 4px;
      }

      .chat-fab:focus:not(:focus-visible) {
        outline: none;
      }

      /* Initial fade-in animation */
      .chat-fab {
        animation: fabPulse 2s ease-in-out infinite, fabFadeIn 0.3s ease-out 0.3s backwards;
      }

      @keyframes fabFadeIn {
        from {
          opacity: 0;
          transform: scale(0.8) translateY(20px);
        }
        to {
          opacity: 1;
          transform: scale(1) translateY(0);
        }
      }

      /* ============================================
         SLIDE-IN CHAT PANEL
         ============================================ */
      .chat-panel {
        position: fixed;
        top: 0;
        right: 0;
        width: 100%;
        height: 100%;
        background: var(--color-background);
        box-shadow: -4px 0 24px rgba(0, 0, 0, 0.15);
        z-index: 1001;
        transform: translateX(100%);
        transition: transform 0.4s var(--ease-apple);
        display: flex;
        flex-direction: column;
      }

      @media (min-width: 768px) {
        .chat-panel {
          width: 440px;
        }
      }

      .chat-panel.open {
        transform: translateX(0);
      }

      .chat-panel-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.4);
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
        z-index: 1000;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.4s var(--ease-apple);
      }

      .chat-panel-overlay.visible {
        opacity: 1;
        pointer-events: auto;
      }

      .chat-header {
        background: linear-gradient(135deg, var(--color-accent-blue), var(--color-accent-gold));
        padding: var(--space-5);
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-shrink: 0;
      }

      .chat-header-content {
        display: flex;
        align-items: center;
        gap: var(--space-4);
      }

      .chat-header-avatar {
        width: 44px;
        height: 44px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.2);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24px;
      }

      .chat-header-text h3 {
        color: #ffffff;
        font-size: var(--font-size-title3);
        font-weight: var(--font-weight-title3);
        margin: 0;
      }

      .chat-header-text p {
        color: rgba(255, 255, 255, 0.8);
        font-size: var(--font-size-caption1);
        margin: 4px 0 0 0;
      }

      .chat-close-btn {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.15);
        backdrop-filter: blur(10px);
        border: none;
        color: #ffffff;
        font-size: 20px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all var(--duration-normal) var(--ease-apple);
      }

      .chat-close-btn:hover {
        background: rgba(255, 255, 255, 0.25);
        transform: scale(1.1);
      }

      .chat-close-btn:active {
        transform: scale(0.9);
      }

      /* ============================================
         CHAT MESSAGES - iMessage Style Bubbles
         ============================================ */
      .chat-modal .chat-messages {
        padding: var(--space-6);
        flex: 1;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: var(--space-2);
        scroll-behavior: smooth;
        background: var(--color-background-secondary);
      }

      /* Elegant Scrollbar */
      .chat-messages::-webkit-scrollbar {
        width: 6px;
      }

      .chat-messages::-webkit-scrollbar-track {
        background: transparent;
      }

      .chat-messages::-webkit-scrollbar-thumb {
        background: var(--color-separator);
        border-radius: 3px;
      }

      .chat-messages::-webkit-scrollbar-thumb:hover {
        background: var(--color-label-tertiary);
      }

      /* Message Container */
      .chat-message {
        display: flex;
        gap: var(--space-2);
        align-items: flex-end;
        animation: slideUp var(--duration-normal) var(--ease-apple);
        margin-bottom: var(--space-3);
      }

      .chat-message.user {
        flex-direction: row-reverse;
      }

      /* Avatar - Warm & Personal */
      .chat-avatar {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background: linear-gradient(135deg, #FFD700, #FFA500);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: var(--font-size-subheadline);
        font-weight: 600;
        color: #ffffff;
        flex-shrink: 0;
        box-shadow: 0 2px 8px rgba(255, 215, 0, 0.25);
      }

      .chat-message.user .chat-avatar {
        background: linear-gradient(135deg, var(--color-accent-blue), #4da6ff);
        box-shadow: 0 2px 8px rgba(0, 122, 255, 0.25);
      }

      /* Chat Bubble - iMessage Style */
      .chat-bubble {
        padding: 10px 14px;
        max-width: 75%;
        word-wrap: break-word;
        position: relative;
        display: inline-block;
      }

      /* Future (left side) - Light Gray Bubble */
      .chat-message:not(.user) .chat-bubble {
        background: var(--color-background-secondary);
        color: var(--color-label-primary);
        border-radius: 18px 18px 18px 4px;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
      }

      /* User (right side) - Blue Bubble */
      .chat-message.user .chat-bubble {
        background: var(--color-accent-blue);
        color: #ffffff;
        border-radius: 18px 18px 4px 18px;
        box-shadow: 0 1px 3px rgba(0, 122, 255, 0.3);
      }

      .chat-bubble p {
        margin: 0;
        font-size: var(--font-size-body);
        line-height: var(--line-height-body);
        letter-spacing: var(--letter-spacing-body);
      }

      /* Timestamp - Subtle & Elegant */
      .chat-timestamp {
        font-size: var(--font-size-caption2);
        line-height: var(--line-height-caption2);
        color: var(--color-label-tertiary);
        margin-top: var(--space-1);
        align-self: flex-start;
      }

      .chat-message.user .chat-timestamp {
        align-self: flex-end;
      }

      /* ============================================
         SUGGESTED QUESTIONS - Inviting Chips
         ============================================ */
      .chat-suggested-questions {
        padding: var(--space-6);
        background: var(--color-background);
        border-top: 1px solid var(--color-separator);
        flex-shrink: 0;
      }

      .chat-suggested-questions p {
        font-size: var(--font-size-caption1);
        font-weight: 600;
        letter-spacing: 0.05em;
        text-transform: uppercase;
        color: var(--color-label-tertiary);
        margin: 0 0 var(--space-3) 0;
        text-align: center;
      }

      .chat-suggestions {
        display: flex;
        flex-direction: column;
        gap: var(--space-2);
      }

      .chat-suggestion-btn {
        background: linear-gradient(135deg, 
          rgba(0, 122, 255, 0.05), 
          rgba(212, 165, 116, 0.05));
        border: 1.5px solid var(--color-separator);
        border-radius: 20px;
        padding: 10px 16px;
        font-size: var(--font-size-subheadline);
        line-height: 1.4;
        color: var(--color-accent-blue);
        cursor: pointer;
        transition: all var(--duration-fast) var(--ease-apple);
        text-align: center;
        position: relative;
        overflow: hidden;
        width: 100%;
        white-space: normal;
        word-wrap: break-word;
      }

      .chat-suggestion-btn::before {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(135deg, 
          rgba(0, 122, 255, 0.1), 
          rgba(212, 165, 116, 0.1));
        opacity: 0;
        transition: opacity var(--duration-fast) var(--ease-apple);
      }

      .chat-suggestion-btn:hover {
        border-color: var(--color-accent-blue);
        transform: translateY(-1px);
        box-shadow: 0 2px 8px rgba(0, 122, 255, 0.15);
      }

      .chat-suggestion-btn:hover::before {
        opacity: 1;
      }

      .chat-suggestion-btn:active {
        transform: translateY(0);
        box-shadow: none;
      }

      /* ============================================
         CHAT INPUT AREA - iOS Messages Style
         ============================================ */
      .chat-input-area {
        padding: var(--space-4) var(--space-6) var(--space-6);
        background: var(--color-background);
        border-top: 1px solid var(--color-separator);
        flex-shrink: 0;
      }

      .chat-input-wrapper {
        display: flex;
        align-items: flex-end;
        gap: var(--space-2);
        background: var(--color-background-secondary);
        border-radius: 22px;
        padding: 8px 8px 8px 18px;
        border: 1px solid var(--color-separator);
        transition: all var(--duration-fast) var(--ease-apple);
      }

      .chat-input-wrapper:focus-within {
        border-color: var(--color-accent-blue);
        background: var(--color-background);
        box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.1);
      }

      .chat-input {
        flex: 1;
        padding: 6px 4px 6px 0;
        font-size: var(--font-size-body);
        line-height: var(--line-height-body);
        font-family: inherit;
        background: transparent;
        border: none;
        color: var(--color-label-primary);
        resize: none;
        min-height: 32px;
        max-height: 120px;
        outline: none;
        overflow-y: auto;
      }

      .chat-input::placeholder {
        color: var(--color-label-tertiary);
      }

      /* Send Button - iOS Style Circle Icon */
      .chat-send-btn {
        width: 32px;
        height: 32px;
        background: var(--color-accent-blue);
        color: #ffffff;
        border: none;
        border-radius: 50%;
        padding: 0;
        font-size: 18px;
        font-weight: 700;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all var(--duration-fast) var(--ease-apple);
        flex-shrink: 0;
        box-shadow: 0 2px 8px rgba(0, 122, 255, 0.3);
      }

      .chat-send-btn::before {
        content: '↑';
        display: block;
        line-height: 1;
      }

      .chat-send-btn:hover:not(:disabled) {
        transform: scale(1.08);
        box-shadow: 0 3px 12px rgba(0, 122, 255, 0.4);
      }

      .chat-send-btn:active:not(:disabled) {
        transform: scale(0.95);
      }

      .chat-send-btn:disabled {
        background: var(--color-separator-opaque);
        color: var(--color-label-tertiary);
        box-shadow: none;
        cursor: not-allowed;
        transform: none;
      }

      /* Chat Loading - Typing Indicator */
      .chat-loading {
        display: none;
        padding: var(--space-4) var(--space-6);
        animation: fadeIn var(--duration-normal) var(--ease-apple);
      }

      .chat-loading.active {
        display: flex;
        align-items: flex-end;
        gap: var(--space-2);
      }

      .typing-indicator {
        background: var(--color-background-secondary);
        border-radius: 18px 18px 18px 4px;
        padding: 12px 16px;
        display: flex;
        gap: 4px;
        align-items: center;
      }

      .typing-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: var(--color-label-tertiary);
        animation: typingDot 1.4s infinite;
      }

      .typing-dot:nth-child(2) {
        animation-delay: 0.2s;
      }

      .typing-dot:nth-child(3) {
        animation-delay: 0.4s;
      }

      @keyframes typingDot {
        0%, 60%, 100% {
          opacity: 0.3;
          transform: scale(0.8);
        }
        30% {
          opacity: 1;
          transform: scale(1);
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
         CHAT SECTION
         ============================================ -->

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
         MODAL OVERLAY
         ============================================ -->
    <div class="modal-overlay" id="modalOverlay"></div>

    <!-- ============================================
         CHAT MODAL - iMessage Style
         ============================================ -->
    <div class="chat-modal" id="chatModal">
      <div class="modal-header">
        <button class="modal-close" id="modalClose" aria-label="閉じる">×</button>
        <div class="modal-avatar">💛</div>
        <h2 class="modal-title">未来の自分と対話する</h2>
        <p class="modal-subtitle">あなたの3年後の姿と話せます</p>
      </div>
      <div class="modal-content">
        <div class="chat-container">
          <div class="chat-messages" id="chatMessages">
            <!-- チャット履歴がここに表示される -->
          </div>

          <div class="chat-suggested-questions">
            <p>よく聞かれる質問:</p>
            <div class="chat-suggestions" id="chatSuggestions">
              <button class="chat-suggestion-btn" data-question="今日から始められることは何ですか？">今日から始められることは何ですか？</button>
              <button class="chat-suggestion-btn" data-question="一番大変だったことは何ですか？">一番大変だったことは何ですか？</button>
              <button class="chat-suggestion-btn" data-question="3年間で一番変わったことは何ですか？">3年間で一番変わったことは何ですか？</button>
              <button class="chat-suggestion-btn" data-question="今の私に一番伝えたいことは？">今の私に一番伝えたいことは？</button>
            </div>
          </div>

          <div class="chat-loading" id="chatLoading">
            <div class="chat-avatar">💛</div>
            <div class="typing-indicator">
              <div class="typing-dot"></div>
              <div class="typing-dot"></div>
              <div class="typing-dot"></div>
            </div>
          </div>

          <div class="chat-input-area">
            <div class="chat-input-wrapper">
              <textarea
                class="chat-input"
                id="chatInput"
                placeholder="メッセージを入力..."
                rows="1"
              ></textarea>
              <button class="chat-send-btn" id="chatSendBtn" aria-label="送信"></button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ============================================
         FLOATING ACTION BUTTON (FAB)
         ============================================ -->
    <button id="chatFab" class="chat-fab" aria-label="未来の自分と話す" tabindex="0">
      <span class="fab-icon">💬</span>
      <span class="fab-ripple"></span>
      <span class="fab-tooltip">未来の自分と話す</span>
    </button>

    <!-- ============================================
         JAVASCRIPT - Scroll Animations & Chat
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

      // ============================================
      // CHAT FUNCTIONALITY
      // ============================================
      const RECORD_ID = '${safeRecordId}';
      const chatMessages = document.getElementById('chatMessages');
      const chatInput = document.getElementById('chatInput');
      const chatSendBtn = document.getElementById('chatSendBtn');
      const chatLoading = document.getElementById('chatLoading');
      const chatSuggestions = document.querySelectorAll('.chat-suggestion-btn');

      // メッセージを追加する関数
      function addMessage(content, isUser = false) {
        const messageContainer = document.createElement('div');
        messageContainer.style.display = 'flex';
        messageContainer.style.flexDirection = 'column';
        messageContainer.style.alignItems = isUser ? 'flex-end' : 'flex-start';
        messageContainer.style.marginBottom = 'var(--space-3)';

        const messageDiv = document.createElement('div');
        messageDiv.className = 'chat-message' + (isUser ? ' user' : '');

        const avatar = document.createElement('div');
        avatar.className = 'chat-avatar';
        avatar.textContent = isUser ? '👤' : '💛';

        const bubble = document.createElement('div');
        bubble.className = 'chat-bubble';

        const p = document.createElement('p');
        p.textContent = content;
        bubble.appendChild(p);

        messageDiv.appendChild(avatar);
        messageDiv.appendChild(bubble);

        // タイムスタンプを追加
        const timestamp = document.createElement('div');
        timestamp.className = 'chat-timestamp';
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        timestamp.textContent = \`\${hours}:\${minutes}\`;
        timestamp.style.marginLeft = isUser ? '0' : '40px';
        timestamp.style.marginRight = isUser ? '40px' : '0';

        messageContainer.appendChild(messageDiv);
        messageContainer.appendChild(timestamp);

        chatMessages.appendChild(messageContainer);
        chatMessages.scrollTop = chatMessages.scrollHeight;
      }

      // メッセージ送信関数
      async function sendMessage(message) {
        if (!message.trim()) return;

        // ユーザーのメッセージを表示
        addMessage(message, true);
        chatInput.value = '';
        chatInput.disabled = true;
        chatSendBtn.disabled = true;
        chatLoading.classList.add('active');

        try {
          const response = await fetch(\`/api/chat/\${RECORD_ID}\`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message }),
          });

          if (!response.ok) {
            throw new Error(\`HTTP error! status: \${response.status}\`);
          }

          const data = await response.json();

          if (data.success && data.reply) {
            // AIの返信を表示
            addMessage(data.reply, false);
          } else {
            throw new Error('返信の生成に失敗しました');
          }
        } catch (error) {
          console.error('Chat error:', error);
          addMessage('エラーが発生しました。もう一度お試しください。', false);
        } finally {
          chatInput.disabled = false;
          chatSendBtn.disabled = false;
          chatLoading.classList.remove('active');
          chatInput.focus();
        }
      }

      // 送信ボタンのイベントリスナー
      chatSendBtn.addEventListener('click', () => {
        sendMessage(chatInput.value);
      });

      // Enterキーで送信（Shift+Enterで改行）
      chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          sendMessage(chatInput.value);
        }
      });

      // 自動リサイズ
      chatInput.addEventListener('input', () => {
        chatInput.style.height = 'auto';
        chatInput.style.height = Math.min(chatInput.scrollHeight, 120) + 'px';
      });

      // 提案された質問のクリックイベント
      chatSuggestions.forEach(btn => {
        btn.addEventListener('click', () => {
          const question = btn.dataset.question;
          chatInput.value = question;
          sendMessage(question);
        });
      });

      // MODAL FUNCTIONALITY
      const chatFab = document.getElementById('chatFab');
      const modalOverlay = document.getElementById('modalOverlay');
      const chatModal = document.getElementById('chatModal');
      const modalClose = document.getElementById('modalClose');

      // モーダルを開く関数
      function openModal() {
        modalOverlay.classList.add('active');
        chatModal.classList.add('active');
        // フォーカスを入力欄に移す
        setTimeout(() => {
          chatInput.focus();
        }, 400);
        // スクロールを無効化
        document.body.style.overflow = 'hidden';
      }

      // モーダルを閉じる関数
      function closeModal() {
        modalOverlay.classList.remove('active');
        chatModal.classList.remove('active');
        // スクロールを有効化
        document.body.style.overflow = '';
      }

      // FABクリック
      if (chatFab) {
        chatFab.addEventListener('click', openModal);

        // キーボードイベント（Enter/Spaceキー）
        chatFab.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            openModal();
          }
        });
      }

      // 閉じるボタンクリック
      if (modalClose) {
        modalClose.addEventListener('click', closeModal);
      }

      // オーバーレイクリック
      if (modalOverlay) {
        modalOverlay.addEventListener('click', closeModal);
      }

      // ESCキーで閉じる
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && chatModal.classList.contains('active')) {
          closeModal();
        }
      });
    </script>

  </body>
</html>`;
}
