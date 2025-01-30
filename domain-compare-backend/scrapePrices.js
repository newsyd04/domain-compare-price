import puppeteer from 'puppeteer';

async function getDomainPrice(domain, extension) {
  const browser = await puppeteer.launch({ headless: false, slowMo: 100 });
  const page = await browser.newPage();

  try {
    // Navigate to Namecheap's domain search page
    await page.goto('https://www.namecheap.com/domains/domain-name-search/');

    // Wait for the search input field and type the domain name
    await page.waitForSelector('.gb-search__field', { timeout: 15000 });
    await page.type('.gb-search__field', `${domain}.${extension}`);

    // Trigger the search by pressing Enter
    await page.keyboard.press('Enter');

    // Wait for search results to appear
    await page.waitForSelector('article.domain-com .price > strong', { timeout: 20000 });

    // Extract the price from the result
    const price = await page.$eval('article.domain-com .price > strong', el => el.textContent.trim());

    console.log(`Price for ${domain}.${extension}: ${price}`);
  } catch (error) {
    console.error('Error scraping price:', error);
  } finally {
    await browser.close();
  }
}

// Call the function with a test domain
getDomainPrice('daranewsome', 'com');
