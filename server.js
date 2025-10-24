// ================================================
// 🌎 ATLAS SCRAPER SERVICE
// ================================================
import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(express.json({ limit: "10mb" }));
app.use(cors({ origin: true }));

const PORT = process.env.PORT || 10000;
const LOVABLE_WEBHOOK = "https://rwyobvwzulgmkwzomuog.supabase.co/functions/v1/scraper-webhook";

// =======================================================
// 🔧 FUNCIÓN PARA ENVIAR HTML A LOVABLE
// =======================================================
async function sendToLovable({ source, url, html }) {
  try {
    const res = await fetch(LOVABLE_WEBHOOK, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ source, url, html })
    });
    const data = await res.json();
    console.log(`✅ Enviado a Lovable (${source}) → ${url}`);
    return data;
  } catch (err) {
    console.error(`❌ Error enviando ${url}:`, err.message);
  }
}

// =======================================================
// 🕷️ SCRAPERS ESPECÍFICOS
// =======================================================

// 🏇 RanchRealEstate
async function RanchRealEstateScraper() {
  const baseUrl = "https://ranchrealestate.com/for-sale/";
  console.log("🏇 Ejecutando RanchRealEstateScraper...");

  try {
    const indexRes = await fetch(baseUrl);
    const html = await indexRes.text();

    // Extrae links de propiedades
    const links = [...html.matchAll(/https:\/\/ranchrealestate\.com\/property\/[^\"]+/g)]
      .map(m => m[0])
      .slice(0, 5); // solo 5 para pruebas

    console.log(`📋 ${links.length} propiedades encontradas en RanchRealEstate`);

    for (const url of links) {
      try {
        const page = await fetch(url);
        const detailHtml = await page.text();
        await sendToLovable({ source: "ranchrealestate", url, html: detailHtml });
        await new Promise(r => setTimeout(r, 1000)); // pausa entre requests
      } catch (err) {
        console.error(`❌ Error procesando ${url}:`, err.message);
      }
    }
  } catch (err) {
    console.error("❌ Error en RanchRealEstateScraper:", err.message);
  }
}

// 🌎 LandWatch
async function LandWatchScraper() {
  const baseUrl = "https://www.landwatch.com/texas-land-for-sale";
  console.log("🌎 Ejecutando LandWatchScraper...");

  try {
    const indexRes = await fetch(baseUrl);
    const html = await indexRes.text();

    const links = [...html.matchAll(/https:\/\/www\.landwatch\.com\/detail\/[^\"]+/g)]
      .map(m => m[0])
      .slice(0, 5);

    console.log(`📋 ${links.length} propiedades encontradas en LandWatch`);

    for (const url of links) {
      try {
        const page = await fetch(url);
        const detailHtml = await page.text();
        await sendToLovable({ source: "landwatch", url, html: detailHtml });
        await new Promise(r => setTimeout(r, 1000));
      } catch (err) {
        console.error(`❌ Error procesando ${url}:`, err.message);
      }
    }
  } catch (err) {
    console.error("❌ Error en LandWatchScraper:", err.message);
  }
}

// =======================================================
// 🧠 DIRECTOR (Orquesta los scrapers)
// =======================================================
async function runDirector() {
  console.log("🔄 Invocando Director...");
  await RanchRealEstateScraper();
  await LandWatchScraper();
  console.log("✅ Scrapers completados");
}

// =======================================================
// 🟢 ENDPOINT PRINCIPAL
// =======================================================
app.post("/run-scraper-director", async (_req, res) => {
  console.log("⚙️ Solicitud recibida en /run-scraper-director");
  try {
    await runDirector();
    res.json({ status: "success", message: "Scrapers ejecutados correctamente" });
  } catch (err) {
    console.error("❌ Error general:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// =======================================================
// ❤️ HEALTH CHECK
// =======================================================
app.get("/healthz", (_req, res) =>
  res.json({ ok: true, timestamp: new Date().toISOString() })
);

// =======================================================
// 🚀 START SERVER
// =======================================================
app.listen(PORT, () => {
  console.log(`🚀 Atlas Scraper corriendo en puerto ${PORT}`);
});
