# Tokito Cycle Tracker

Tokito is a lightweight, privacy-first cycle tracking app that helps users log daily mood, energy, sleep, and symptoms while visualizing approximate menstrual cycle phases.

## Features

- Daily logging for mood, energy, and sleep
- Period tracking with active period start/end controls
- Calendar view with phase-based overlays
- Phase estimation across menstrual, follicular, ovulation, and luteal phases
- Custom cycle length and symptom tracking preferences
- Local-first data storage with no account required
- Built-in data clearing from Settings

## Tech Stack

- React
- Vite
- TypeScript
- Zustand
- Tailwind CSS
- shadcn/ui
- React Query
- Vitest

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### Install and run locally

```bash
git clone https://github.com/iKhanSaab/tokito-cycle-tracker.git
cd tokito-cycle-tracker
npm install
npm run dev
```

The app runs locally on `http://localhost:8080`.

## Available Scripts

```bash
npm run dev        # Start the local development server
npm run build      # Create a production build
npm run preview    # Preview the production build locally
npm run lint       # Run ESLint
npm run test       # Run Vitest once
```

## Testing

Tokito includes unit tests with Vitest.

```bash
npm run test
```

A basic GitHub Actions workflow is included to run tests on pushes and pull requests.

## Data & Privacy

- Tokito stores data locally in the browser using persisted client-side state.
- No account, backend, or cloud sync is required for the current version.
- Users can clear all saved data from the Settings screen.
- Because storage is local-only, uninstalling the browser profile or clearing site data may remove saved information.

## Medical Disclaimer

Tokito is not a medical device and does not provide medical advice, diagnosis, or treatment.

Cycle phase information in the app is an approximate estimate based on user-entered cycle data. It should not be used for contraception, fertility planning, diagnosis, or treatment decisions.

If you have severe symptoms, irregular cycles, or health concerns, please consult a qualified medical professional.

## Roadmap

- Optional reminders and notifications
- Backup and export options
- Improved cycle estimation logic
- Optional sync across devices

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests
5. Open a pull request

---

Built by iKhanSaab
