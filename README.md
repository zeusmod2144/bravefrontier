# Scraping Brave Frontier

Brave Frontier is a RPG (Role Playing Game) that available in a smartphone like Android, iOS, Amazon. I love this game since 2015, take a break at 2016 and come back at 2017. For me, this game is awesome.

## Why Do You Scrape This?

Because I want to collect data like units and spheres. After that, build an API and website to:
- Display list of units and spheres.
- Display detail of unit
- Display detail of sphere
- Attach spheres to an unit

This took a time, but I believe that this will be done!

## Tech Stack

Previously, I would like to use awesome technology like Puppeteer for scraping. But, this site is to slow when access Puppeteer in headless mode. So, I choose the boring and proven stack like Cheerio to scraping this site.

## TODO

- [x] Collect units and store in **units.json** file.
- [x] Collect spheres and store in json file.
- [x] Get detail data each of unit and update it in **units.json** file.
- [] Get detail data each of sphere and update it in **spheres.json** file.

## Next after TODO

I would like to consider replace store mechanism data in json file with database like NoSQL.