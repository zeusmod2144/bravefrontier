const cheerio = require("cheerio");
const fs = require("fs");
const chalk = require("chalk");
const axios = require("axios");
const { performance } = require('perf_hooks');

const rootUrl = "https://bravefrontierglobal.fandom.com";
const sphereFirstUrl = "https://bravefrontierglobal.fandom.com/wiki/Category:1%E2%98%85_Rarity_(Item)";
const spheres = [];
const outputFile = '../data/spheres.json';

console.log(chalk.yellow.bgBlue(`\n Scraping of Brave Frontier spheres started initiated...\n`));

const getSpheres = async (url) => {
  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    const buildUrl = new URL(url);
    const pathArray = buildUrl.pathname.split('/');
    const newPathArray = pathArray.filter(item => item !== "");
    const categoryString = newPathArray[1];
    const rarity = categoryString.substr(9, 1);

    const contents = $('div.category-page__members ul.category-page__members-for-char').find('li > a');

    contents.each((i, el) => {
      let name, link;
      name = $(el).attr('title');
      link = `${rootUrl}${$(el).attr('href')}`;
      spheres.push({
        name, link, rarity
      });
    });
    
    // Recursion start
    const nextPageHref = $('div#mw-content-text p:nth-of-type(2)').find('strong').next().attr('href');

    if (nextPageHref === undefined) {
      return spheres;
    }

    const nextUrl = `${rootUrl}${nextPageHref}`;
    console.log(chalk.cyan(`Scraping next url: ${nextUrl}`));

    return await getSpheres(nextUrl);
    // Recursion end
  } catch (error) {
    console.log(error);
  }
}

async function collectSpheres() {
  const t0 = performance.now();

  let spheres = await getSpheres(sphereFirstUrl);
  
  const updatedSpheres = await updateSpheresData(spheres); 

  // Store the result to spheres.json file
  fs.writeFile(outputFile, JSON.stringify(updatedSpheres, null, 4), err => {
    if (err) {
      console.log(err);
    }
    console.log(chalk.yellow.bgBlue(`\n Scraping Brave Frontier spheres finish. Success export ${spheres.length} spheres to ${outputFile}. \n`));
  });

  const t1 = performance.now();
  console.log(chalk.yellow.bgBlue(`\n Process took: ${millisToMinutesAndSeconds(t1 - t0)}. \n`));
}

function millisToMinutesAndSeconds(millis) {
  var minutes = Math.floor(millis / 60000);
  var seconds = ((millis % 60000) / 1000).toFixed(0);
  return `${ (seconds == 60 ? (minutes + 1) : minutes) } ${ (minutes > 1) ? "minutes" : "minute" } and ${ (seconds < 10 ? "0" : seconds) } ${ (seconds > 1 ? "seconds" : "second") }`;
}

const getSphereDetail = (sphereLink) => {
  return new Promise((resolve, reject) => {
    axios.get(sphereLink)
      .then(response => {
        return resolve(response.data)
      })
      .catch(error => {
        return reject(error);
      })
  })
}

const updateSpheresData = async (spheres) => {
  try {
    for (const sphere of spheres) {
      console.log(chalk.blue(`${sphere.name}: start`));
      await getSphereDetail(sphere.link).then(data => {
        const $ = cheerio.load(data);
        sphere.thumbnail = $("table.article-table").first().find("tr > td > img").attr("data-src");
        const $effect = $("div[style='padding:3px 12px 0px 12px;']").html();
        if ($effect.includes("<br>")) {
          const splitEffect = $effect.split('<br>');
          sphere.effect = splitEffect[0];
          sphere.effectDetail = $("div[style='padding:3px 12px 0px 12px;'] > small > i").text();
        } else {
          sphere.effect = $("div[style='padding:3px 12px 0px 12px;']").text();
        }
      });
      console.log(chalk.green(`${sphere.name}: done`));
    }
    return spheres;
  } catch (error) {
    console.error(error);
  }
}

collectSpheres();
