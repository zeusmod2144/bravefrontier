const fs = require("fs");
const path = require('path');
const { performance } = require('perf_hooks');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const chalk = require("chalk");
const axios = require("axios");
const outputFile = path.join(__dirname, 'raw.json');
const { milisConverter } = require('../helper.js');
const sourceUrl = 'https://bravefrontierglobal.fandom.com/wiki/List_of_Units_with_Dual_Brave_Burst';

(async () => {
    try {
        console.log(chalk.yellow.bgBlue(`\n Scraping dbbs start! \n`));
        const t0 = performance.now();
        const response = await axios.get(sourceUrl);
        const { document } = (new JSDOM(response.data)).window;
        var table = document.querySelector('table.article-table.article-table-selected');

        var rows = Array.from(table.querySelectorAll('tr'));
        // shift first row
        rows.shift();
        var dbbs = [];
        for (let i = 0; i < rows.length; i++) {
            var columns = rows[i].querySelectorAll('td');
            var firstUnit, secondUnit, releaseDate, elementalSynergyName, elementalSynergyDesc, dbbName, dbbDesc;
            for (let j = 0; j < columns.length; j++) {
                var column = columns[j];
                switch (j) {
                    case 0:
                        firstUnit = column.querySelectorAll('a')[1].textContent.trim();
                        secondUnit = column.querySelectorAll('a')[3].textContent.trim();
                        releaseDate = column.querySelector('center > small').textContent.replace('Released: ', '').trim();
                        break;
                    case 1:
                        elementalSynergyName = column.childNodes[0].textContent.trim().replace(':', '');
                        elementalSynergyDesc = column.childNodes[1].textContent.trim();

                        break;
                    case 2:
                        dbbName = column.childNodes[0].textContent.replace(':', '').trim();
                        dbbDesc = column.childNodes[1].textContent.trim();
                        break;
                }
            }
            dbbs.push({ firstUnit, secondUnit, releaseDate, elementalSynergyName, elementalSynergyDesc, dbbName, dbbDesc });

            fs.writeFile(outputFile, JSON.stringify(dbbs), err => {
                if (err) {
                    console.log(err);
                }
                console.log(chalk.yellow.bgBlue(`\n Scraping dbbs finish! Success export ${dbbs.length} dbbs to ${outputFile}. \n`));
        
                const t1 = performance.now();
                console.log(chalk.yellow.bgBlue(`\n Process took: ${milisConverter(t1 - t0)}. \n`));
            });
        }
    } catch (error) {
        console.log(error);
    }

})();