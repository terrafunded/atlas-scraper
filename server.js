import express from "express";
import { chromium } from "playwright-core";
import { execSync } from "child_process";

const app = express();

// 🧩 Forzar instalación de Chromium si no existe
try {
  console.log("🔧 Verificando instalación de Chromium...");
  execSync("npx playwright install chromium", { stdio: "inherit" });
  console.log("✅ Chromium instalado o ya presente.");
} catch (err) {
  console.error("❌ Error instalando Chromium:", err.message);
}

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
