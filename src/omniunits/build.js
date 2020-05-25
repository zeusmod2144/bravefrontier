const fs = require('fs');
const fsPromises = fs.promises;
const { join } = require('path');
const rawFile = join(__dirname, 'raw.json');
const outputFile = join(__dirname, 'data.json');

(async () => {
    try {
        const text = await fsPromises.readFile(rawFile, 'utf8');
        const omniUnits = JSON.parse(text);
        for (const omniUnit of omniUnits) {
            delete omniUnit.artwork;
            delete omniUnit.thumbnail;
        }

        fs.writeFile(outputFile, JSON.stringify(omniUnits), err => {
            if (err) {
                console.log(err);
            }
        });
    } catch (error) {
        console.log(error);
    }
})();