import { chromium } from "playwright-core";
import { NextRequest, NextResponse } from "next/server";

export const config = { runtime: "edge" };

export default async function handler(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const target = searchParams.get("url");

  if (!target) {
    return NextResponse.json({ error: "Missing url parameter" }, { status: 400 });
  }

  try {
    const browser = await chromium.launch({ args: ["--no-sandbox"], headless: true });
    const page = await browser.newPage();
    await page.goto(target, { waitUntil: "load", timeout: 60000 });
    await page.waitForTimeout(3000);

    const html = await page.content();
    await browser.close();

    return new NextResponse(html, { status: 200, headers: { "Content-Type": "text/html" } });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Scrape failed" }, { status: 500 });
  }
}