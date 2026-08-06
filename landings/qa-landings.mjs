import { chromium } from "/Users/nicolas/.npm/_npx/db89d7302a373f10/node_modules/playwright/index.mjs";
import fs from "node:fs";

const BASE = "http://localhost:5173";
const OUT = "/Users/nicolas/Documents/Desarrollos/54d/landings";
fs.mkdirSync(OUT, { recursive: true });

const SLUGS = [
  ["54d-on", "flagship"],
  ["max-burn", "starter"],
  ["reset-7", "starter"],
  ["runners-10k", "runners"],
];
const ALL = [
  "54d-on", "step-2", "emergency-kit", "max-burn", "reset-7", "first-move",
  "booty-on-fire", "full-body", "lower-body", "upper-body",
  "runners-5k", "runners-10k", "runners-21k",
];

const report = { pages: {}, all13: {}, errors: [] };

const browser = await chromium.launch();

async function ctx(lang, w, h) {
  const c = await browser.newContext({
    viewport: { width: w, height: h },
    deviceScaleFactor: 1,
    userAgent: w < 500
      ? "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1"
      : undefined,
  });
  if (lang === "es") {
    await c.addCookies([{ name: "54d_lang", value: "es", url: BASE }]);
  }
  return c;
}

// ---- Deep audit of the 4 representative landings ----
for (const [slug, tier] of SLUGS) {
  for (const lang of ["en", "es"]) {
    for (const [vw, vh, dev] of [[390, 844, "mobile"], [1440, 900, "desktop"]]) {
      const c = await ctx(lang, vw, vh);
      const page = await c.newPage();
      const consoleErrs = [];
      page.on("console", (m) => { if (m.type() === "error") consoleErrs.push(m.text()); });
      page.on("pageerror", (e) => consoleErrs.push("PAGEERROR: " + e.message));

      await page.goto(`${BASE}/programs/${slug}`, { waitUntil: "networkidle" });
      await page.waitForTimeout(400);

      const key = `${slug}|${lang}|${dev}`;
      const data = await page.evaluate(() => {
        const H = document.documentElement.scrollHeight;
        // every element that triggers a purchase path
        const buyBtns = [...document.querySelectorAll("button")].filter((b) =>
          /reserve|reserva|start|empieza|checkout|abriendo|opening|week 1|semana 1/i.test(b.textContent || "")
        );
        const ctas = buyBtns.map((b) => {
          const r = b.getBoundingClientRect();
          const top = Math.round(r.top + window.scrollY);
          const cs = getComputedStyle(b);
          return {
            text: (b.textContent || "").trim().slice(0, 46),
            top,
            pct: Math.round((top / H) * 100),
            primary: b.className.includes("btn-primary"),
            ghost: b.className.includes("btn-ghost"),
            h: Math.round(r.height),
            bg: cs.backgroundColor,
          };
        });
        const qw = document.querySelectorAll(".qw").length;
        const qwRows = document.querySelectorAll(".qw-row").length;
        const inline = document.querySelectorAll(".inline-cta").length;
        const faq = [...document.querySelectorAll("details.faq-item")];
        const navCta = document.querySelector(".btn-nav");
        return {
          scrollH: H,
          ctas,
          qw, qwRows, inline,
          faqCount: faq.length,
          faqFirstOpen: faq[0]?.open ?? null,
          faqOpenCount: faq.filter((f) => f.open).length,
          navCtaClass: navCta?.className ?? null,
          hasAppBanner: !!document.querySelector("[class*='app-banner'],[id*='app-banner']"),
          appleMeta: !!document.querySelector('meta[name="apple-itunes-app"]'),
          h1: document.querySelector("h1")?.textContent?.trim().slice(0, 60),
          imgs: [...document.querySelectorAll("img")].map((i) => i.getAttribute("src")),
          alts: [...document.querySelectorAll("img")].map((i) => i.getAttribute("alt")),
          bodyText: document.body.innerText,
        };
      });

      // sticky behaviour: scroll to 1.2vh -> sticky must show; scroll to #buy -> must hide
      await page.evaluate(() => window.scrollTo(0, window.innerHeight * 1.2));
      await page.waitForTimeout(350);
      const stickyMid = await page.evaluate(() => {
        const el = [...document.querySelectorAll("div")].find((d) => {
          const s = getComputedStyle(d);
          return s.position === "fixed" && parseInt(s.bottom || "999") === 0 && d.querySelector(".btn");
        });
        if (!el) return null;
        const b = el.querySelector("button, a");
        return { tag: b?.tagName, text: b?.textContent?.trim().slice(0, 40), h: Math.round(b.getBoundingClientRect().height) };
      });
      // just below threshold
      await page.evaluate(() => window.scrollTo(0, window.innerHeight * 0.5));
      await page.waitForTimeout(300);
      const stickyEarly = await page.evaluate(() => !![...document.querySelectorAll("div")].find((d) => {
        const s = getComputedStyle(d);
        return s.position === "fixed" && parseInt(s.bottom || "999") === 0 && d.querySelector(".btn");
      }));
      await page.evaluate(() => document.querySelector("#buy")?.scrollIntoView({ block: "center" }));
      await page.waitForTimeout(500);
      const stickyAtBuy = await page.evaluate(() => !![...document.querySelectorAll("div")].find((d) => {
        const s = getComputedStyle(d);
        return s.position === "fixed" && parseInt(s.bottom || "999") === 0 && d.querySelector(".btn");
      }));
      const bodyPad = await page.evaluate(() => document.body.style.paddingBottom);

      report.pages[key] = {
        ...data,
        bodyText: undefined,
        stickyMid, stickyEarly, stickyAtBuy, bodyPad,
        consoleErrs,
      };

      // yellow-primary count in a single viewport (QUIET v6: max 1)
      report.pages[key].primaryCount = data.ctas.filter((c) => c.primary).length;
      report.pages[key].ghostCount = data.ctas.filter((c) => c.ghost).length;

      // screenshots only for EN
      if (lang === "en") {
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.waitForTimeout(300);
        await page.screenshot({ path: `${OUT}/post-${slug}-${dev}.png`, fullPage: true });
      }
      await c.close();
    }
  }
}

// ---- All 13: smoke + structural invariants (mobile EN) ----
for (const slug of ALL) {
  const c = await ctx("en", 390, 844);
  const page = await c.newPage();
  const errs = [];
  page.on("pageerror", (e) => errs.push(e.message));
  const resp = await page.goto(`${BASE}/programs/${slug}`, { waitUntil: "networkidle" });
  await page.waitForTimeout(250);
  report.all13[slug] = await page.evaluate(() => ({
    status: 200,
    qw: document.querySelectorAll(".qw").length,
    qwRows: document.querySelectorAll(".qw-row").length,
    inline: document.querySelectorAll(".inline-cta").length,
    buyBlock: !!document.querySelector("#buy"),
    faqFirstOpen: document.querySelector("details.faq-item")?.open ?? null,
    navGhost: (document.querySelector(".btn-nav")?.className || "").includes("btn-ghost"),
    appleMeta: !!document.querySelector('meta[name="apple-itunes-app"]'),
    scrollH: document.documentElement.scrollHeight,
    imgs: [...document.querySelectorAll("img")].map((i) => i.getAttribute("src")),
    emDash: document.body.innerText.includes("—"),
  }));
  report.all13[slug].httpStatus = resp.status();
  report.all13[slug].pageErrors = errs;
  await c.close();
}

await browser.close();
fs.writeFileSync(`${OUT}/metrics.json`, JSON.stringify(report, null, 2));
console.log("done");
