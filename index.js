import puppeteer from "puppeteer";

const getQuotes = async () => {
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
        args: ["--start-maximized"],
    });

    const page = await browser.newPage();

    try {
        await page.goto("https://quotes.toscrape.com/", {
            waitUntil: 'domcontentloaded'
        });

        let hasNextPage = true;

        while (hasNextPage) {
            // Extract quotes from the current page
            const quotes = await page.evaluate(() => {
                const quoteList = document.querySelectorAll(".quote");

                return Array.from(quoteList).map((quote) => {
                    const text = quote.querySelector(".text").innerText;
                    const author = quote.querySelector(".author").innerText;

                    return {
                        text,
                        author,
                    };
                });
            });

            console.log(quotes);

            // Check if there is a next page
            hasNextPage = await page.evaluate(() => {
                const nextButton = document.querySelector(".pager >.next > a");
                return nextButton !== null;
            });

            if (hasNextPage) {
                // Click on the "Next" button and wait for the new page to load
                await Promise.all([
                    page.click(".pager >.next > a"),
                    page.waitForNavigation({ waitUntil: "domcontentloaded" })
                ]);
            }
        }
    } catch (error) {
        console.error("An error occurred:", error);
    } finally {
        // Close the browser
        await browser.close();
    }
};

getQuotes();
