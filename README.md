# Brave Frontier Scraper and API

Unofficial source data of omni units for [BFWIKI website](https://bfwiki.satyakresna.io).

## About

Brave Frontier is a RPG (Role Playing Game) that available in a smartphone like Android, iOS, Amazon. I love this game since 2015, take a break at 2016 and come back at 2019. For me, this game is awesome. I create article about this project in bahasa Indonesia: [Membangun Brave Frontier API (Unofficial)](https://www.satyakresna.io/posts/membangun-brave-frontier-api-unofficial/).

## What data you scrape?

I scrape list of omni units with their recommended SP and store in [a JSON raw file](./omniunits/raw.json).

## Tech Stack

- Axios
- Cheerio
- JSDOM
- Github Actions
- Vercel

## API Usage

### List of Omni Units

To get list of omni units please go to: https://bravefrontier.satyakresna.io/api/v1/omniunits. You can also get specific list of omni units by param search like `name` and `element`.

Example:

1. By `name` https://bravefrontier.satyakresna.io/api/v1/omniunits?name=war
2. By `element` https://bravefrontier.satyakresna.io/api/v1/omniunits?element=fire
3. By `name` and `element` https://bravefrontier.satyakresna.io/api/v1/omniunits?name=sun&element=fire


## Detail of Omni Unit

To get detail of omni unit, you should use `name` of omni unit as path and if space(s) exist in omni unit's name then you should replace them with underscrore (_) and if their name contains `&` then you must use [encodeURIComponent](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent).

Here's is example:

1. Ignis Halcyon Vargas = https://bravefrontier.satyakresna.io/api/v1/omniunits/Ignis_Halcyon_Vargas
2. Fearless Tate & Tama = https://bravefrontier.satyakresna.io/api/v1/omniunits/Fearless_Tate_%26_Tama (this has been encode).

## How to run

**Note: this project requires Node JS version at least 12.14.1 or more.**
- Clone this project
- Install dependencies with `npm ci`
- To run scrape list of omni units: `npm run omniunits:raw`