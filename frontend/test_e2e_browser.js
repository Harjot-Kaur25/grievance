import puppeteer from "puppeteer-core";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const BASE_URL = "http://127.0.0.1:5173/";

const screenshotsDir = path.join(__dirname, "screenshots");
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

async function runTests() {
  console.log("Launching Chrome at:", CHROME_PATH);
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--window-size=1400,900"],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 900 });

  const consoleLogs = [];
  const consoleErrors = [];
  const networkErrors = [];

  page.on("console", (msg) => {
    const text = msg.text();
    consoleLogs.push(`[${msg.type()}] ${text}`);
    if (msg.type() === "error") {
      consoleErrors.push(text);
    }
  });

  page.on("pageerror", (err) => {
    consoleErrors.push(`Page Error: ${err.message}`);
  });

  page.on("requestfailed", (req) => {
    networkErrors.push(`${req.method()} ${req.url()}: ${req.failure()?.errorText}`);
  });

  try {
    console.log("\n1. Navigating to CIVIC Overview Page...");
    await page.goto(BASE_URL, { waitUntil: "networkidle0", timeout: 15000 });
    await page.waitForSelector("h1", { timeout: 5000 });

    const titleText = await page.$eval("h1", (el) => el.innerText);
    console.log("✓ Page Header:", titleText);

    // Verify Brand Name
    const bodyText = await page.$eval("body", (el) => el.innerText);
    if (bodyText.includes("CIVIC / SIGNAL") || bodyText.includes("SIGNAL")) {
      console.error("❌ Brand check failed: contains SIGNAL");
    } else {
      console.log("✓ Brand check passed: CIVIC branding only");
    }

    // Check KPIs on Overview
    const kpiCards = await page.$$eval(".glass-panel", (els) => els.length);
    console.log(`✓ Detected ${kpiCards} glass panels on Overview`);

    await page.screenshot({ path: path.join(screenshotsDir, "01_overview.png"), fullPage: true });
    console.log("✓ Saved 01_overview.png");

    // 2. Test Grievance Register Page
    console.log("\n2. Navigating to Grievance Register...");
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll("button")).find((b) =>
        b.innerText.includes("Grievance Register")
      );
      if (btn) btn.click();
    });

    await page.waitForFunction(() => document.querySelector("h1")?.innerText.includes("REGISTER"), { timeout: 5000 });
    await new Promise((r) => setTimeout(r, 1200));

    // Verify complaints table populated
    const rowCount = await page.$$eval("tbody tr", (rows) => rows.length);
    console.log(`✓ Grievance Register rows loaded: ${rowCount} rows`);

    // Test Search Filter
    console.log("Testing search input with 'Garbage'...");
    await page.type("input[placeholder*='Search']", "Garbage");
    await page.click("button[type='submit']");
    await new Promise((r) => setTimeout(r, 800));
    const searchRows = await page.$$eval("tbody tr", (rows) => rows.length);
    console.log(`✓ Filtered search results: ${searchRows} rows`);

    // Test Priority Dropdown
    console.log("Testing priority filter: 'Critical'...");
    await page.select("#priority_filter", "Critical");
    await new Promise((r) => setTimeout(r, 800));
    const criticalRows = await page.$$eval("tbody tr", (rows) => rows.length);
    console.log(`✓ Priority 'Critical' filtered rows: ${criticalRows}`);

    // Inspect first row modal
    console.log("Opening inspection detail modal...");
    await page.click("tbody tr:first-child");
    await page.waitForSelector(".fixed.inset-0", { timeout: 3000 });
    const modalTitle = await page.$eval(".fixed.inset-0 h3", (el) => el.innerText);
    console.log("✓ Modal opened:", modalTitle);

    await page.screenshot({ path: path.join(screenshotsDir, "02_register_modal.png") });
    console.log("✓ Saved 02_register_modal.png");

    // Close modal
    await page.evaluate(() => {
      const closeBtn = Array.from(document.querySelectorAll(".fixed.inset-0 button")).find((b) =>
        b.innerText.includes("Close")
      );
      if (closeBtn) closeBtn.click();
    });
    await new Promise((r) => setTimeout(r, 500));

    // 3. Test Priority Assessment Page
    console.log("\n3. Navigating to Priority Assessment...");
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll("button")).find((b) =>
        b.innerText.includes("Priority Assessment")
      );
      if (btn) btn.click();
    });

    await page.waitForFunction(() => document.querySelector("h1")?.innerText.includes("PRIORITY INFERENCE"), { timeout: 5000 });

    // Test preset button
    console.log("Applying Scenario Preset...");
    await page.evaluate(() => {
      const presetBtn = Array.from(document.querySelectorAll("button")).find((b) =>
        b.innerText.includes("Overflowing Garbage Dump")
      );
      if (presetBtn) presetBtn.click();
    });

    // Make sure 'save to database' is unchecked for this test as requested
    console.log("Disabling 'save to database' checkbox...");
    const isSaveChecked = await page.$eval("#save_db", (el) => el.checked);
    if (isSaveChecked) {
      await page.click("#save_db");
    }

    // Click submit
    console.log("Running Priority Assessment with saving disabled...");
    await page.click("button[type='submit']");
    await page.waitForFunction(() => document.body.innerText.includes("CALIBRATED CONFIDENCE"), { timeout: 10000 });

    const assessedPriority = await page.$eval("[data-testid='predicted-priority-text']", (el) => el.innerText);
    const confidenceText = await page.$eval("[data-testid='predicted-confidence-text']", (el) => el.innerText);
    console.log(`✓ Real model prediction result: Tier = ${assessedPriority}, Calibrated Confidence = ${confidenceText}`);

    await page.screenshot({ path: path.join(screenshotsDir, "03_priority_assessment.png"), fullPage: true });
    console.log("✓ Saved 03_priority_assessment.png");

    // 4. Test Ward Intelligence Page
    console.log("\n4. Navigating to Ward Intelligence...");
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll("button")).find((b) =>
        b.innerText.includes("Ward Intelligence")
      );
      if (btn) btn.click();
    });

    await page.waitForFunction(() => document.querySelector("h1")?.innerText.includes("WARD INTELLIGENCE"), { timeout: 5000 });
    await new Promise((r) => setTimeout(r, 1000));

    const wardCount = await page.$$eval("tbody tr", (rows) => rows.length);
    console.log(`✓ Ward Hotspot table loaded: ${wardCount} wards`);

    await page.screenshot({ path: path.join(screenshotsDir, "04_ward_intelligence.png"), fullPage: true });
    console.log("✓ Saved 04_ward_intelligence.png");

    // Test "Filter Cases" bridge to Register
    console.log("Testing 'Filter Cases' button for top ward (Horamavu)...");
    await page.evaluate(() => {
      const filterBtn = Array.from(document.querySelectorAll("tbody tr:first-child button")).find((b) =>
        b.innerText.includes("Filter Cases")
      );
      if (filterBtn) filterBtn.click();
    });

    await page.waitForFunction(() => document.querySelector("h1")?.innerText.includes("REGISTER"), { timeout: 5000 });
    await new Promise((r) => setTimeout(r, 1200));

    const wardFilterBanner = await page.$eval("body", (el) => el.innerText.includes("Filtering by Ward: Horamavu"));
    console.log("✓ Navigated to Register with active ward filter banner:", wardFilterBanner);
    const horamavuCountText = await page.evaluate(() => document.body.innerText.match(/of ([\d,]+) records/)?.[1]);
    console.log(`✓ Grievance Register shows Horamavu total: ${horamavuCountText} records`);

    await page.screenshot({ path: path.join(screenshotsDir, "04b_register_horamavu_filtered.png") });
    console.log("✓ Saved 04b_register_horamavu_filtered.png");

    // 5. Test Bulk Analysis Page
    console.log("\n5. Navigating to Bulk Analysis...");
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll("button")).find((b) =>
        b.innerText.includes("Bulk Analysis")
      );
      if (btn) btn.click();
    });

    await page.waitForFunction(() => document.querySelector("h1")?.innerText.includes("BULK INTAKE"), { timeout: 5000 });

    // Create a temporary test CSV file
    const tempCsvPath = path.join(__dirname, "test_upload.csv");
    fs.writeFileSync(
      tempCsvPath,
      "sub_category,ward,status,staff_remarks,designation,age_hours\n" +
      "Garbage dump,Horamavu,Registered,1st Assigned,AE,24\n" +
      "Drainage Overflow,Thanisandra,Registered,Field inspection,AEE,48\n" +
      "Street Light Not Working,Domlur,Registered,Pending line repair,Lineman,12\n"
    );

    // Upload file
    console.log("Uploading test CSV to Bulk Analysis...");
    const fileInput = await page.$("input[type='file']");
    await fileInput.uploadFile(tempCsvPath);

    // Ensure save to db is unchecked
    const isBatchSaveChecked = await page.$eval("#batch_save", (el) => el.checked);
    if (isBatchSaveChecked) {
      await page.click("#batch_save");
    }

    // Dispatch batch
    console.log("Submitting batch prediction...");
    await page.click("button[type='submit']");
    await page.waitForFunction(() => document.body.innerText.includes("TOTAL CLASSIFIED"), { timeout: 15000 });

    const totalClassified = await page.$eval(".glass-panel .text-2xl.font-black", (el) => el.innerText);
    console.log(`✓ Batch prediction finished! Total Classified: ${totalClassified}`);

    await page.screenshot({ path: path.join(screenshotsDir, "05_bulk_analysis.png"), fullPage: true });
    console.log("✓ Saved 05_bulk_analysis.png");

    // Clean up temp csv
    if (fs.existsSync(tempCsvPath)) fs.unlinkSync(tempCsvPath);

    // 6. Test Model Methodology Page
    console.log("\n6. Navigating to Model Methodology...");
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll("button")).find((b) =>
        b.innerText.includes("Model Methodology")
      );
      if (btn) btn.click();
    });

    await page.waitForFunction(() => document.querySelector("h1")?.innerText.includes("MODEL METHODOLOGY"), { timeout: 5000 });
    const hasFormula = await page.evaluate(() =>
      document.body.innerText.includes("category_severity / 4")
    );
    console.log("✓ Model Methodology documentation contains ground-truth formula:", hasFormula);

    await page.screenshot({ path: path.join(screenshotsDir, "06_methodology.png"), fullPage: true });
    console.log("✓ Saved 06_methodology.png");

    // Check Console Errors
    console.log("\n=== ERROR AUDIT ===");
    console.log(`Console Errors count: ${consoleErrors.length}`);
    if (consoleErrors.length > 0) {
      console.log("Errors detected:", consoleErrors);
    } else {
      console.log("✓ ZERO console errors detected during full browser tour!");
    }

    console.log(`Network Failures count: ${networkErrors.length}`);
    if (networkErrors.length > 0) {
      console.log("Network failures:", networkErrors);
    } else {
      console.log("✓ ZERO network failures detected!");
    }

  } catch (err) {
    console.error("Test execution failed:", err);
    await page.screenshot({ path: path.join(screenshotsDir, "error_state.png") });
  } finally {
    await browser.close();
  }
}

runTests();
