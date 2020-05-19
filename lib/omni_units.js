require('dotenv').config();
const fs = require("fs");
const path = require('path');
const chalk = require("chalk");
const { performance } = require('perf_hooks');
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true });

console.log(process.env.MONGO_URL);

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

        const db = mongoose.connection;
        db.on('error', console.error.bind(console, 'connection error'));
        db.once('open', function () {
            console.log('connected');
        });

        const unitSchema = new mongoose.Schema({
            id: String,
            name: String,
            link: String,
            thumbnail: String,
            element: String,
            rarity: String,
            artwork: String,
            spRecommendation: []
        });

        const Unit = new mongoose.model('Unit', unitSchema);

        // Remove all documents
        await Unit.remove();

        for (const omniUnit of omniUnits) {
            const unit = new Unit(omniUnit);
            let saveUnit = await unit.save();
            console.log(saveUnit.name);
        }

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