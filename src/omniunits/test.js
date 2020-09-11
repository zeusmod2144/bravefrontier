const keywords = require('./keywords.js');
const fsPromises = require('fs').promises;
const { join } = require('path');
const units = require('../units/index.js');
const file = join(__dirname, 'raw.json');

async function foo() {
    // console.log(keywords);
    // console.log(keyword);
    const text = await fsPromises.readFile(file, 'utf8');
    const omniUnits = JSON.parse(text);
    for (const omniUnit of omniUnits) {
        let selectedKeywords = [];
        // console.log(omniUnit);
        // console.log(keyword);
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
        // if (omniUnitSkills.includes(keyword.toLowerCase())) {
        //     selectedKeywords.push(keyword);
        // }
        omniUnit.keywords = [...new Set(selectedKeywords)];
        console.log(omniUnit.name, omniUnit.keywords);
        // omniUnit.keywords = selectedKeywords;
        // console.log(omniUnit.name, omniUnit.keywords);
    }
    return false;
}

foo();