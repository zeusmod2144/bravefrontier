const fs = require('fs');
const cheerio = require('cheerio');
const axios = require('axios');
const chalk = require("chalk");
const outputFile = 'units.json';

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
      console.log(chalk.blue(`${unit.id}. ${unit.name}: start`));
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

        const unitArtwork = $("div.tabbertab center a img").attr('data-src');
        unit.artwork = unitArtwork.replace('/scale-to-width-down/330', '');
      });
      console.log(chalk.green(`${unit.id}. ${unit.name}: done`));
    }
    

    fs.writeFile('units.json', JSON.stringify(units, null, 4), err => {
      if (err) {
        console.log(err);
      }

      console.log(chalk.yellow.bgBlue(`\n Success update data ${units.length} units to ${outputFile}. \n`));
    })
  }
  start();
});