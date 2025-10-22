import express from "express";
import { chromium } from "playwright-core";

const app = express();

app.get("/api/scrape", async (req, res) => {
  const target = req.query.url;

  if (!target) {
    return res.status(400).json({ error: "Missing url parameter" });
  }

  try {
    const browser = await chromium.launch({
      args: ["--no-sandbox"],
      headless: true,
    });

    const page = await browser.newPage();
    await page.goto(target, { waitUntil: "load", timeout: 60000 });
    await page.waitForTimeout(3000);

    const html = await page.content();
    await browser.close();

    res.setHeader("Content-Type", "text/html");
    res.status(200).send(html);
  } catch (error) {
    console.error("Scrape error:", error.message);
    res.status(500).json({ error: error.message || "Scrape failed" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Atlas Scraper running on port ${PORT}`);
});
