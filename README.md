# Scraping Brave Frontier

Brave Frontier is a RPG (Role Playing Game) that available in a smartphone like Android, iOS, Amazon. I love this game since 2015, take a break at 2016 and come back at 2019. For me, this game is awesome.

## What data you scrape?

I scrape list of omni units with their recommended SP.

## Tech Stack

Previously, I would like to use [Puppeteer](https://pptr.dev/) for scraping. But, [Brave Frontier Fandom's site](https://bravefrontierglobal.fandom.com/wiki/Brave_Frontier_Wiki) is too slow when I scrape using Puppeteer in headless mode. So, I choose [Cheerio](https://cheerio.js.org/) and [JSDOM](https://github.com/jsdom/jsdom) to scraping this site.

## How to run

**Note: this project requires Node JS version at least 12.14.1 or more.**
- Clone this project
- Install dependencies with `npm ci`
- To run scrape list of omni units: `npm run scrape-omni-units`