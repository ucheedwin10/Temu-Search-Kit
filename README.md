# Temu Search Kit

A smart search tool for finding quality items on e-commerce platforms such as Temu and Shein, using keyword combinations.

## What it does

Helps users search more intelligently on Temu by combining keywords, without relying on an LLM. Search behavior is deterministic, built as a structured search tool, since the problem didn't need generative AI to solve it well.

## Why no LLM

A deliberate choice. Latency, cost, and hallucination risk aren't worth it for structured search. Deterministic filtering does the job better and faster.

## How to use it

1. Type what you're shopping for (or tap a category).
2. Tap **Shop** to open that exact search on Temu, or copy the term and paste it into the Temu app.
3. Before you pay: read the composition tab, sort by most orders, read 1-star reviews, trust customer photos.
4. Size in CM, not letters. The sizing guide at the bottom of the page has the rules.

## Product video

`video/temu-search-kit.mp4` is a 35-second 1080x1920 (9:16) promo for TikTok, Reels, X and WhatsApp status. It ships with a silent audio track, so add music in your editor.

The video is code, not a timeline project. `video/compose.html` holds every scene as a function of time. Open it in a browser to preview (space pauses, arrow keys scrub). To re-export after editing:

```
node video/render.mjs                 # writes video/temu-search-kit.mp4
node video/render.mjs --stills 3,17   # PNG stills in video/stills/ for review
```

Rendering needs Playwright (Chromium), ffmpeg, and the Inter / Inter Display fonts installed locally.

## Results

20,000+ users in the first week of launch.

## Built by

[Uche Edwin](https://github.com/ucheedwin10)
