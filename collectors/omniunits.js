const fs = require("fs");
const path = require('path');
const chalk = require("chalk");
const { performance } = require('perf_hooks');

const collectUnits = require('../scrapers/units/list.js');
const unitProfiles = require('../scrapers/units/profile.js');
const spUnits = require('../scrapers/units/sp.js');
const milisConverter = require('../helpers/milisconverter.js');

const outputFile = path.join(__dirname, '..', 'data', 'omni-units.json');

console.log(chalk.yellow.bgBlue(`\n Scraping of Brave Frontier units started initiated...\n`));

(async () => {
    const t0 = performance.now();

    try {
        const units = await collectUnits();

        let omniUnits = units.filter(unit => {
            if (unit.rarity.includes('Omni')) {
                // Remove unit cost because I don't need it
                delete unit.cost;
                return unit;
            }
        });

        await unitProfiles(omniUnits);

        await spUnits(omniUnits);

        omniUnits = omniUnits.filter(unit => {
            // Remove unit rarity and link because I don't need it
            delete unit.link;
            delete unit.rarity;
            return unit;
        });

        fs.writeFile(outputFile, JSON.stringify(omniUnits), err => {
            if (err) {
                console.log(err);
            }
            console.log(chalk.yellow.bgBlue(`\n Scraping omni units finish. Success export ${omniUnits.length} units to ${outputFile}. \n`));

            const t1 = performance.now();
            console.log(chalk.yellow.bgBlue(`\n Process took: ${milisConverter(t1 - t0)}. \n`));
        });
    } catch (error) {
        console.log(error);
    }
})();