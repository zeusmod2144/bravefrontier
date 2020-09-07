const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const axios = require('axios');

const getUnitBio = (unitLink) => {
    return new Promise((resolve, reject) => {
        axios.get(unitLink)
            .then(response => {
                return resolve(response.data)
            })
            .catch(error => {
                return reject(error);
            })
    })
}

module.exports = async (units) => {
    try {
        for (const unit of units) {
            console.log(`${unit.id}. ${unit.name}: start get ls, es, bb, sbb, ubb`);
            await getUnitBio(unit.link).then((data) => {
                const { document } = (new JSDOM(data)).window;
                var $skills = document.querySelector('div[style="line-height:1.25;"]');

                var lsName = $skills.querySelector('div[style="padding:3px 12px;white-space:nowrap;"]').textContent.replace('Leader Skill:', '').trim();
                var lsDesc = $skills.querySelectorAll('div[style="padding:3px 12px 6px 12px;"]')[0].childNodes[0].textContent.trim();
                var ls = { lsName, lsDesc };

                var esName = $skills.querySelectorAll('div[style="border-top:1px solid #ccc; padding:3px 12px;white-space:nowrap;"]')[0].querySelector('b').textContent.replace('Extra Skill:', '').trim();
                var esDesc = $skills.querySelectorAll('div[style="padding:3px 12px 6px 12px;"]')[1].childNodes[0].textContent.trim();
                var es = { esName, esDesc };

                var bbName = $skills.querySelectorAll('div[style="border-top:1px solid #ccc; padding:3px 12px;white-space:nowrap;"]')[1].querySelector('i').textContent.trim();
                var bbDesc = $skills.querySelectorAll('div[style="padding:3px 12px 6px 12px;"]')[2].childNodes[0].textContent.trim();
                var bb = { bbName, bbDesc };

                var sbbName = $skills.querySelectorAll('div[style="border-top:1px solid #ccc; padding:3px 12px;white-space:nowrap;"]')[2].querySelector('i').textContent.trim();
                var sbbDesc = $skills.querySelectorAll('div[style="padding:3px 12px 6px 12px;"]')[3].childNodes[0].textContent.trim();
                var sbb = { sbbName, sbbDesc };

                var ubbName = $skills.querySelectorAll('div[style="border-top:1px solid #ccc; padding:3px 12px;white-space:nowrap;"]')[3].querySelector('i').textContent.trim();
                var ubbDesc = $skills.querySelectorAll('div[style="padding:3px 12px 6px 12px;"]')[4].childNodes[0].textContent.trim();
                var ubb = { ubbName, ubbDesc };

                var skills = [];
                skills.push(ls, es, bb, sbb, ubb);
                unit.skills = skills;
            });
            console.log(`${unit.id}. ${unit.name}: done get ls, es, bb, sbb, ubb`);
        }
    } catch (error) {
        console.error(error);
    }
}