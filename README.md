# QR Studio — Professional QR Code Generator & Designer

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Built with React](https://img.shields.io/badge/React-19-61dafb.svg?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178c6.svg?logo=typescript)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-8.3-646cff.svg?logo=vite)](https://vite.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38bdf8.svg?logo=tailwind-css)](https://tailwindcss.com)

**QR Studio** is a high-end, production-grade QR code generator and visual designer web application built from scratch for modern productivity and developer workflows. It operates **100% client-side** in your browser with zero backend dependencies, zero databases, and zero tracking.

Live Repository: [https://github.com/trivedimilind1-ui/gdg-qr-code](https://github.com/trivedimilind1-ui/gdg-qr-code)

---

## 🚀 Key Features

### 1. Multi-Format QR Payloads
- **URL**: Generates standard website links with automatic protocol normalization (`https://`), real-time domain validation, and external preview tester.
- **Plain Text**: Supports full multiline UTF-8 text, Unicode characters, and emojis with live character counts.
- **Email**: Compliant RFC 6068 `mailto:` payload with recipient, optional subject, and message body with proper URI encoding.
- **Phone**: Standard RFC 3966 `tel:` links supporting international calling codes (`+1`, `+91`, `+44`, etc.).
- **Wi-Fi**: Standard `WIFI:T:...;S:...;P:...;H:...;;` format supporting WPA/WPA2, WEP, and Open networks, with hidden SSID flags and parameter character escaping.

### 2. Live Real-Time Rendering Engine
- **Instant Debounced Feedback**: QR preview renders automatically on every parameter change without requiring a manual "Generate" button.
- **Clear Preview vs Export Resolution**: The interactive live preview stays optimized at 512px for responsive performance, while PNG downloads are rendered at your exact selected resolution (128px – 1024px).
- **Zero Placeholder / Fake QRs**: The preview canvas renders the exact barcode data that is exported.
- **Interactive States**: Polished empty and error states guide user input before valid data is provided.

### 3. Deep Customization & Styling
- **Export Resolution**: Granular slider and numeric indicator from 128px up to 1024px (HD export).
- **Color Pickers & Hex Validation**: Integrated native color pickers with two-way synchronized HEX inputs and accessible inline validation (`#000000`, `#FFF`).
- **Error Correction**: Toggle between Low (L ~7%), Medium (M ~15%), Quartile (Q ~25%), and High (H ~30%) recovery levels.
- **Quiet Zone (Margin)**: Adjustable safe margins (0 to 6 blocks) to ensure camera separation from surroundings.
- **Center Logo Overlay**: Upload a custom icon/image from your device with automatic protective backing, scale control (10%–25%), client-side image downscaling for localStorage safety, and automatic High (H) error correction suggestion.

### 4. 1-Click Design Presets
Includes predefined visual themes that can be applied instantly and customized further:
- **Classic**: Universal `#000000` on `#FFFFFF` with balanced error correction.
- **Minimal**: Subtle dark zinc `#18181B` on pure white with generous quiet zone.
- **Midnight**: High-contrast ice `#F8FAFC` on deep navy `#0F172A` with High resilience.
- **Ocean**: Vibrant cobalt `#1D4ED8` on crisp white.
- **Forest**: Deep emerald `#047857` on fresh mint-white `#F0FDF4`.
- **Sunset**: Warm crimson `#BE123C` on delicate rose `#FFF1F2`.
- **Cyberpunk**: Bold amber gold `#FACC15` on obsidian `#18181B`.

### 5. Estimated Scan Readability Diagnostics
- **Relative Luminance Calculation**: Real-time evaluation using WCAG 2.1 linearized formulas ($L = 0.2126R + 0.7152G + 0.0722B$).
- **Color Contrast Gauge**: Categorizes contrast into *Strong*, *Acceptable*, or *Low* contrast with calculated numeric ratio.
- **Heuristic Quality Readout**: Calculates an overall readability score based on contrast, quiet zone, error correction level, and logo scale.
- **Proactive Warnings**: Non-intrusive advisories alert users to low contrast, small quiet zones, or logo obstruction risks before printing or distribution.
- *Note: This diagnostic evaluates optical code parameters as a heuristic and does not replace physical camera testing under real-world lighting, printing, and display conditions.*

### 6. Vector & Raster Exports
- **Download PNG**: Direct pixel-perfect canvas raster export at user's exact chosen resolution. Includes custom logo with protective backing.
- **Download SVG**: Clean, scalable vector graphic export for professional print design. Seamlessly embeds custom logos with vector protective backing matching the PNG export.
- **Copy to Clipboard**: Direct 1-click clipboard integration using modern browser `navigator.clipboard.write([ClipboardItem])` with toast confirmation.

### 7. Persistent Local History
- Stored safely in browser `localStorage` using a resilient `useLocalStorage` hook with quota error protection.
- Automatically saves valid QR codes with debouncing and fingerprint-based duplicate detection.
- Retains up to 20 recent configurations with titles, timestamps, and color swatches.
- **1-Click Reuse**: Instantly restores complete configuration (type, inputs, colors, margins, size, logo) back to the active editor.
- Individual deletion and "Clear All" with confirmation safeguard.

### 8. Modern SaaS UI & Accessibility
- **Theme Toggle**: Light and Dark mode with automatic detection of OS preference (`prefers-color-scheme`).
- **Responsive Layout**: Two-column layout on desktop; seamless touch-friendly stacked layout on tablets and mobile devices with zero horizontal overflow.
- **Accessible Design**: Semantic HTML5 elements, proper form labels, accessible color input validation, ARIA landmarks, visible focus rings, and high contrast.

---

## 🛠️ Tech Stack

- **Frontend Framework**: [React 19](https://react.dev) + [TypeScript](https://www.typescriptlang.org)
- **Build Tool**: [Vite 8](https://vite.dev)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com)
- **QR Generation Engine**: [qrcode](https://www.npmjs.com/package/qrcode)
- **Icons**: [Lucide React](https://lucide.dev)
- **Persistence**: HTML5 Web Storage (`localStorage`)

---

## 📂 Project Architecture

```
src/
├── types/
│   └── qr.ts                 # Type definitions for configs, payloads, presets, history
├── utils/
│   ├── qrPayload.ts          # RFC-compliant payload generators & titles
│   ├── validation.ts         # Field & color validation functions
│   ├── reliability.ts        # WCAG luminance, contrast ratio & scan score calculations
│   ├── download.ts           # PNG export, SVG generation, and clipboard copy
│   └── presets.ts            # Curated visual design presets
├── hooks/
│   ├── useLocalStorage.ts    # Resilient typed localStorage hook with window event sync
│   ├── useTheme.ts           # Dark/light theme manager with system preference detection
│   └── useQRCode.ts          # Real-time QR renderer with debouncing and canvas overlay
├── components/
│   ├── Header.tsx            # App branding, status badges, GitHub link, theme switcher
│   ├── QRTypeSelector.tsx    # Segmented tab bar with keyboard navigation
│   ├── forms/
│   │   ├── QRForm.tsx        # Unified form dispatcher
│   │   ├── URLForm.tsx       # URL input with live link tester
│   │   ├── TextForm.tsx      # Multiline plain text with counter
│   │   ├── EmailForm.tsx     # Email, Subject, and Body fields
│   │   ├── PhoneForm.tsx     # International phone input
│   │   └── WifiForm.tsx      # SSID, Password, Encryption, Hidden network
│   ├── CustomizationPanel.tsx# Resolution slider, color pickers, EC levels, quiet zone, logo
│   ├── PresetSelector.tsx    # Visual preset cards with 1-click apply
│   ├── QRPreview.tsx         # Live canvas view, draft state, actions, payload preview
│   ├── ReliabilityIndicator.tsx # Contrast meter and diagnostic scan score
│   ├── DownloadButtons.tsx   # PNG, SVG, and Clipboard buttons with feedback
│   ├── RecentQRs.tsx         # Saved history drawer with reuse and deletion
│   ├── ThemeToggle.tsx       # Light/Dark toggle button
│   └── Toast.tsx             # Floating notification system
├── App.tsx                   # Main application orchestrator
├── main.tsx                  # React DOM entrypoint
└── index.css                 # Global Tailwind CSS directives & custom scrollbars
```

---

## 💻 Getting Started Locally

### Prerequisites
- Node.js `18.0.0` or higher
- npm `9.0.0` or higher

### Installation

```bash
# Clone the repository
git clone https://github.com/trivedimilind1-ui/gdg-qr-code.git
cd gdg-qr-code

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📦 Production Build & Testing

```bash
# Type check and build optimized production bundle
npm run build

# Preview production build locally
npm run preview
```

The production output is generated in the `dist/` directory and is completely static.

---

## 🌐 Deployment (Vercel & Netlify)

This application has zero server-side requirements and requires no environment variables.

### Deploy to Vercel
1. Push your repository to GitHub.
2. Import the project into the [Vercel Dashboard](https://vercel.com/new).
3. Framework Preset: **Vite**.
4. Build Command: `npm run build`.
5. Output Directory: `dist`.
6. Click **Deploy**.

### Deploy to Netlify
1. Connect your repository in [Netlify](https://app.netlify.com).
2. Build command: `npm run build`.
3. Publish directory: `dist`.
4. Click **Deploy site**.

---

## 🔒 Privacy & Security

QR Studio respects user privacy:
- All QR encoding and image generation executes **entirely client-side** in your browser's JavaScript engine.
- Input data (passwords, phone numbers, emails, messages, URLs) is never transmitted to any third-party server or API.
- Saved QR history is stored exclusively in your local browser's `localStorage` and never leaves your machine.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
