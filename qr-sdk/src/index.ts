import * as QRCode from 'qrcode';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface NamedURL {
  title: string | undefined;
  url: string;
}

export interface WebnativeQROptions {
  /** Override the URL encoded in the QR code. */
  externalUrl?: string;
  /** FAB background colour. Defaults to #1976D2. */
  primaryColor?: string;
  /** Label rendered below the QR code. */
  label?: string;
}

// ---------------------------------------------------------------------------
// URL helpers
// ---------------------------------------------------------------------------

/**
 * Adapted from nexusURL – transforms a URL for use in the Webnative App.
 * Always produces the https://webnative.app/{encodedUrl} format because the
 * QR code is intended to be scanned and opened by the Webnative App.
 */
export function nexusURL(url: string, externalUrl?: string): NamedURL {
  if (externalUrl) {
    url = externalUrl;
  }
  const shortUrl = url ? url.replace('https://', '').replace('http://', '') : undefined;
  return {
    title: shortUrl,
    url: `https://webnative.app/` + encodeURIComponent(shortUrl ?? ''),
  };
}

function buildQRUrl(options: WebnativeQROptions): string {
  if (options.externalUrl) {
    return options.externalUrl;
  }
  const inIframe = window.self !== window.top;
  if (inIframe && document.referrer) {
    return document.referrer;
  }
  return window.location.href;
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const STYLES = `
#webnative-qr-fab {
  all: unset;
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 3px 6px rgba(0,0,0,0.20), 0 3px 6px rgba(0,0,0,0.26);
  z-index: 2147483647;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  transition: box-shadow 0.25s ease, transform 0.2s ease;
}
#webnative-qr-fab:hover {
  box-shadow: 0 8px 20px rgba(0,0,0,0.24), 0 6px 10px rgba(0,0,0,0.18);
  transform: scale(1.06);
}
#webnative-qr-fab:active {
  transform: scale(0.96);
}
#webnative-qr-fab:focus-visible {
  outline: 3px solid rgba(25,118,210,0.45);
  outline-offset: 3px;
}
#webnative-qr-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.55);
  z-index: 2147483646;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: _wqr-fade 0.18s ease;
}
@keyframes _wqr-fade {
  from { opacity: 0; }
  to   { opacity: 1; }
}
#webnative-qr-card {
  position: relative;
  background: #ffffff;
  border-radius: 16px;
  padding: 32px 32px 24px;
  text-align: center;
  box-shadow: 0 24px 64px rgba(0,0,0,0.30);
  max-width: 320px;
  width: 90vw;
  animation: _wqr-up 0.22s ease;
}
@keyframes _wqr-up {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0);    }
}
#webnative-qr-close {
  all: unset;
  position: absolute;
  top: 10px;
  right: 10px;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #888;
  box-sizing: border-box;
  transition: background 0.15s, color 0.15s;
}
#webnative-qr-close:hover {
  background: rgba(0,0,0,0.07);
  color: #333;
}
#webnative-qr-close:focus-visible {
  outline: 2px solid rgba(25,118,210,0.55);
  outline-offset: 2px;
}
#webnative-qr-canvas {
  display: block;
  margin: 0 auto;
  border-radius: 8px;
}
#webnative-qr-label {
  margin: 16px 0 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: #555;
  line-height: 1.5;
}
`;

// ---------------------------------------------------------------------------
// SVG icons
// ---------------------------------------------------------------------------

const QR_ICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" height="26" viewBox="0 0 24 24" width="26" fill="white" aria-hidden="true" focusable="false">
  <path d="M0 0h24v24H0z" fill="none"/>
  <path d="M3 11h8V3H3v8zm2-6h4v4H5V5zM3 21h8v-8H3v8zm2-6h4v4H5v-4zm8-12v8h8V3h-8zm6 6h-4V5h4v4zm-5.99 10h2v2h-2zm0-4h2v2h-2zm4 0h2v2h-2zm0 4h2v2h-2zm2-2h2v2h-2zm-4 0h2v2h-2zm2-2h2v2h-2zm0-2h2v2h-2z"/>
</svg>`;

const CLOSE_ICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" height="18" viewBox="0 0 24 24" width="18" fill="currentColor" aria-hidden="true" focusable="false">
  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
</svg>`;

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Injects a floating QR code button into the bottom-right corner of the page.
 *
 * When clicked the button opens a modal displaying a QR code for the current
 * URL (with `webnative=qr` appended) transformed through `nexusURL` so it
 * opens in the Webnative App when scanned.
 *
 * @returns A cleanup function that removes all injected DOM nodes.
 */
export function init(options: WebnativeQROptions = {}): () => void {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return () => { /* noop in non-browser environments */ };
  }

  // Guard against double-initialisation
  if (document.getElementById('webnative-qr-fab')) {
    return () => { /* already initialised */ };
  }

  const primaryColor = options.primaryColor ?? '#1976D2';
  const label = options.label ?? 'Scan to display in the Webnative App';

  // ── Styles ──────────────────────────────────────────────────────────────
  const styleEl = document.createElement('style');
  styleEl.id = 'webnative-qr-styles';
  styleEl.textContent = STYLES + `\n#webnative-qr-fab { background-color: ${primaryColor}; }`;
  document.head.appendChild(styleEl);

  // ── FAB button ───────────────────────────────────────────────────────────
  const fab = document.createElement('button');
  fab.id = 'webnative-qr-fab';
  fab.setAttribute('aria-label', 'Show QR Code');
  fab.setAttribute('title', 'Show QR Code');
  fab.innerHTML = QR_ICON_SVG;
  document.body.appendChild(fab);

  // ── Modal backdrop ───────────────────────────────────────────────────────
  const backdrop = document.createElement('div');
  backdrop.id = 'webnative-qr-backdrop';
  backdrop.style.display = 'none';
  backdrop.setAttribute('role', 'dialog');
  backdrop.setAttribute('aria-modal', 'true');
  backdrop.setAttribute('aria-label', label);

  const card = document.createElement('div');
  card.id = 'webnative-qr-card';

  const closeBtn = document.createElement('button');
  closeBtn.id = 'webnative-qr-close';
  closeBtn.setAttribute('aria-label', 'Close');
  closeBtn.innerHTML = CLOSE_ICON_SVG;

  const canvas = document.createElement('canvas');
  canvas.id = 'webnative-qr-canvas';

  const labelEl = document.createElement('p');
  labelEl.id = 'webnative-qr-label';
  labelEl.textContent = label;

  card.appendChild(closeBtn);
  card.appendChild(canvas);
  card.appendChild(labelEl);
  backdrop.appendChild(card);
  document.body.appendChild(backdrop);

  // ── Event handlers ───────────────────────────────────────────────────────
  function open(): void {
    const qrUrl = buildQRUrl(options);
    QRCode.toCanvas(canvas, qrUrl, {
      width: 240,
      margin: 2,
      color: { dark: '#000000', light: '#ffffff' },
    }).then(() => {
      backdrop.style.display = 'flex';
      closeBtn.focus();
    });
  }

  function close(): void {
    backdrop.style.display = 'none';
    fab.focus();
  }

  function onKeyDown(e: KeyboardEvent): void {
    if (e.key === 'Escape' && backdrop.style.display !== 'none') {
      close();
    }
  }

  fab.addEventListener('click', open);
  closeBtn.addEventListener('click', close);
  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) close();
  });
  document.addEventListener('keydown', onKeyDown);

  // ── Cleanup ───────────────────────────────────────────────────────────────
  return () => {
    fab.remove();
    backdrop.remove();
    styleEl.remove();
    document.removeEventListener('keydown', onKeyDown);
  };
}
