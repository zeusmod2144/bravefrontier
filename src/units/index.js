const { getUnitSeries } = require('./scrapers/list.js');
const firstMainSeriesUrl = "https://bravefrontierglobal.fandom.com/wiki/Unit_List";
const firstGlobalExclusiveSeriesUrl = "https://bravefrontierglobal.fandom.com/wiki/Unit_List:7000";

module.exports = async () => {
    let mainUnits = await getUnitSeries(firstMainSeriesUrl);
    let exclusiveUnits = await getUnitSeries(firstGlobalExclusiveSeriesUrl);
  
    const units = [];
    // Filter from an object that has undefined values
    for (const unit of [...mainUnits, ...exclusiveUnits]) {
      if (!Object.values(unit).includes(undefined)) {
        units.push(unit);
      }
    }
  
    // Remove duplicate unit object
    const filteredUnits = units.filter(function ({ id, name }) {
      const key = `${id}${name}`;
      return !this.has(key) && this.add(key);
    }, new Set);
    
    return filteredUnits;
}