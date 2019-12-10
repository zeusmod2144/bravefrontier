const cheerio = require("cheerio");
const fs = require("fs");
const chalk = require("chalk");
const axios = require("axios");

const rootUrl = "https://bravefrontierglobal.fandom.com";
const sphereFirstUrl = "https://bravefrontierglobal.fandom.com/wiki/Category:1%E2%98%85_Rarity_(Item)";
const spheres = [];
const outputFile = 'spheres.json';

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
      console.log(chalk.yellow.bgBlue(`\n Finish scraping list of spheres. \n`));
      // Store the result to units.json file
      fs.writeFile(outputFile, JSON.stringify(spheres, null, 4), err => {
        if (err) {
          console.log(err);
        }
        console.log(chalk.yellow.bgBlue(`\n Success export ${spheres.length} spheres to ${outputFile}. \n`));
      });
      return false;
    }

    const nextUrl = `${rootUrl}${nextPageHref}`;
    console.log(chalk.cyan(`Scraping next url: ${nextUrl}`));

    return await getSpheres(nextUrl);
    // Recursion end
  } catch (error) {
    console.log(error);
  }
}

getSpheres(sphereFirstUrl);

