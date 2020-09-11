const collectUnits = require('../units/index.js');
const unitProfiles = require('../units/scrapers/profile.js');
const omniUnitProfiles = require('./scrapers/profile.js');
const spUnits = require('./scrapers/sp.js');
const { isJapaneseAndChineseChars } = require('../helper.js');

module.exports = async () => {
    try {
        const units = await collectUnits();

        let omniUnits = units.filter(unit => {
            if (unit.rarity.includes('Omni') && !isJapaneseAndChineseChars(unit.name)) {
                // Remove cost and rarity property because I don't need it
                delete unit.rarity;
                delete unit.cost;
                return unit;
            }
        });

        await unitProfiles(omniUnits);
        await omniUnitProfiles(omniUnits);
        await spUnits(omniUnits);

        omniUnits = omniUnits.filter(unit => {
            // Remove link property because I don't need it
            delete unit.link;
            return unit;
        });

        for (const omniUnit of omniUnits) {
            let selectedKeywords = [];
            const omniUnitSkills = [];
            for (const skill of omniUnit.skills) {
                if (skill.lsDesc !== undefined) {
                    omniUnitSkills.push(skill.lsDesc.toLowerCase());
                }
    
                if (skill.esDesc !== undefined) {
                    omniUnitSkills.push(skill.esDesc.toLowerCase());
                }
    
                if (skill.bbDesc !== undefined) {
                    omniUnitSkills.push(skill.bbDesc.toLowerCase());
                }
    
                if (skill.sbbDesc !== undefined) {
                    omniUnitSkills.push(skill.sbbDesc.toLowerCase());
                }
    
                if (skill.ubbDesc !== undefined) {
                    omniUnitSkills.push(skill.ubbDesc.toLowerCase());
                }
            }
    
            for (const omniUnitSkill of omniUnitSkills) {
                for (const keyword of keywords) {
                    if (omniUnitSkill.includes(keyword)) {
                        selectedKeywords.push(keyword);
                    }
                }
            }
            omniUnit.keywords = [...new Set(selectedKeywords)];
        }

        return omniUnits;
    } catch (error) {
        console.log(error);
    }
}