const cheerio = require("cheerio");
const fs = require("fs");
const chalk = require("chalk");
const axios = require("axios");
const { performance } = require('perf_hooks');

const rootUrl = "https://bravefrontierglobal.fandom.com";
const firstMainSeriesUrl = "https://bravefrontierglobal.fandom.com/wiki/Unit_List";
const firstGlobalExclusiveSeriesUrl = "https://bravefrontierglobal.fandom.com/wiki/Unit_List:7000";
const mainUnits = [];
const exclusiveUnits = [];
const outputFile = '../data/units.json';

console.log(chalk.yellow.bgBlue(`\n Scraping of Brave Frontier units started initiated...\n`));

const getMainSeriesUnits = async (url) => {
  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    const rows = $("table.wikitable tbody").first().find("tr");
    let id, name, link, thumbnail, element, rarity, cost;
    rows.each((i, el) => {
      const columns = $(el).find($("td"));
      columns.each((i, el) => {
        switch (i) {
          case 0:
            id = $(el).find("center").text();
            break;
          case 1:
            if (typeof $(el).find("a > img").attr("data-src") !== "undefined") {
              thumbnail = $(el).find("a > img").attr("data-src");
            } else {
              thumbnail = $(el).find("a > img").attr("src");
            }
            const findPathThumbnail = "/scale-to-width-down/42";
            const regex = new RegExp(findPathThumbnail, 'g');
            thumbnail = thumbnail.replace(regex, '');
            name = $(el).find("a").last().attr("title");
            link = `${rootUrl}${$(el).find("a").last().attr("href")}`;
            break;
          case 2:
            const elementAttr = $(el).find("center > a").attr("title");
            element = elementAttr.replace('Category:', '');
            break;
          case 3:
            const rarityAttr = $(el).find("center > a").attr("title");
            rarity = rarityAttr.replace('Category:', '');
            break;
          case 4:
            const constAttr = $(el).find("center > a").attr("title");
            cost = constAttr.replace('Category:Cost', '');
            break;
        }
      })
      mainUnits.push({
        id, name, link, thumbnail, element, rarity, cost
      });
    });

    // Recursion start
    const nextPageHref = $('div#mw-content-text > div > p').find('strong').next().attr('href');

    if (nextPageHref === undefined) {
      return mainUnits;
    }

    nextUrl = `${rootUrl}${nextPageHref}`;
    console.log(chalk.cyan(`Scraping next url: ${nextUrl}`));

    return await getMainSeriesUnits(nextUrl);
    // Recursion end
  } catch (error) {
    console.error(error);
  }
}

const getGlobalExclusiveSeriesUnits = async (url) => {
  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    const rows = $("table.wikitable tbody").first().find("tr");
    let id, name, link, thumbnail, element, rarity, cost;
    rows.each((i, el) => {
      const columns = $(el).find($("td"));
      columns.each((i, el) => {
        switch (i) {
          case 0:
            id = $(el).find("center").text();
            break;
          case 1:
            if (typeof $(el).find("a > img").attr("data-src") !== "undefined") {
              thumbnail = $(el).find("a > img").attr("data-src");
            } else {
              thumbnail = $(el).find("a > img").attr("src");
            }
            const findPathThumbnail = "/scale-to-width-down/42";
            const regex = new RegExp(findPathThumbnail, 'g');
            thumbnail = thumbnail.replace(regex, '');
            name = $(el).find("a").last().attr("title");
            link = `${rootUrl}${$(el).find("a").last().attr("href")}`;
            break;
          case 2:
            const elementAttr = $(el).find("center > a").attr("title");
            element = elementAttr.replace('Category:', '');
            break;
          case 3:
            const rarityAttr = $(el).find("center > a").attr("title");
            rarity = rarityAttr.replace('Category:', '');
            break;
          case 4:
            const constAttr = $(el).find("center > a").attr("title");
            cost = constAttr.replace('Category:Cost', '');
            break;
        }
      })
      exclusiveUnits.push({
        id, name, link, thumbnail, element, rarity, cost
      });
    });

    // Recursion start
    const nextPageHref = $('div#mw-content-text > div > div > p').find('strong').next().attr('href');

    if (nextPageHref === undefined) {
      return exclusiveUnits;
    }

    nextUrl = `${rootUrl}${nextPageHref}`;
    console.log(chalk.cyan(`Scraping next url: ${nextUrl}`));

    return await getGlobalExclusiveSeriesUnits(nextUrl);
    // Recursion end
  } catch (error) {
    console.error(error);
  }
}

async function collectUnits() {
  const t0 = performance.now();

  let [mainUnits, exclusiveUnits] = await Promise.all([getMainSeriesUnits(firstMainSeriesUrl), getGlobalExclusiveSeriesUnits(firstGlobalExclusiveSeriesUrl)]);

  let result = [...mainUnits, ...exclusiveUnits];

  const units = [];
  // Filter from an object that has undefined values
  for (const unit of result) {
    if (!Object.values(unit).includes(undefined)) {
      units.push(unit);
    }
  }

  // Remove duplicate unit object
  const filteredUnits = units.filter(function ({ id, name }) {
    const key = `${id}${name}`;
    return !this.has(key) && this.add(key);
  }, new Set);

  // Update units data
  const updatedUnits = await updateUnitsData(filteredUnits);

  // Store the result to units.json file
  fs.writeFile(outputFile, JSON.stringify(updatedUnits, null, 4), err => {
    if (err) {
      console.log(err);
    }
    console.log(chalk.yellow.bgBlue(`\n Scraping Brave Frontier units finish. Success export ${updatedUnits.length} units to ${outputFile}. \n`));
  });

  const t1 = performance.now();
  console.log(chalk.yellow.bgBlue(`\n Process took: ${millisToMinutesAndSeconds(t1 - t0)}. \n`));
}

function millisToMinutesAndSeconds(millis) {
  var minutes = Math.floor(millis / 60000);
  var seconds = ((millis % 60000) / 1000).toFixed(0);
  return `${ (seconds == 60 ? (minutes + 1) : minutes) } ${ (minutes > 1) ? "minutes" : "minute" } and ${ (seconds < 10 ? "0" : seconds) } ${ (seconds > 1 ? "seconds" : "second") }`;
}

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

const updateUnitsData = async (units) => {
  try {
    for (const unit of units) {
      console.log(chalk.blue(`${unit.id}. ${unit.name}: start`));
      await getUnitBio(unit.link).then((data) => {
        const $ = cheerio.load(data);
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

        const unitArtwork = $("div.tabbertab center a img").attr('data-src');
        unit.artwork = unitArtwork.replace('/scale-to-width-down/330', '');
      });
      console.log(chalk.green(`${unit.id}. ${unit.name}: done`));
    }
    return units;
  } catch (error) {
    console.error(error);
  }
}

collectUnits();