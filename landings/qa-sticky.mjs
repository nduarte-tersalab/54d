import { chromium } from "/Users/nicolas/.npm/_npx/db89d7302a373f10/node_modules/playwright/index.mjs";

const BASE = "http://localhost:5173";
const browser = await chromium.launch();

/* The sticky bar: fixed, bottom 0, z-index 60, holding a .btn-primary.
   (nav = z100, drawer = z101, so z60 uniquely identifies it) */
function probe() {
  const hits = [...document.querySelectorAll("div")].filter((d) => {
    const s = getComputedStyle(d);
    return (
      s.position === "fixed" &&
      s.bottom === "0px" &&
      s.zIndex === "60" &&
      d.querySelector(":scope > .btn-primary")
    );
  });
  if (!hits.length) return null;
  const b = hits[0].querySelector(":scope > .btn-primary");
  const r = b.getBoundingClientRect();
  return {
    tag: b.tagName,
    text: (b.textContent || "").trim().slice(0, 40),
    h: Math.round(r.height),
    disabled: b.disabled ?? null,
    bodyPad: document.body.style.paddingBottom,
  };
}

for (const slug of ["54d-on", "max-burn", "reset-7", "runners-10k"]) {
  const c = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await c.newPage();
  await page.goto(`${BASE}/programs/${slug}`, { waitUntil: "networkidle" });
  await page.waitForTimeout(300);

  const at = async (frac) => {
    await page.evaluate((f) => window.scrollTo(0, window.innerHeight * f), frac);
    await page.waitForTimeout(450);
    return page.evaluate(probe);
  };

  const r0 = await at(0.3);
  const r1 = await at(0.9);
  const r2 = await at(3.0);
  await page.evaluate(() => document.querySelector("#buy").scrollIntoView({ block: "center" }));
  await page.waitForTimeout(700);
  const r3 = await page.evaluate(probe);
  const padAtBuy = await page.evaluate(() => document.body.style.paddingBottom);
  await page.evaluate(() => window.scrollTo(0, window.innerHeight * 2));
  await page.waitForTimeout(700);
  const r4 = await page.evaluate(probe);

  console.log(`\n### ${slug}`);
  console.log(` 0.30vh under threshold : ${r0 ? "VISIBLE (BAD)" : "hidden OK"}`);
  console.log(` 0.90vh over threshold  : ${r1 ? `visible OK <${r1.tag}> h=${r1.h} "${r1.text}"` : "MISSING (BAD)"}`);
  console.log(` 3.0vh mid page         : ${r2 ? `visible OK bodyPad=${r2.bodyPad}` : "MISSING (BAD)"}`);
  console.log(` #buy in view           : ${r3 ? "STILL VISIBLE (BAD)" : "retracted OK"} bodyPad=${JSON.stringify(padAtBuy)}`);
  console.log(` scrolled back up       : ${r4 ? "returns OK" : "DID NOT RETURN (BAD)"}`);
  await c.close();
}

const c = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await c.newPage();
await page.goto(`${BASE}/programs/54d-on`, { waitUntil: "networkidle" });
await page.evaluate(() => window.scrollTo(0, window.innerHeight * 3));
await page.waitForTimeout(600);
console.log(`\n### desktop 1440 sticky: ${(await page.evaluate(probe)) ? "VISIBLE (BAD)" : "hidden OK"}`);
await c.close();

await browser.close();
