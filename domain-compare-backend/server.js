import express from 'express';
import cors from 'cors';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

puppeteer.use(StealthPlugin());

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());

// Helper function to delay execution
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Scrape the price from Namecheap
async function getNamecheapPrice(domain, extension) {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    try {
        console.log('Navigating to Namecheap...');
        await page.goto('https://www.namecheap.com/domains/domain-name-search/', { waitUntil: 'networkidle2' });

        console.log('Waiting for search input on Namecheap...');
        await page.waitForSelector('.gb-search__field', { timeout: 20000 });
        await page.type('.gb-search__field', `${domain}.${extension}`);

        console.log('Submitting search on Namecheap...');
        await page.keyboard.press('Enter');

        console.log('Waiting for results on Namecheap...');
        await page.waitForSelector('article[class^="domain-"] .price > strong', { timeout: 30000 });

        console.log('Extracting price from Namecheap...');
        const price = await page.$eval('article[class^="domain-"] .price > strong', el => el.textContent.trim());

        console.log(`Price for ${domain}.${extension} on Namecheap: ${price}`);
        return price;
    } catch (error) {
        console.error(`Error scraping Namecheap price for ${domain}.${extension}:`, error);
        return 'Unavailable';
    } finally {
        await browser.close();
    }
}

// Scrape the price from GoDaddy
async function getGoDaddyPrice(domain, extension) {
    const browser = await puppeteer.launch({
        headless: true,
        args: [
            '--disable-blink-features=AutomationControlled',
            '--no-sandbox',
            '--disable-setuid-sandbox',
        ],
    });

    const page = await browser.newPage();

    try {
        console.log('Setting viewport to desktop size...');
        await page.setViewport({ width: 1280, height: 800 });

        console.log('Navigating to GoDaddy with pre-filled domain URL...');
        const domainSearchUrl = `https://www.godaddy.com/domainsearch/find?domainToCheck=${domain}.${extension}`;
        await page.goto(domainSearchUrl, { waitUntil: 'domcontentloaded' });

        console.log('Setting user agent to mimic a real browser...');
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.71 Safari/537.36');

        console.log('Checking for cookie consent dialog...');
        const acceptCookiesButton = await page.$('button#onetrust-accept-btn-handler');
        if (acceptCookiesButton) {
            console.log('Cookie consent found. Clicking Accept...');
            await acceptCookiesButton.click();
            await delay(3000);  // Short wait after clicking the accept button
        }

        console.log('Waiting for results on GoDaddy...');
        await page.waitForSelector('div[data-cy="availableCard"]', { timeout: 60000 });

        console.log('Extracting price from GoDaddy...');
        const priceElement = await page.$('span[data-cy="pricing-main-price"]');

        if (priceElement) {
            const price = await page.evaluate(el => el.textContent.trim(), priceElement);
            console.log(`Price for ${domain}.${extension} on GoDaddy: ${price}`);
            return price;
        } else {
            console.error('Price element not found on GoDaddy. Capturing page content and screenshot...');
            await page.screenshot({ path: 'godaddy-debug-no-price-desktop.png', fullPage: true });
            console.log(await page.content());
            return 'Unavailable';
        }
    } catch (error) {
        console.error(`Error scraping GoDaddy price for ${domain}.${extension}:`, error);
        return 'Unavailable';
    } finally {
        await browser.close();
    }
}

async function getRegister365Price(domain, extension) {
    const browser = await puppeteer.launch({
        headless: true,
        args: [
            '--disable-blink-features=AutomationControlled',
            '--no-sandbox',
            '--disable-setuid-sandbox',
        ],
    });

    const page = await browser.newPage();

    try {
        console.log('Navigating to Register365...');
        await page.setViewport({ width: 1280, height: 800 });
        await page.goto('https://www.register365.com/domain-names', { waitUntil: 'networkidle2' });

        console.log('Waiting for search input on Register365...');
        await page.waitForSelector('input[name="keyword"]', { timeout: 20000 });

        console.log('Typing domain into search input...');
        await page.type('input[name="keyword"]', `${domain}.${extension}`);

        console.log('Submitting search on Register365...');
        // Submit the form instead of just clicking the button
        await page.$eval('form.domain-search-form', form => form.submit());

        console.log('Waiting for results on Register365...');
        await page.waitForSelector('div.domsearch-result', { timeout: 60000 });

        // Allow some time for the full result to render
        await delay(5000);

        console.log('Extracting price from Register365...');
        const priceElement = await page.$('div.domsearch-result span.u-text-promo');

        if (priceElement) {
            // Extract major and minor price components
            const majorPrice = await page.$eval('span[data-bind="text: components().major"]', el => el.textContent.trim());
            const minorPrice = await page.$eval('span[data-bind="text: components().minor"]', el => el.textContent.trim());
            const price = `€${majorPrice}.${minorPrice}`;

            console.log(`Price for ${domain}.${extension} on Register365: ${price}`);
            return price;
        } else {
            console.error('Price element not found on Register365. Capturing page content...');
            await page.screenshot({ path: 'register365-debug-no-price.png', fullPage: true });
            return 'Unavailable';
        }
    } catch (error) {
        console.error(`Error scraping Register365 price for ${domain}.${extension}:`, error);
        return 'Unavailable';
    } finally {
        await browser.close();
    }
}



app.get('/compare', async (req, res) => {
    const { domain, extension } = req.query;

    if (!domain || !extension) {
        return res.status(400).json({ error: 'Domain and extension are required.' });
    }

    try {
        const [namecheapPrice, register365Price] = await Promise.all([
            getNamecheapPrice(domain, extension),
            getRegister365Price(domain, extension),
        ]);

        res.json({
            namecheap: namecheapPrice,
            register365: register365Price,
        });
    } catch (error) {
        console.error('Error fetching prices:', error);
        res.status(500).json({ error: 'Failed to fetch domain prices.' });
    }
});


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
