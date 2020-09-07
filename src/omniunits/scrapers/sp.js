const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const axios = require('axios');

const getUnitSP = link => {
    return new Promise((resolve, reject) => {
        axios.get(link)
            .then(response => resolve(response.data))
            .catch(error => reject(error));
    });
}

module.exports = async (omniUnits) => {
    try {
        for (const unit of omniUnits) {
            console.log(`${unit.id}. ${unit.name}: start`);
            await getUnitSP(`${unit.link}/Builds`).then((data) => {
                const { document } = (new JSDOM(data)).window;
                var contents = Array.from(document.querySelectorAll('div[style="float:left; width: 640px; margin: 0 0.5em 0 0.5em;"]'));

                // Remove first index of contents
                var enhancementsTable = contents.shift();
                var enhancementsBody = enhancementsTable.querySelector('div > table:nth-of-type(2) tbody');
                var enhancementsRows = Array.from(enhancementsBody.querySelectorAll('tr'));

                // Remove first and second rows
                enhancementsRows.shift();
                enhancementsRows.shift();

                var enhancements = [];
                for (let i = 0; i < enhancementsRows.length; i++) {
                    var row = enhancementsRows[i];
                    var columns = row.querySelectorAll('td');
                    for (let j = 0; j < columns.length; j++) {
                        var column = columns[j];
                        var cost, option, detail_option;
                        if (row.querySelectorAll('td').length > 1) {
                            if (j === 2) {
                                cost = parseInt(column.textContent.trim());
                            }

                            if (j === 3) {
                                option = column.childNodes[0].textContent.trim();
                                if (column.querySelector('span')) {
                                    detail_option = column.childNodes[1].textContent.trim();
                                }
                            }
                        }
                    }
                    enhancements.push({ cost, option, detail_option });
                }
                unit.enhancements = enhancements;

                if (Array.isArray(contents) && contents.length > 0) {
                    var spRecommendation = [];
                    for (i = 0; i < contents.length; i++) {
                        var content = contents[i];

                        var body = content.querySelector('table[class="article-table tight"] tbody');
                        if (body !== null) {
                            var analysis;
                            var title = content.querySelector('h2 > span').textContent;
                            var rows = Array.from(body.querySelectorAll('tr'));
                            // Pattern: remove the first of three rows.
                            rows.shift();
                            rows.shift();
                            rows.shift();

                            var sp = [];
                            var newRows = [];
                            rows.filter(row => {
                                if (!row.hasAttribute('style')) {
                                    newRows.push(row);
                                }
                            });

                            for (let j = 0; j < newRows.length; j++) {
                                var row = newRows[j];
                                var columns = row.querySelectorAll('td');
                                for (let k = 0; k < columns.length; k++) {
                                    var column = columns[k];
                                    var cost, option;
                                    if (row.querySelectorAll('td').length > 1) {
                                        if (k === 0) {
                                            cost = parseInt(column.textContent.trim());
                                        } else {
                                            option = column.textContent.trim();
                                        }
                                    } else {
                                        analysis = column.textContent.trim();
                                    }
                                }
                                sp.push({ cost, option });
                            }

                            var filteredSP = sp.filter(function ({ cost, option }) {
                                var key = `${cost}${option}`;
                                return !this.has(key) && this.add(key);
                            }, new Set);

                            var initialValue = 0;
                            var total = filteredSP.reduce((accumulator, currentValue) => {
                                return accumulator + currentValue.cost;
                            }, initialValue);

                            spRecommendation.push({ title, analysis, total, list: filteredSP });
                            unit.spRecommendation = spRecommendation;
                        }
                    }
                }
            })
                .catch(error => {
                    console.log(error.response.statusText);
                })
            console.log(`${unit.id}. ${unit.name}: done`);
        }
    } catch (error) {
        console.log(error);
    }
}