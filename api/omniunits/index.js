const fsPromises = require('fs').promises;
const { join } = require('path');
const file = join(__dirname, '..', '..', 'src', 'omniunits', 'data.json');

module.exports = async (req, res) => {
    const text = await fsPromises.readFile(file, 'utf8');
    const omniUnits = JSON.parse(text);
    for (const omniUnit of omniUnits) {
        delete omniUnit.id;
        delete omniUnit.artwork;
        delete omniUnit.spRecommendation;
    }
    res.status(200).send(omniUnits);
}