import express from "express";
import { XMLParser } from "fast-xml-parser";

const router = express.Router();

// In-memory cache: { data, timestamp }
let cache = { data: null, timestamp: 0 };
const CACHE_TTL = 15 * 60 * 1000; // 15 minutes

const UA =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

/**
 * Fetch with a timeout. Returns null on failure.
 */
async function safeFetch(url, timeoutMs = 6000) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
        const res = await fetch(url, {
            headers: { "User-Agent": UA },
            signal: controller.signal,
            redirect: "follow",
        });
        clearTimeout(timer);
        return res;
    } catch {
        clearTimeout(timer);
        return null;
    }
}

/**
 * Scrape og:image from an article page (reads only the first ~50KB).
 */
async function scrapeOgImage(articleUrl) {
    try {
        const res = await safeFetch(articleUrl, 5000);
        if (!res || !res.ok) return null;

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let html = "";
        let bytes = 0;

        while (bytes < 50000) {
            const { done, value } = await reader.read();
            if (done) break;
            html += decoder.decode(value, { stream: true });
            bytes += value.length;
            if (html.includes("</head>") || html.includes("</HEAD>")) break;
        }
        try { reader.cancel(); } catch { /* ok */ }

        const og =
            html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) ||
            html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);
        if (og?.[1]) return og[1];

        const tw =
            html.match(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i) ||
            html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image["']/i);
        return tw?.[1] || null;
    } catch {
        return null;
    }
}

/**
 * Fetch articles from MedicalXpress RSS (includes media:thumbnail).
 */
async function fetchMedicalXpress() {
    const rssUrl = "https://medicalxpress.com/rss-feed/";
    const res = await safeFetch(rssUrl, 8000);
    if (!res || !res.ok) return [];

    const xml = await res.text();
    const parser = new XMLParser({
        ignoreAttributes: false,
        attributeNamePrefix: "@_",
        // Preserve namespace-prefixed tags
        processEntities: false,
    });
    const parsed = parser.parse(xml);
    const items = parsed?.rss?.channel?.item;
    if (!items || !Array.isArray(items)) return [];

    return items.slice(0, 10).map((item) => {
        // Extract thumbnail from media:thumbnail
        let image = null;
        const thumb = item["media:thumbnail"];
        if (thumb) {
            image = typeof thumb === "string" ? thumb : thumb["@_url"] || null;
        }

        // Format date
        let date = "";
        if (item.pubDate) {
            try {
                date = new Date(item.pubDate).toLocaleDateString("en-US", {
                    month: "short", day: "numeric", year: "numeric",
                });
            } catch { date = ""; }
        }

        return {
            title: (item.title || "Health Update").trim(),
            source: "Medical Xpress",
            date,
            url: item.link || "#",
            image,
        };
    });
}

/**
 * Fetch articles from Google News Health RSS, then scrape og:image from each source.
 */
async function fetchGoogleNews() {
    const rssUrl =
        "https://news.google.com/rss/topics/CAAqIQgKIhtDQkFTRGdvSUwyMHZNR3QwTlRFU0FtVnVLQUFQAQ?hl=en-IN&gl=IN&ceid=IN:en";

    const res = await safeFetch(rssUrl, 8000);
    if (!res || !res.ok) return [];

    const xml = await res.text();
    const parser = new XMLParser({
        ignoreAttributes: false,
        attributeNamePrefix: "@_",
    });
    const parsed = parser.parse(xml);
    const items = parsed?.rss?.channel?.item;
    if (!items || !Array.isArray(items)) return [];

    const raw = items.slice(0, 10).map((item) => {
        let title = item.title || "Health Update";
        let source = "Google News";
        const dash = title.lastIndexOf(" - ");
        if (dash > 0) {
            source = title.substring(dash + 3).trim();
            title = title.substring(0, dash).trim();
        }

        let date = "";
        if (item.pubDate) {
            try {
                date = new Date(item.pubDate).toLocaleDateString("en-US", {
                    month: "short", day: "numeric", year: "numeric",
                });
            } catch { date = ""; }
        }

        return { title, source, date, url: item.link || "#", image: null };
    });

    // Scrape og:image from source articles in parallel
    const results = await Promise.allSettled(
        raw.map((a) => scrapeOgImage(a.url))
    );
    raw.forEach((a, i) => {
        const r = results[i];
        if (r.status === "fulfilled" && r.value) {
            // Skip generic Google News logos
            if (!r.value.includes("googleusercontent.com/J6_coF")) {
                a.image = r.value;
            }
        }
    });

    return raw;
}

/**
 * GET /api/news/trending
 * Combines MedicalXpress (with thumbnails) and Google News (scraped og:images).
 * Returns interleaved articles from both sources for variety.
 */
router.get("/trending", async (req, res) => {
    try {
        // Serve from cache if fresh
        if (cache.data && Date.now() - cache.timestamp < CACHE_TTL) {
            return res.json({ articles: cache.data });
        }

        // Fetch both sources in parallel
        const [mxArticles, gnArticles] = await Promise.all([
            fetchMedicalXpress().catch(() => []),
            fetchGoogleNews().catch(() => []),
        ]);

        // Interleave: prioritize MX (has images), then GN
        const articles = [];
        const maxLen = Math.max(mxArticles.length, gnArticles.length);

        for (let i = 0; i < maxLen && articles.length < 12; i++) {
            if (i < mxArticles.length) articles.push(mxArticles[i]);
            if (i < gnArticles.length) articles.push(gnArticles[i]);
        }

        // Update cache
        if (articles.length > 0) {
            cache = { data: articles, timestamp: Date.now() };
        }

        res.json({ articles });
    } catch (err) {
        console.error("News fetch error:", err.message);

        if (cache.data) {
            return res.json({ articles: cache.data, stale: true });
        }
        res.status(500).json({ error: "Failed to fetch trending news" });
    }
});

export default router;
