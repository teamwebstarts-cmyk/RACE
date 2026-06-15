# RACE Service — Mobile Application (React Native + TypeScript)

Expo customer app aligned with [team GitHub repo](https://github.com/teamwebstarts-cmyk/RACE/tree/master).

Built with **React Native**, **Expo**, and **TypeScript** — typed navigation, components, and service catalog models.

## Customer Home Screen Services

**A. Towing** — Instant, Scheduled, Emergency  
**B. Driver** — Part-Time, Full-Time, Outstation, Night  
**C. Roadside** — Flat Tyre, Battery Jump, Fuel, Minor Repairs  
**D. Future Services** — 8 upcoming services (marked Soon)

Each category and service includes a short description and RACE branding from [raceservice.in](https://raceservice.in).

## Run

```bash
cd "mobile application"
npm install
npm start
```

Scan QR with **Expo Go** on iPhone, or press `i` for simulator (needs Xcode).

## Structure

```
src/
├── types/          # Brand, Service, navigation param lists
├── data/           # brand.json, colors.json, services.json
├── assets/images/  # RACE logo + category icons
├── screens/        # Home, ServiceList, SelectService (.tsx)
├── components/     # Service cards, Hero, BrandLogo (.tsx)
├── navigation/     # Tabs + stack (.tsx)
└── theme/          # RACE colors (#FFC326, #232323)
```
