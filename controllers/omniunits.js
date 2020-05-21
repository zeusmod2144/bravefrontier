const collectUnits = require('../scrapers/units/list.js');
const unitProfiles = require('../scrapers/units/profile.js');
const spUnits = require('../scrapers/units/sp.js');

module.exports = async () => {
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

        return omniUnits;
    } catch (error) {
        console.log(error);
    }
}