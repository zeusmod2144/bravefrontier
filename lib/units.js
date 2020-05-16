const fs = require("fs");
const path = require('path');
const chalk = require("chalk");
const { performance } = require('perf_hooks');

const scrapeUnits = require('./scrape/units.js');
const milisConverter = require('../utils/milis_converter.js');

const outputFile = path.join(__dirname, '..', 'data', 'units.json');

console.log(chalk.yellow.bgBlue(`\n Scraping of Brave Frontier units started initiated...\n`));

(async () => {
    const t0 = performance.now();

    const units = await scrapeUnits.collectUnits();
    fs.writeFile(outputFile, JSON.stringify(units, null, 4), err => {
        if (err) {
            console.log(err);
        }
        
        console.log(chalk.yellow.bgBlue(`\n Scraping Brave Frontier units finish. Success export ${units.length} units to ${outputFile}. \n`));
        
        const t1 = performance.now();
        console.log(chalk.yellow.bgBlue(`\n Process took: ${milisConverter.toMinutesAndSeconds(t1 - t0)}. \n`));
    });
})();