const request = require("request");
const cheerio = require("cheerio");

request("https://bravefrontierglobal.fandom.com/wiki/Unit_List", (error, response, html) => {
  if (!error && response.statusCode == 200) {
    const $ = cheerio.load(html);
    const body = $("table.wikitable tbody").first();
    body.each((i, el) => {
      const rows = $(el).find($("tr"));
      rows.each((i, el) => {
        const columns = $(el).find($("td"));
        columns.each((i, el) => {
          switch (i) {
            case 1:
              console.log("unit image", $(el).find("a > img").attr("data-src"));
              console.log("unit name", $(el).find("a").last().attr("title"));
              console.log("unit link", $(el).find("a").last().attr("href"))
              break;
            case 2:
              console.log("unit element", $(el).find("center > a").attr("title"));
              break;
            case 3:
              console.log("unit rarity", $(el).find("center > a").attr("title"));
              break;
            case 4:
              console.log("unit cost", $(el).find("center > a").attr("title"));
              break;
          }
        });
      });
    });
  } else {
    console.log(error);
  }
});