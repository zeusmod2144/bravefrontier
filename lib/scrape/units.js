const cheerio = require("cheerio");
const chalk = require("chalk");
const axios = require("axios");

const units = [];
const firstMainSeriesUrl = "https://bravefrontierglobal.fandom.com/wiki/Unit_List";
const firstGlobalExclusiveSeriesUrl = "https://bravefrontierglobal.fandom.com/wiki/Unit_List:7000";

function scrape($) {
    const rows = $("table.wikitable tbody").first().find("tr");
    let id, name, link, thumbnail, element, rarity, cost;
    rows.each((i, el) => {
        const columns = $(el).find($("td"));
        columns.each((i, el) => {
            switch (i) {
                case 0:
                    id = $(el).find("center").text();
                    break;
                case 1:
                    if (typeof $(el).find("a > img").attr("data-src") !== "undefined") {
                        thumbnail = $(el).find("a > img").attr("data-src");
                    } else {
                        thumbnail = $(el).find("a > img").attr("src");
                    }
                    const findPathThumbnail = "/scale-to-width-down/42";
                    const regex = new RegExp(findPathThumbnail, 'g');
                    thumbnail = thumbnail.replace(regex, '');
                    name = $(el).find("a").last().attr("title");
                    link = `${rootUrl}${$(el).find("a").last().attr("href")}`;
                    break;
                case 2:
                    const elementAttr = $(el).find("center > a").attr("title");
                    element = elementAttr.replace('Category:', '');
                    break;
                case 3:
                    const rarityAttr = $(el).find("center > a").attr("title");
                    rarity = rarityAttr.replace('Category:', '');
                    break;
                case 4:
                    const costAttr = $(el).find("center > a").attr("title");
                    cost = costAttr.replace('Category:Cost', '');
                    break;
            }
        })
        units.push({
            id, name, link, thumbnail, element, rarity, cost
        });
    });
}

const rootUrl = "https://bravefrontierglobal.fandom.com";

getMain = async (url) => {
    try {
        const response = await axios.get(url);
        const $ = cheerio.load(response.data);

        scrape($);

        // Recursion start
        const nextPageHref = $('div#mw-content-text > div > p').find('strong').next().attr('href');

        if (nextPageHref === undefined) {
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
        const $ = cheerio.load(response.data);

        scrape($);

        // Recursion start
        const nextPageHref = $('div#mw-content-text > div > div > p').find('strong').next().attr('href');

        if (nextPageHref === undefined) {
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

async function collectUnits() {
    let mainUnits = await getMain(firstMainSeriesUrl);
    let exclusiveUnits = await getGlobalExclusive(firstGlobalExclusiveSeriesUrl);
  
    const units = [];
    // Filter from an object that has undefined values
    for (const unit of [...mainUnits, ...exclusiveUnits]) {
      if (!Object.values(unit).includes(undefined)) {
        units.push(unit);
      }
    }
  
    // Remove duplicate unit object
    const filteredUnits = units.filter(function ({ id, name }) {
      const key = `${id}${name}`;
      return !this.has(key) && this.add(key);
    }, new Set);
    
    return filteredUnits;
}

exports.collectUnits = collectUnits;