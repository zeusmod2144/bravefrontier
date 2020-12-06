const fsPromises = require('fs').promises;
const { join } = require('path');
const file = join(__dirname, '..', '..', '..', 'data', 'dbbs', 'raw.json');

module.exports = async (req, res) => {
    let esname = req.query.esname;
    let unitname = req.query.unitname;
    const text = await fsPromises.readFile(file, 'utf8');
    const dbbs = JSON.parse(text);
    let result = dbbs;

    if (esname && unitname) {
        result = dbbs.filter(dbb => {
            let esName = dbb.elementalSynergyName.toLowerCase();
            let firstUnitName = dbb.firstUnitName.toLowerCase();
            let secondUnitName = dbb.secondUnitName.toLowerCase();
            if (lowerCase(esname) === esName) {
                if (firstUnitName.includes(lowerCase(unitname)) || secondUnitName.includes(lowerCase(unitname))) {
                    return dbb;
                }
            }
        });
    } else if (esname)  {
        result = dbbs.filter(dbb => {
            let esName = dbb.elementalSynergyName.toLowerCase();
            if (lowerCase(esname) === esName) {
                return dbb;
            }
        });
    } else if (unitname) {
        result = dbbs.filter(dbb => {
            let firstUnitName = dbb.firstUnitName.toLowerCase();
            let secondUnitName = dbb.secondUnitName.toLowerCase();
            if (firstUnitName.includes(lowerCase(unitname)) || secondUnitName.includes(lowerCase(unitname))) {
                return dbb;
            }
        });
    }

    res.status(200).send(result);
}

function lowerCase(string) {
    return string.toLowerCase();
}