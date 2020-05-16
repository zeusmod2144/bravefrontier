# Scraping Brave Frontier

Brave Frontier is a RPG (Role Playing Game) that available in a smartphone like Android, iOS, Amazon. I love this game since 2015, take a break at 2016 and come back at 2019. For me, this game is awesome.

## What data will you scraping?

- [x] Scrape list of omni units.
- [x] Scrape recommended SP of omni units.


## Tech Stack

Previously, I would like to use awesome technology like Puppeteer for scraping. But, [Brave Frontier Fandom's site](https://bravefrontierglobal.fandom.com/wiki/Brave_Frontier_Wiki) is too slow when access Puppeteer in headless mode. So, I choose the boring and proven stack like [Cheerio](https://cheerio.js.org/) or [JSDOM](https://github.com/jsdom/jsdom) to scraping this site.

## How to run

**Note: this project requires Node JS version at least 12.14.1 or more.**
- Clone this project
- Install dependencies with `npm ci`
- To run scrape list of units: `npm run scrape-units`
- To run scrape list of omni units: `npm run scrape-omni-units`