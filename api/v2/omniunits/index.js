const fsPromises = require('fs').promises;
const { join } = require('path');
const file = join(__dirname, '..', '..', '..', 'src', 'omniunits', 'data.json');

module.exports = async (req, res) => {
    let name = req.query.name;
    let element = req.query.element;
    const text = await fsPromises.readFile(file, 'utf8');
    const omniUnits = JSON.parse(text);
    for (const omniUnit of omniUnits) {
        delete omniUnit.spRecommendation;
    }
    let result = omniUnits;

    if (name && element) {
        result = omniUnits.filter(unit => {
            return unit.name.includes(capitalizeFirstLetter(name)) && unit.element === capitalizeFirstLetter(element);
        });
    } else if (name)  {
        result = omniUnits.filter(unit => {
            return unit.name.includes(capitalizeFirstLetter(name));
        });
    } else if (element) {
        result = omniUnits.filter(unit => {
            return unit.element === capitalizeFirstLetter(element);
        });
    }

    res.status(200).send(result);
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}