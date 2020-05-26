const cheerio = require('cheerio');
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
                const $ = cheerio.load(data);
                if (additional) {
                    const rows = $("table.article-table.tight").first().find("tr");
                    rows.each((i, el) => {
                        const columns = $(el).find($("td"));
                        switch (i) {
                            case 1:
                                const dataIDHTML = columns.text();
                                unit.dataID = dataIDHTML.trim();
                                break;
                            case 3:
                                const genderAttr = columns.find('a').attr('title');
                                unit.gender = genderAttr.replace('Category:', '');
                                break;
                            case 5:
                                unit.maxLevel = columns.find('a').html();
                                break;
                            case 7:
                                unit.arenaType = columns.find('a').html();
                                break;
                            case 8:
                                let colosseumLegality = [];
                                $(el).find($("a")).each(function (i, el) {
                                    const colosseumAttr = $(this).attr('title');
                                    colosseumLegality[i] = colosseumAttr.replace('Category:', '');
                                })
                                unit.colosseumLegality = colosseumLegality;
                                break;
                        }
                    });   
                }

                const unitArtwork = $("div.tabbertab center a img").attr('data-src');
                // unit.artwork = unitArtwork.replace('/scale-to-width-down/330', '');
                unit.artwork = unitArtwork;
            });
            console.log(`${unit.id}. ${unit.name}: done`);
        }
    } catch (error) {
        console.error(error);
    }
}