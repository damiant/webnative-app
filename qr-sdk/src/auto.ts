/**
 * Auto-init entry point for plain <script> tag usage.
 *
 * Options can be set via data attributes on the script tag:
 *   data-primary-color  — FAB background colour
 *   data-external-url   — Override URL encoded in the QR code
 *   data-label          — Label shown below the QR code
 *
 * Example:
 *   <script
 *     src="https://unpkg.com/webnative-qr/dist/webnative-qr.min.js"
 *     data-primary-color="#6200EE"
 *   ></script>
 */
import { init, WebnativeQROptions } from './index';

// Capture script element reference immediately (document.currentScript is only
// non-null during synchronous script evaluation, not inside callbacks).
const scriptEl = document.currentScript as HTMLScriptElement | null;

const options: WebnativeQROptions = {};
if (scriptEl) {
  if (scriptEl.dataset.primaryColor) options.primaryColor = scriptEl.dataset.primaryColor;
  if (scriptEl.dataset.externalUrl) options.externalUrl = scriptEl.dataset.externalUrl;
  if (scriptEl.dataset.label) options.label = scriptEl.dataset.label;
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => init(options));
} else {
  init(options);
}
