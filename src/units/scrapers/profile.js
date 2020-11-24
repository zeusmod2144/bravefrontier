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

module.exports = async (units, additional = false) => {
    try {
        for (const unit of units) {
            console.log(`${unit.id}. ${unit.name}: start`);
            await getUnitBio(unit.link).then((data) => {
                const { document } = (new JSDOM(data)).window;
                if (additional) {
                    const rows = Array.from(document.querySelector('table.article-table.tight').querySelectorAll('tr'));
                    for (let index = 0; index < rows.length; index++) {
                        const column = rows[index].querySelector('td');
                        switch (index) {
                            case 1:
                                unit.dataID = column.textContent.trim();
                                break;
                            case 3:
                                const genderAttr = column.querySelector('a').getAttribute('title');
                                unit.gender = genderAttr.replace('Category:', '');
                                break;
                            case 5:
                                unit.maxLevel = column.querySelector('a').innerHTML;
                                break;
                            case 7:
                                unit.arenaType = column.querySelector('a').innerHTML;
                                break;
                            case 8:
                                let colosseumLegality = [];
                                const colosseumLink = Array.from(column.querySelectorAll('a'));
                                for (let j = 0; j < colosseumLink.length; j++) {
                                    colosseumLegality.push(colosseumLink[j].getAttribute('title').replace('Category:', ''));
                                }
                                unit.colosseumLegality = colosseumLegality;
                                break;
                        }
                    }
                }

                const unitArtwork = document.querySelector('div.tabbertab div center a img').getAttribute('src');
                // unit.artwork = unitArtwork.replace('/scale-to-width-down/330', '');
                unit.artwork = unitArtwork;
            });
            console.log(`${unit.id}. ${unit.name}: done`);
        }
    } catch (error) {
        console.error(error);
    }
}