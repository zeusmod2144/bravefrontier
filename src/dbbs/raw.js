const fs = require("fs");
const fsPromises = fs.promises;
const path = require('path');
const { performance } = require('perf_hooks');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const chalk = require("chalk");
const axios = require("axios");
const outputFile = path.join(__dirname, '..', '..', 'data', 'dbbs', 'raw.json');
const { milisConverter } = require('../helper.js');
const sourceUrl = 'https://bravefrontierglobal.fandom.com/wiki/List_of_Units_with_Dual_Brave_Burst';
const keywords = require('./keywords');
const omniUnitsFile = path.join(__dirname, '..', '..', 'data', 'omniunits', 'raw.json');

(async () => {
    try {
        console.log(chalk.yellow.bgBlue(`\n Scraping dbbs start! \n`));
        const t0 = performance.now();
        const response = await axios.get(sourceUrl);
        const { document } = (new JSDOM(response.data)).window;
        var table = document.querySelector('table.article-table.article-table-selected');

        var rows = Array.from(table.querySelectorAll('tr'));
        // shift first row
        rows.shift();
        var dbbs = [];
        let number = 1;
        for (let i = 0; i < rows.length; i++) {
            var columns = rows[i].querySelectorAll('td');
            let dbbId = number;
            var firstUnitName, firstUnitThumbnail, secondUnitName, secondUnitThumbnail;
            let releaseDate, elementalSynergyName, elementalSynergyDesc, dbbName, dbbDesc;
            for (let j = 0; j < columns.length; j++) {
                var column = columns[j];
                switch (j) {
                    case 0:
                        let firstUnitImg = column.querySelectorAll('a')[0].querySelector('img');
                        if (firstUnitImg.hasAttribute('data-src')) {
                            firstUnitThumbnail = firstUnitImg.getAttribute('data-src');
                        } else {
                            firstUnitThumbnail = firstUnitImg.getAttribute('src');
                        }
                        firstUnitName = column.querySelectorAll('a')[1].textContent.trim();
                        secondUnitName = column.querySelectorAll('a')[3].textContent.trim();
                        let secondUnitImg = column.querySelectorAll('a')[2].querySelector('img');
                        if (secondUnitImg.hasAttribute('data-src')) {
                            secondUnitThumbnail = secondUnitImg.getAttribute('data-src');
                        } else {
                            secondUnitThumbnail = secondUnitImg.getAttribute('src');
                        }
                        releaseDate = column.querySelector('center > small').textContent.replace('Released: ', '').trim();
                        break;
                    case 1:
                        elementalSynergyName = column.childNodes[0].textContent.trim().replace(':', '');
                        elementalSynergyDesc = column.childNodes[1].textContent.trim();

                        break;
                    case 2:
                        dbbName = column.childNodes[0].textContent.replace(':', '').trim();
                        dbbDesc = column.childNodes[1].textContent.trim();
                        break;
                }
            }

            dbbs.push({ firstUnitName, firstUnitThumbnail, secondUnitName, secondUnitThumbnail, releaseDate, elementalSynergyName, elementalSynergyDesc, dbbId, dbbName, dbbDesc });
            number++;
        }

        const omniUnitsText = await fsPromises.readFile(omniUnitsFile, 'utf8');
        const omniUnits = JSON.parse(omniUnitsText);

        // Create keywords, get firstUnitId and secondUnitId
        dbbs.map(dbb => {
            let selectedFirstUnit = {};
            for (let omniUnit of omniUnits) {
                if (omniUnit.name === dbb.firstUnitName) {
                    selectedFirstUnit = omniUnit;
                }
            }
            let selectedSecondUnit = {};
            for (let omniUnit of omniUnits) {
                if (omniUnit.name === dbb.secondUnitName) {
                    selectedSecondUnit = omniUnit;
                }
            }
            let selectedKeywords = [];
            dbbDesc = dbb.dbbDesc.toLowerCase();
            for (const keyword of keywords) {
                if (dbbDesc.includes(keyword.toLowerCase())) {
                    selectedKeywords.push(keyword);
                }
            }
            dbb.keywords = [...new Set(selectedKeywords)];
            dbb.firstUnitId = selectedFirstUnit.id;
            dbb.secondUnitId = selectedSecondUnit.id;
            return dbb;
        });
        
        // Sort by id
        dbbs.sort((a, b) => parseInt(b.dbbId) - parseInt(a.dbbId));

        dbbs.filter(dbb => {
            delete dbb.id;
            return dbb;
        });
        
        fs.writeFile(outputFile, JSON.stringify(dbbs), err => {
            if (err) {
                console.log(err);
            }
            console.log(chalk.yellow.bgBlue(`\n Scraping dbbs finish! Success export ${dbbs.length} dbbs to ${outputFile}. \n`));
    
            const t1 = performance.now();
            console.log(chalk.yellow.bgBlue(`\n Process took: ${milisConverter(t1 - t0)}. \n`));
        });
    } catch (error) {
        console.log(error);
    }

})();