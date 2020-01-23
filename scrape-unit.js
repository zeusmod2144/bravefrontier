const fs = require('fs');
const cheerio = require('cheerio');
const axios = require('axios');
const chalk = require("chalk");

const getUnitBio = (unitLink) => {
  return new Promise((resolve, reject) => {
    axios.get(unitLink)
      .then(response => {
        return resolve(response.data)
      })
      .catch(error => {
        return reject(error);
      })
  })
}

fs.readFile('units.json', 'utf-8', function (err, data) {
  if (err) throw err;
  const units = JSON.parse(data);
  const start = async () => {
    for (const unit of units) {
      await getUnitBio(unit.link).then((data) => {
        const $ = cheerio.load(data);
        const rows = $("table.article-table.tight").first().find("tr");
        rows.each((i, el) => {
          const columns = $(el).find($("td"));
          switch (i) {
            case 1:
              const dataIDHTML = columns.text();
              unit.dataID = dataIDHTML.trim();
              break;
            case 3:
              unit.gender = columns.find('a').attr('title');
              break;
            case 5:
              unit.maxLevel = columns.find('a').html();
              break;
            case 7:
              unit.arenaType = columns.find('a').html();
              break;
            case 8:
              let colosseumLegality = [];
              $(el).find($("a")).each(function (i, el) {
                colosseumLegality[i] = $(this).attr('title');
              })
              unit.colosseumLegality = colosseumLegality;
              break;
          }
        });
      });

      const filename = unit.name.split(' ').join('_');
      fs.writeFile(`data/units/${filename}.json`, JSON.stringify(unit, null, 4), err => {
        if (err) {
          console.log(err);
        }
        console.log(chalk.yellow.bgBlue(`\n Success export unit id ${unit.id}: ${unit.name} to data/units/${filename}. \n`));
      })
    }
  }
  start();
});