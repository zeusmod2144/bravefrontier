const fs = require("fs");
const path = require('path');
const chalk = require("chalk");
const { performance } = require('perf_hooks');

const scrapeUnits = require('./scrape/units.js');
const profileUnits = require('./scrape/profile_units.js');
const spUnits = require('./scrape/sp_units.js');
const milisConverter = require('./helpers/milis_converter.js');

const outputFile = path.join(__dirname, '..', 'data', 'omni-units.json');

console.log(chalk.yellow.bgBlue(`\n Scraping of Brave Frontier units started initiated...\n`));

(async () => {
    const t0 = performance.now();

    try {
        const units = await scrapeUnits.collectUnits();

        const omniUnits = units.filter(unit => {
            if (unit.rarity.includes('Omni')) {
                // Remove unit cost because I don't need it
                delete unit.cost;
                return unit;
            }
        });

        await profileUnits.scrape(omniUnits);

        await spUnits.scrape(omniUnits);

        fs.writeFile(outputFile, JSON.stringify(omniUnits), err => {
            if (err) {
                console.log(err);
            }
            console.log(chalk.yellow.bgBlue(`\n Scraping omni units finish. Success export ${omniUnits.length} units to ${outputFile}. \n`));

            const t1 = performance.now();
            console.log(chalk.yellow.bgBlue(`\n Process took: ${milisConverter.toMinutesAndSeconds(t1 - t0)}. \n`));
        });
    } catch (error) {
        console.log(error);
    }
})();