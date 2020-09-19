const fsPromises = require('fs').promises;
const { join } = require('path');
const file = join(__dirname, '..', '..', '..', 'src', 'omniunits', 'raw.json');

module.exports = async (req, res) => {
    let name = req.query.name;
    let element = req.query.element;
    let keywords = req.query.keywords;
    const text = await fsPromises.readFile(file, 'utf8');
    const omniUnits = JSON.parse(text);
    let result = omniUnits;

    if (name && element && keywords) {
        result = omniUnits.filter(unit => {
            let unitName = unit.name.toLowerCase();
            let unitElement = unit.element.toLowerCase();
            for (const key of createKeywords(keywords)) {
                for (let keyword of unit.keywords) {
                    keyword = keyword.toLowerCase();
                    if (keyword.includes(key)) {
                        return (unitName.includes(lowerCase(name)) && unitElement.includes(lowerCase(element)));
                    }
                }
            }
        });
    } else if (name)  {
        result = omniUnits.filter(unit => {
            let unitName = unit.name.toLowerCase();
            return unitName.includes(lowerCase(name));
        });
    } else if (element) {
        result = omniUnits.filter(unit => {
            let unitElement = unit.element.toLowerCase();
            return unitElement.includes(lowerCase(element));
        });
    } else if (keywords) {
        result = omniUnits.filter(unit => {
            for (const key of createKeywords(keywords)) {
                if (unit.keywords.length >= 1) {
                    for (let keyword of unit.keywords) {
                        keyword = keyword.toLowerCase();
                        if (keyword.includes(key)) {
                            return unit;
                        }
                    }   
                }
            }
        })
    }

    for (const omniUnit of result) {
        delete omniUnit.artwork;
        delete omniUnit.spRecommendation;
        delete omniUnit.skills;
        delete omniUnit.enhancements;
    }

    res.status(200).send(result);
}

function lowerCase(string) {
    return string.toLowerCase();
}

function createKeywords(string) {
    return string.toLowerCase().replace(/\s*,\s*/g, ",").split(",");
}