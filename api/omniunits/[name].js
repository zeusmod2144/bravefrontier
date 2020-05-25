const fsPromises = require('fs').promises;
const { join } = require('path');
const file = join(__dirname, '..', '..', 'src', 'omniunits', 'raw.json');

module.exports = async (req, res) => {
    const {
        query: { name }
    } = req;

    const text = await fsPromises.readFile(file, 'utf-8');
    const omniUnits = JSON.parse(text);
    let selectedUnit = {};
    for (let omniUnit of omniUnits) {
        if (omniUnit.name === name.split('_').join(' ').trim()) {
            selectedUnit = omniUnit;
        }
    }

    const statusCode = (selectedUnit.hasOwnProperty('name')) ? 200 : 404;
    const result = (selectedUnit.hasOwnProperty('name')) 
        ? selectedUnit 
        : { message : `Unit ${name} not found` };

    res.status(statusCode).send(result);
}