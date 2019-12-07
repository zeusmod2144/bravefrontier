const cheerio = require("cheerio");
const fs = require("fs");
const chalk = require("chalk");
const axios = require("axios");

const rootUrl = "https://bravefrontierglobal.fandom.com";
const url = "https://bravefrontierglobal.fandom.com/wiki/Unit_List";
const units = [];
const outputFile = 'units.json';
let pageCounter = 0;

console.log(chalk.yellow.bgBlue(`\n Scraping of Brave Frontier units started initiated...\n`));

const getUnits = async (url) => {
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
      units.push({
        name, link, thumbnail, element, rarity, cost
      });
    });

    // Remove first element
    units.shift();

    const exportResults = (units) => {
      fs.writeFile(outputFile, JSON.stringify(units, null, 4), (err) => {
        if (err) {
          console.log(err)
        }
        console.log(chalk.yellow.bgBlue(`\n ${chalk.underline.bold(units.length)} Results exported successfully to ${chalk.underline.bold(outputFile)}\n`));
      });
    }

    const lastPageText = $('div#mw-content-text > div > p').find('a').last().text();
    const lastPage = parseInt(lastPageText.split("-")[0], 10);

    if (pageCounter >= lastPage) {
      exportResults(units);
      return false;
    }
    
    pageCounter += 100;

    const nextUrl = `${rootUrl}/wiki/Unit_List:${pageCounter}`;
    console.log(chalk.cyan(`Scraping next url: ${nextUrl}`));

    getUnits(nextUrl);
  } catch (error) {
    console.error(error);
  }
}

getUnits(url);