const fsPromises = require('fs').promises;
const { join } = require('path');
const file = join(__dirname, '..', '..', '..', 'src', 'omniunits', 'raw.json');

module.exports = async (req, res) => {
    let name = req.query.name;
    let element = req.query.element;
    const text = await fsPromises.readFile(file, 'utf8');
    const omniUnits = JSON.parse(text);
    omniUnits.sort((a, b) => parseInt(b.id) - parseInt(a.id));
    for (const omniUnit of omniUnits) {
        delete omniUnit.artwork;
        delete omniUnit.spRecommendation;
    }
    let result = omniUnits;

    if (name && element) {
        result = omniUnits.filter(unit => {
            let unitName = unit.name.toLowerCase();
            let unitElement = unit.element.toLowerCase();
            return (unitName.includes(lowerCase(name)) && unitElement.includes(lowerCase(element)));
        });
    } else if (name)  {
        result = omniUnits.filter(unit => {
            let unitName = unit.name.toLowerCase();
            console.log('unit name', unitName);
            console.log('req name', lowerCase(name));
            return unitName.includes(lowerCase(name));
        });
    } else if (element) {
        result = omniUnits.filter(unit => {
            let unitElement = unit.element.toLowerCase();
            return unitElement.includes(lowerCase(element));
        });
    }

    res.status(200).send(result);
}

function lowerCase(string) {
    return string.toLowerCase();
}