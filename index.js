const cheerio = require("cheerio");
const fs = require("fs");
const chalk = require("chalk");
const axios = require("axios");

const rootUrl = "https://bravefrontierglobal.fandom.com";
const firstMainSeriesUrl = "https://bravefrontierglobal.fandom.com/wiki/Unit_List";
const firstGlobalExclusiveSeriesUrl = "https://bravefrontierglobal.fandom.com/wiki/Unit_List:7000";
const mainUnits = [];
const exclusiveUnits = [];
const outputFile = 'units.json';

console.log(chalk.yellow.bgBlue(`\n Scraping of Brave Frontier units started initiated...\n`));

const getMainSeriesUnits = async (url) => {
  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    const rows = $("table.wikitable tbody").first().find("tr");
    let name, link, thumbnail, element, rarity, cost;
    rows.each((i, el) => {
      const columns = $(el).find($("td"));
      columns.each((i, el) => {
        switch (i) {
          case 1:
            if (typeof $(el).find("a > img").attr("data-src") !== "undefined") {
              thumbnail = $(el).find("a > img").attr("data-src");
            } else {
              thumbnail = $(el).find("a > img").attr("src");
            }
            name = $(el).find("a").last().attr("title");
            link = $(el).find("a").last().attr("href");
            break;
          case 2:
            element = $(el).find("center > a").attr("title");
            break;
          case 3:
            rarity = $(el).find("center > a").attr("title");
            break;
          case 4:
            cost = $(el).find("center > a").attr("title");
            break;
        }
      })
      mainUnits.push({
        name, link, thumbnail, element, rarity, cost
      });
    });

    // Recursion start
    const nextPageHref = $('div#mw-content-text > div > p').find('strong').next().attr('href');

    if (nextPageHref === undefined) {
      console.log(chalk.yellow.bgBlue(`\n Finish scraping main series units. \n`));
      return mainUnits;
    }

    nextUrl = `${rootUrl}${nextPageHref}`;
    console.log(chalk.cyan(`Scraping next url: ${nextUrl}`));

    return await getMainSeriesUnits(nextUrl);
    // Recursion end
  } catch (error) {
    console.error(error);
  }
}

const getGlobalExclusiveSeriesUnits = async (url) => {
  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    const rows = $("table.wikitable tbody").first().find("tr");
    let name, link, thumbnail, element, rarity, cost;
    rows.each((i, el) => {
      const columns = $(el).find($("td"));
      columns.each((i, el) => {
        switch (i) {
          case 1:
            if (typeof $(el).find("a > img").attr("data-src") !== "undefined") {
              thumbnail = $(el).find("a > img").attr("data-src");
            } else {
              thumbnail = $(el).find("a > img").attr("src");
            }
            name = $(el).find("a").last().attr("title");
            link = $(el).find("a").last().attr("href");
            break;
          case 2:
            element = $(el).find("center > a").attr("title");
            break;
          case 3:
            rarity = $(el).find("center > a").attr("title");
            break;
          case 4:
            cost = $(el).find("center > a").attr("title");
            break;
        }
      })
      exclusiveUnits.push({
        name, link, thumbnail, element, rarity, cost
      });
    });

    // Recursion start
    const nextPageHref = $('div#mw-content-text > div > div > p').find('strong').next().attr('href');

    if (nextPageHref === undefined) {
      console.log(chalk.yellow.bgBlue(`\n Finish scraping global exclusive series units. \n`));
      return exclusiveUnits;
    }

    nextUrl = `${rootUrl}${nextPageHref}`;
    console.log(chalk.cyan(`Scraping next url: ${nextUrl}`));

    return await getGlobalExclusiveSeriesUnits(nextUrl);
    // Recursion end
  } catch (error) {
    console.error(error);
  }
}

async function collectUnits() {
  let [mainUnits, exclusiveUnits] = await Promise.all([getMainSeriesUnits(firstMainSeriesUrl), getGlobalExclusiveSeriesUnits(firstGlobalExclusiveSeriesUrl)]);

  let result = [...mainUnits, ...exclusiveUnits];

  const units = [];
  // Filter from an object that has undefined values
  for (const unit of result) {
    if (!Object.values(unit).includes(undefined)) {
      units.push(unit);
    }
  }

  // Store the result to units.json file
  fs.writeFile(outputFile, JSON.stringify(units, null, 4), err => {
    if (err) {
      console.log(err);
    }
    console.log(chalk.yellow.bgBlue(`\n Success export ${units.length} units to ${outputFile}. \n`));
  });
}

collectUnits();