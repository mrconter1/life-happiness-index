# Life Happiness Index

A metric that predicts how likely you are to be happy—defined as genuinely wanting to exist. All data is processed locally in your browser.

## Features

- **33 life satisfaction questions** across 12 categories
- **Z-score transformation** for statistical accuracy
- **Privacy-first**: no data leaves your browser (localStorage only)
- **Mobile-optimized** with smooth slider controls
- **Visual bell-curve** showing your position relative to population

## Scoring Method

### 1. Question Types
- Career, exercise, social life, health, finances, relationships, etc.
- Each rated 0-10 (where "5" = average)

### 2. Z-Score Transformation
```
z = (value - 5) / 2
percentile = Φ(z)  // Standard normal CDF
score = percentile × 10
```

**Why z-score?**
- Converts linear ratings to population percentiles
- "7/10" (above average) → ~84th percentile → score of 8.4
- "8/10" (well above) → ~93rd percentile → score of 9.3
- Reflects how distributions work in reality

### 3. Final Score
Simple arithmetic mean of all transformed scores (0-10 scale).

## Score Bands

| Score | Interpretation | Percentile |
|-------|----------------|------------|
| 0-4   | Below average  | ~15th      |
| 4-6   | Average        | ~50th      |
| 6-8   | Above average  | ~80th      |
| 8-10  | Exceptional    | ~95th      |

## Tech Stack

- **Next.js 15** (React 19, App Router)
- **TypeScript**
- **Tailwind CSS** + shadcn/ui
- **Chart.js** for visualization
- **Vercel Analytics**

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Privacy

All calculations happen in your browser. Data is saved to `localStorage` only—nothing is sent to any server.

## Open Source

Contributions welcome! View the code on [GitHub](https://github.com/mrconter1/life-happiness-index)

---

Built with ❤️ for understanding life satisfaction through data
