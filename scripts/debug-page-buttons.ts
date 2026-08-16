import puppeteer from "puppeteer";
const browser = await puppeteer.launch({ headless: true, args: ["--no-sandbox"] });
const page = await browser.newPage();
await page.goto("http://localhost:3000", { waitUntil: "networkidle2", timeout: 60000 });
const dash = await page.$("button[title='Dashboard']");
if (dash) {
  await dash.click();
  await new Promise((r) => setTimeout(r, 2000));
}
const info = await page.evaluate(() => ({
  titles: Array.from(document.querySelectorAll("button")).map((b) => ({
    title: b.getAttribute("title"),
    text: b.textContent?.trim().slice(0, 50),
  })),
  bodySnippet: document.body.innerText.slice(0, 500),
}));
console.log(JSON.stringify(info, null, 2));
await browser.close();
