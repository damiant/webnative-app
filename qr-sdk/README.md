# webnative-qr

Inject a floating QR code button (FAB) into any web page. Clicking it shows a QR code for the current URL, pre-processed to open seamlessly inside the **Webnative App**.

## Installation

```bash
npm install webnative-qr
```

## Usage

### As an ES module (recommended)

```ts
import { init } from 'webnative-qr';

// Call once after the DOM is ready
init();
```

With options:

```ts
init({
  primaryColor: '#6200EE',   // FAB background colour
  externalUrl: 'https://my-canonical-url.com/page',  // override the encoded URL
  label: 'Scan to open in the app',                  // override the label text
});

// init() returns a cleanup function
const cleanup = init();
// later…
cleanup(); // removes the FAB and all injected styles
```

### As a `<script>` tag (CDN / no bundler)

```html
<script src="https://unpkg.com/webnative-qr/dist/webnative-qr.min.js"></script>
```

Options are passed via `data-*` attributes:

```html
<script
  src="https://unpkg.com/webnative-qr/dist/webnative-qr.min.js"
  data-primary-color="#6200EE"
  data-label="Scan to open in the app"
></script>
```

## How it works

1. A circular FAB button with a QR code icon is injected into the bottom-right corner of the page.
2. Clicking it opens a centred modal containing:
   - A QR code for the current URL
   - The label *"Scan to display in the Webnative App"*
3. The encoded URL is built as follows:
   - Start with `window.location.href`
   - Append `?webnative=qr` (or `&webnative=qr`)
   - Transform via `nexusURL` → `https://webnative.app/{encodedUrl}`
4. The modal closes when clicking the backdrop, the × button, or pressing `Escape`.

## API

### `init(options?): () => void`

Injects the FAB. Returns a cleanup function.

| Option | Type | Default | Description |
|---|---|---|---|
| `primaryColor` | `string` | `#1976D2` | FAB background colour |
| `externalUrl` | `string` | — | Replaces the current page URL in the QR code |
| `label` | `string` | `Scan to display in the Webnative App` | Label below the QR code |

### `nexusURL(url, externalUrl?): NamedURL`

Transforms a URL into a `https://webnative.app/{encodedUrl}` deep-link.

```ts
import { nexusURL } from 'webnative-qr';

const { title, url } = nexusURL('https://example.com/dashboard?webnative=qr');
// title → 'example.com/dashboard?webnative=qr'
// url   → 'https://webnative.app/example.com%2Fdashboard%3Fwebnative%3Dqr'
```

## License

MIT
