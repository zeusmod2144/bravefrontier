const fs = require("fs");
const path = require('path');
const chalk = require("chalk");
const { performance } = require('perf_hooks');

const getOmniUnits = require('./index.js');
const outputFile = path.join(__dirname, '..', '..', 'data', 'omniunits', 'raw.json');
const { milisConverter } = require('../helper.js');

(async () => {
    const t0 = performance.now();

    console.log(chalk.yellow.bgBlue(`\n Scraping of Brave Frontier units started initiated...\n`));
    
    const omniUnits = await getOmniUnits();

    fs.writeFile(outputFile, JSON.stringify(omniUnits), err => {
        if (err) {
            console.log(err);
        }
        console.log(chalk.yellow.bgBlue(`\n Scraping omni units finish. Success export ${omniUnits.length} units to ${outputFile}. \n`));

        const t1 = performance.now();
        console.log(chalk.yellow.bgBlue(`\n Process took: ${milisConverter(t1 - t0)}. \n`));
    });
})();