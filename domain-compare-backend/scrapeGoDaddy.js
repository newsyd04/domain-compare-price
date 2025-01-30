import puppeteer from 'puppeteer';

async function scrapeGoDaddy(domain, extension) {
  const browser = await puppeteer.launch({ headless: false, slowMo: 100 });
  const page = await browser.newPage();

  try {
    // Navigate to GoDaddy's domain search page
    await page.goto('https://www.godaddy.com/domainsearch/find', { waitUntil: 'networkidle2' });

    // Wait for the search input field
    await page.waitForSelector('input[type="search"], input[data-cy="domain-search"]', { timeout: 20000 });

    // Type the domain name and extension
    await page.type('input[type="search"], input[data-cy="domain-search"]', `${domain}.${extension}`);

    // Click the search button
    await page.click('button[data-testid="domain-search-box-button"]');

    // Wait for the price to appear
    await page.waitForSelector('span[data-cy="pricing-main-price"]', { timeout: 20000 });

    // Extract and log the price
    const price = await page.$eval('span[data-cy="pricing-main-price"]', el => el.textContent.trim());
    console.log(`Price for ${domain}.${extension} on GoDaddy: ${price}`);
  } catch (error) {
    console.error(`Error scraping GoDaddy for ${domain}.${extension}:`, error);
  } finally {
    await browser.close();
  }
}

// Run the scraper for testing
scrapeGoDaddy('example', 'com');
