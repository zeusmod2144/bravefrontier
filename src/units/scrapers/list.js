const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const chalk = require("chalk");
const axios = require("axios");

const units = [];

function scrape(document) {
    const rows = Array.from(document.querySelector('table.wikitable tbody').querySelectorAll('tr'));
    let id, name, link, thumbnail, element, rarity, cost;
    for (let i = 0; i < rows.length; i++) {
        const columns = rows[i].querySelectorAll('td');
        for (let j = 0; j < columns.length; j++) {
            const column = columns[j];
            switch (j) {
                case 0:
                    id = column.querySelector('center').textContent.trim();
                    break;
                case 1:
                    if (typeof column.querySelector('a > img').getAttribute('data-src') !== undefined) {
                        thumbnail = column.querySelector('a > img').getAttribute('data-src');
                    } else {
                        thumbnail = column.querySelector('a > img').getAttribute('src');
                    }
                    // const findPathThumbnail = "/scale-to-width-down/42";
                    // const regex = new RegExp(findPathThumbnail, 'g');
                    // thumbnail = thumbnail.replace(regex, '');
                    name = column.querySelectorAll('a')[1].getAttribute('title');
                    link = `${rootUrl}${column.querySelectorAll('a')[1].getAttribute('href')}`;
                    break;
                case 2:
                    element = column.querySelector('center > a').getAttribute('title').replace('Category:', '');
                    break;
                case 3:
                    rarity = column.querySelector('center > a').getAttribute('title').replace('Category:', '');
                    break;
                case 4:
                    cost = column.querySelector('center > a').getAttribute('title').replace('Category:Cost', '');
                    break;
            }
        }
        units.push({
            id, name, link, thumbnail, element, rarity, cost
        });
    }
}

const rootUrl = "https://bravefrontierglobal.fandom.com";

getMain = async (url) => {
    try {
        const response = await axios.get(url);
        const { document } = (new JSDOM(response.data)).window;

        scrape(document);

        // Recursion start
        const nextElementSibling = document.querySelector('div#mw-content-text > div > p > strong').nextElementSibling;
        if (nextElementSibling !== null) {
            nextPageHref = nextElementSibling.getAttribute('href');
        } else {
            return units;
        }

        nextUrl = `${rootUrl}${nextPageHref}`;
        console.log(chalk.cyan(`Scraping next url: ${nextUrl}`));

        return await getMain(nextUrl);
        // Recursion end
    } catch (error) {
        console.error(error);
    }
}

getGlobalExclusive = async (url) => {
    try {
        const response = await axios.get(url);
        const { document } = (new JSDOM(response.data)).window;

        scrape(document);

        // Recursion start
        const nextElementSibling = document.querySelector('div#mw-content-text > div > div > p > strong').nextElementSibling;
        if (nextElementSibling !== null) {
            nextPageHref = nextElementSibling.getAttribute('href');
        } else {
            return units;
        }

        nextUrl = `${rootUrl}${nextPageHref}`;
        console.log(chalk.cyan(`Scraping next url: ${nextUrl}`));

        return await getGlobalExclusive(nextUrl);
        // Recursion end
    } catch (error) {
        console.error(error);
    }
}

module.exports = { getMain, getGlobalExclusive };