// Store to nosql
require('dotenv').config();
const path = require('path');
const mongoose = require('mongoose');
const Unit = require('./models/unit.js');
const fsPromises = require('fs').promises;
mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true });

const omniUnitsFile = path.join(__dirname, '..', 'data', 'omni-units.json');
console.log(omniUnitsFile);

(async () => {
    const result = await fsPromises.readFile(omniUnitsFile, 'utf-8');
    const omniUnits = JSON.parse(result);

    const db = mongoose.connection;
    db.on('error', console.error.bind(console, 'connection error'));
    db.once('open', () => console.log('connected'));

    // Remove all documents
    await Unit.remove();

    for (const omniUnit of omniUnits) {
        const unit = new Unit(omniUnit);
        let saveUnit = await unit.save();
        console.log(saveUnit.name);
    }

    process.exit();
})();