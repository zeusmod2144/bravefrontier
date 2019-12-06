const request = require("request");
const cheerio = require("cheerio");
const fs = require("fs");
const chalk = require("chalk");

const url = "https://bravefrontierglobal.fandom.com/wiki/Unit_List";
const units = [];
const outputFile = 'units.json';

const getUnits = (url) => {
  request(url, (error, response, body) => {
    if (!error && response.statusCode == 200) {
      const $ = cheerio.load(body);
      const tableBbody = $("table.wikitable tbody").first();
      tableBbody.each((i, el) => {
        const rows = $(el).find($("tr"));
        rows.each((i, el) => {
          const columns = $(el).find($("td"));
          let name, link, thumbnail, element, rarity, cost;
          columns.map((i, el) => {
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
          });
          units.push({
            name, link, thumbnail, element, rarity, cost
          });
        });
      });

      // Remove first element
      units.shift();
      console.log(units);
      console.log(units.length);

      fs.writeFile(outputFile, JSON.stringify(units, null, 4), (err) => {
        if (err) {
          console.log(err)
        }
        console.log(chalk.yellow.bgBlue(`\n ${chalk.underline.bold(units.length)} Results exported successfully to ${chalk.underline.bold(outputFile)}\n`));
      })
    } else {
      console.log(error);
    }
  });
}

getUnits(url);