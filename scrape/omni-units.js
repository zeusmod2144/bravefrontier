const fs = require("fs");
const path = require('path');
const chalk = require("chalk");
const axios = require("axios");
const { performance } = require('perf_hooks');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const fsPromises = require('fs').promises;


const baseFile = path.join(__dirname, '..', 'data', 'units.json');
const outputFile = path.join(__dirname, '..', 'data', 'omni-units.json');

const getUnitSP = link => {
  return new Promise((resolve, reject) => {
    axios.get(link)
      .then(response => resolve(response.data))
      .catch(error => reject(error));
  });
}

const updateOmniUnits = async () => {
  const t0 = performance.now();
  try {
    const result = await fsPromises.readFile(baseFile, 'utf8');
    omniUnits = JSON.parse(result).filter(unit => {
      if (unit.rarity.includes('Omni')) {
        return unit;
      }
    });

    for (const unit of omniUnits) {
      console.log(`${unit.name}: start`);
      await getUnitSP(`${unit.link}/Builds`).then((data) => {
        const { document } = (new JSDOM(data)).window;
        var contents = Array.from(document.querySelectorAll('div[style="float:left; width: 640px; margin: 0 0.5em 0 0.5em;"]'));

        // Remove first index of contents
        contents.shift();

        if (Array.isArray(contents) && contents.length > 0) {
          var spRecommendation = [];
          for (i = 0; i < contents.length; i++) {
            var content = contents[i];

            var body = content.querySelector('table[class="article-table tight"] tbody');
            if (body !== null) {
              var title = content.querySelector('h2 > span').textContent;
              var rows = Array.from(body.querySelectorAll('tr'));
              // Pattern: remove the first of three rows.
              rows.shift();
              rows.shift();
              rows.shift();

              var sp = [];
              var newRows = [];
              rows.filter(row => {
                if (!row.hasAttribute('style')) {
                  newRows.push(row);
                }
              });

              for (let j = 0; j < newRows.length; j++) {
                var row = newRows[j];
                var columns = row.querySelectorAll('td');
                for (let k = 0; k < columns.length; k++) {
                  var column = columns[k];
                  var cost, option, analysis;
                  if (row.querySelectorAll('td').length > 1) {
                    if (k === 0) {
                      cost = column.textContent.trim();
                    } else {
                      option = column.textContent.trim();
                    }
                  } else {
                    analysis = column.textContent.trim();
                  }
                }
                sp.push({ cost, option });
                if (j === (newRows.length - 1)) {
                  sp.push({ analysis });
                }
              }

              var filteredSP = sp.filter(function ({ cost, option }) {
                var key = `${cost}${option}`;
                return !this.has(key) && this.add(key);
              }, new Set);

              filteredSP.push({ title });
              spRecommendation.push(filteredSP);
              unit.spRecommendation = spRecommendation;

              // delete unnecessary property of object
              delete unit.id;
              delete unit.link;
              delete unit.rarity;
              delete unit.dataID;
              delete unit.maxLevel;
              delete unit.arenaType;
              delete unit.colosseumLegality;
            }
          }
        }
      })
        .catch(error => {
          console.log(error.response.statusText);
        })
      console.log(`${unit.name}: done`);
    }
  } catch (error) {
    console.log(error);
  }

  fs.writeFile(outputFile, JSON.stringify(omniUnits), err => {
    if (err) {
      console.log(err);
    }
    console.log(chalk.yellow.bgBlue(`\n Scraping omni units finish. Success export ${omniUnits.length} units to ${outputFile}. \n`));
  });

  const t1 = performance.now();
  console.log(chalk.yellow.bgBlue(`\n Process took: ${millisToMinutesAndSeconds(t1 - t0)}. \n`));
}

function millisToMinutesAndSeconds(millis) {
  var minutes = Math.floor(millis / 60000);
  var seconds = ((millis % 60000) / 1000).toFixed(0);
  return `${(seconds == 60 ? (minutes + 1) : minutes)} ${(minutes > 1) ? "minutes" : "minute"} and ${(seconds < 10 ? "0" : seconds)} ${(seconds > 1 ? "seconds" : "second")}`;
}

updateOmniUnits();