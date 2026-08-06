import { chromium } from "/Users/nicolas/.npm/_npx/db89d7302a373f10/node_modules/playwright/index.mjs";

const BASE = "http://localhost:5173";
const browser = await chromium.launch();

/* Count yellow primaries actually inside the viewport at a given scroll */
function primariesInView() {
  const out = [];
  for (const b of document.querySelectorAll(".btn-primary")) {
    const r = b.getBoundingClientRect();
    if (r.bottom > 0 && r.top < window.innerHeight && r.width > 0) {
      const cs = getComputedStyle(b);
      out.push({ text: (b.textContent || "").trim().slice(0, 36), bg: cs.backgroundColor });
    }
  }
  return out;
}

console.log("=== QUIET v6: yellow primaries per viewport (390x844, full scroll sweep) ===");
for (const slug of ["54d-on", "max-burn", "reset-7", "runners-10k"]) {
  const c = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await c.newPage();
  await page.goto(`${BASE}/programs/${slug}`, { waitUntil: "networkidle" });
  await page.waitForTimeout(300);
  const H = await page.evaluate(() => document.documentElement.scrollHeight);
  let worst = 0, worstAt = 0, worstList = [];
  for (let y = 0; y < H; y += 300) {
    await page.evaluate((yy) => window.scrollTo(0, yy), y);
    await page.waitForTimeout(120);
    const list = await page.evaluate(primariesInView);
    if (list.length > worst) { worst = list.length; worstAt = y; worstList = list; }
  }
  console.log(`${slug.padEnd(13)} max primaries in one viewport = ${worst} @${worstAt}px  ${JSON.stringify(worstList.map(x=>x.text))}`);
  await c.close();
}

console.log("\n=== CHECKOUT: does a CTA actually fire a /checkout request? ===");
for (const [slug, sel] of [["54d-on", "hero"], ["runners-10k", "hero"]]) {
  const c = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await c.newPage();
  const reqs = [];
  page.on("request", (r) => { if (r.url().includes("/checkout")) reqs.push({ url: r.url(), method: r.method(), body: r.postData() }); });
  const resps = [];
  page.on("response", async (r) => { if (r.url().includes("/checkout")) resps.push({ status: r.status() }); });
  await page.goto(`${BASE}/programs/${slug}`, { waitUntil: "networkidle" });
  await page.waitForTimeout(300);
  await page.evaluate(() => {
    const b = [...document.querySelectorAll(".hero-ctas .btn-primary")][0];
    b.click();
  });
  await page.waitForTimeout(2500);
  const errText = await page.evaluate(() => document.querySelector("[role=alert]")?.textContent ?? null);
  const btnState = await page.evaluate(() => {
    const b = [...document.querySelectorAll(".hero-ctas .btn-primary")][0];
    return { text: b.textContent.trim(), disabled: b.disabled };
  });
  console.log(`${slug}: requests=${JSON.stringify(reqs)} responses=${JSON.stringify(resps)}`);
  console.log(`   button=${JSON.stringify(btnState)} errorShown=${JSON.stringify(errText)}`);
  await c.close();
}

console.log("\n=== i18n: English leaking into ES render ===");
const EN_MARKERS = [
  "What you'll", "Is this", "for you?", "The numbers", "that matter.",
  "A real coach.", "A real guarantee.", "Before you", "start.",
  "30-day money-back guarantee", "One payment", "Starts Mondays",
  "This is for you if", "This is NOT for you if", "The honest filter",
  "The program", "The structure", "Zero risk", "Next generation starts Monday",
  "Included with 54D ON membership", "Also available monthly", "No subscription",
  "Your day 1", "Per session", "All you need", "Start today", "Reserve my spot",
];
for (const slug of ["54d-on", "max-burn", "reset-7", "runners-10k"]) {
  const c = await browser.newContext({ viewport: { width: 390, height: 844 } });
  await c.addCookies([{ name: "54d_lang", value: "es", url: BASE }]);
  const page = await c.newPage();
  await page.goto(`${BASE}/programs/${slug}`, { waitUntil: "networkidle" });
  await page.waitForTimeout(300);
  const txt = await page.evaluate(() => document.body.innerText);
  const leaks = EN_MARKERS.filter((m) => txt.includes(m));
  const title = await page.title();
  const desc = await page.evaluate(() => document.querySelector('meta[name=description]')?.content);
  console.log(`${slug.padEnd(13)} leaks=${leaks.length ? JSON.stringify(leaks) : "none"}`);
  console.log(`   title="${title.slice(0, 70)}"`);
  console.log(`   desc="${(desc || "").slice(0, 70)}"`);
  await c.close();
}

console.log("\n=== IMAGES on all 13 (boxing/cones/gloves audit) ===");
const ALL = ["54d-on","step-2","emergency-kit","max-burn","reset-7","first-move","booty-on-fire","full-body","lower-body","upper-body","runners-5k","runners-10k","runners-21k"];
const seen = new Set();
for (const slug of ALL) {
  const c = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await c.newPage();
  const broken = [];
  page.on("response", (r) => { if (r.request().resourceType() === "image" && r.status() >= 400) broken.push(`${r.status()} ${r.url()}`); });
  await page.goto(`${BASE}/programs/${slug}`, { waitUntil: "networkidle" });
  await page.evaluate(async () => { for (let y=0;y<document.documentElement.scrollHeight;y+=600){window.scrollTo(0,y);await new Promise(r=>setTimeout(r,60));} });
  await page.waitForTimeout(700);
  const imgs = await page.evaluate(() => [...document.querySelectorAll("img")].map(i => ({ src: i.getAttribute("src"), nw: i.naturalWidth })));
  imgs.forEach(i => seen.add(i.src));
  const zero = imgs.filter(i => i.nw === 0);
  if (broken.length || zero.length) console.log(`${slug}: BROKEN=${JSON.stringify(broken)} ZERO=${JSON.stringify(zero)}`);
}
console.log("distinct image srcs across 13 landings:");
[...seen].sort().forEach(s => console.log("  " + s));

await browser.close();
