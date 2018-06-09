/* // Working with JSON
// d3.json(url[, callback])
d3.json('../datasets/countries.json', (err, data) => {
  if( err ) throw err;

  d3.select('body')
    .selectAll('h3')
    .data(data.geonames)
    .enter()
    .append('h3')
    .text( d => d.countryName);
})

// Working with CSV
// d3.csv(url[, formatter, callback])
d3.csv('../datasets/worldCities.csv', (row, i, headers) => {
  // row : current CSV row as an object
  // i : row index
  // headers : array of CSV headers, 
  // which are also keys in the row object
  if( +row.pop < 10000) return;
  return {
    cityName: row.city,
    countryCode: row.iso2,
    population: +row.pop
  }
}, (err, data) => {
  if( err ) throw err;

  console.log(data);
}); */

// CHAINING REQUESTS

d3.queue()
  .defer(d3.json, '../datasets/countries.json')
  .defer(d3.csv, '../datasets/worldCities.csv', /*formatter*/ row => {
    if(+row.pop < 10000) return // filter out cities with pop under 10k
    return {
      cityName: row.city,
      countryCode: row.iso2,
      population: +row.pop
    }
  })
  .await( (error, countries, cities) => {
    if( error ) throw error;

    console.log(countries, cities);

    cities = cities.sort( (b, a) => a.population - b.population);

    let data = countries.geonames.map( country => {
      country.cities = cities.filter( city => city.countryCode === country.countryCode);
      return country;
    });
    
    let countrySelection = d3.select('body')
      .selectAll('div')
      .data(data)
      .enter()
      .append('div');

    countrySelection
      .append('h3')
        .text( d => d.countryName);

    countrySelection
      .append('ul')
        .html( d => d.cities.map(city => {
          let percent = city.population / d.population * 100;
          return `<li>${city.cityName} : ${percent.toFixed(2)}%</li>`;
        }).join(""));

  });

// Other request methods for .text .tsv .html and .xml