d3.queue()
  .defer(d3.json, 'https://unpkg.com/world-atlas@1.1.4/world/50m.json')
  .defer(d3.csv, '../datasets/countryInfo.csv', row => {
    //country,countryCode,population,landArea,medianAge,fertilityRate,
    return {
      country: row.country,
      code: row.countryCode,
      pop: +row.population,
      popDensity: +row.population / +row.landArea,
      medianAge: +row.medianAge,
      fertilityRate: +row.fertilityRate,
    }
  })
  .await( (err, mapData, populationData) => {
    if(err) throw err;

    let geoData = topojson.feature(mapData, mapData.objects.countries).features;
    /* console.log(geoData);
    console.log(populationData); */

    populationData.forEach( row => {
      let countries = geoData.filter( d => d.id === row.code);
      countries.forEach( country => country.properties = row);

    })


    let width = 960;
    let height = 600;
    
    let projection = d3.geoMercator()
      .scale(130)
      .translate([width / 2, height / 1.4]);

    let path_ = d3.geoPath().projection(projection);

    d3.select('svg')
        .attr('width', width)
        .attr('height', height)
      .selectAll('.country')
      .data(geoData)
      .enter()
        .append('path')
        .classed('country', true)
        .attr('d', path_)
        .on('mousemove', updateTooltip)
        .on('mouseout', hideTooltip);

    d3.select('select')
      .on('change', d => setColor(d3.event.target.value));

    setColor(d3.select('select').property('value'))


    function setColor(val){
      let colorRanges = {
        pop: ['white', 'purple'],
        popDensity: ['white', 'red'],
        medianAge: ['white', 'black'],
        fertilityRate: ['black', 'orange']
      }

      let scale = d3.scaleLinear()
        .domain([d3.min(populationData, d => d[val]), d3.max(populationData, d => d[val])])
        .range(colorRanges[val]);

      d3.selectAll('.country')
        //.transition()
        //.duration(750)
        //.ease(d3.easeBackIn)
        .attr('fill', d => {
          let data = d.properties[val];
          return data ? scale(data) : '#ccc';
        });
    }

    function updateTooltip(d){
      let w = d3.event.view.innerWidth;
      let h = d3.event.view.innerHeight;
      let divW = +d3.select('.tooltip').style('width').slice(0, -2);
      let divH = +d3.select('.tooltip').style('height').slice(0,-2);
      let offset = d3.event.y < h / 2 ? 15 : -divH - 5;
      d3.select('.tooltip')
        .style('opacity', 1)
        .style('top', d3.event.y + offset + 'px')
        .style('left', d3.event.x - (divW / 2)  + 'px')
        .html(`
          <p>Location: ${d.properties.country}</p>
          <p>Population: ${d.properties.pop.toLocaleString()}</p>
          <p>Fert. Rate: ${d.properties.fertilityRate}</p>
          <p>Median Age: ${d.properties.medianAge}</p>
          <p>Pop. Density: ${d.properties.popDensity.toFixed(2)}</p>
        `);
    }
    function hideTooltip(){
      d3.select('.tooltip')
        .style('opacity', 0);
    }

  });