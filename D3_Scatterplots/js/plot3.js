
/* 
"State"
"Number of drivers involved in fatal collisions per billion miles"
"Percentage Of Drivers Involved In Fatal Collisions Who Were Speeding"
"Percentage Of Drivers Involved In Fatal Collisions Who Were Alcohol-Impaired"
"Percentage Of Drivers Involved In Fatal Collisions Who Were Not Distracted"
"Percentage Of Drivers Involved In Fatal Collisions Who Had Not Been Involved In Any Previous Accidents"
"Car Insurance Premiums ($)"
"Losses incurred by insurance companies for collisions per insured driver ($)" 
*/

d3.csv("../datasets/drivingByState.csv", function(d) {
  return {
    state : d.State,
    collisions_per_billion: +d["Number of drivers involved in fatal collisions per billion miles"],
    alcohol: +d["Percentage Of Drivers Involved In Fatal Collisions Who Were Alcohol-Impaired"],
    speeding: +d["Percentage Of Drivers Involved In Fatal Collisions Who Were Speeding"],
    not_distracted: +d["Percentage Of Drivers Involved In Fatal Collisions Who Were Not Distracted"],
    no_previous_accidents: +d["Percentage Of Drivers Involved In Fatal Collisions Who Had Not Been Involved In Any Previous Accidents"],
    premiums: +d["Car Insurance Premiums ($)"],
    losses_per_insured: +d["Losses incurred by insurance companies for collisions per insured driver ($)" ]
  }
}, makeChart );


function makeChart(data){
  // Sorting data so smaller circles (based on of alcohol-impaired) will be in front
  data = data.sort( (a,b) => {
    return b.alcohol - a.alcohol;
  });

  let height = 600;
  let width = 850;
  let padding = 50;

  // xScale is collisions_per_billion range
  let xScale = d3.scaleLinear()
    .domain([d3.min(data, d => d.collisions_per_billion) - 1,d3.max(data, d => d.collisions_per_billion)+1])
    .rangeRound([padding, width - padding/4]);
  
  // yScale is premiums range               
  let yScale = d3.scaleLinear()
    .domain([d3.min(data, d => d.premiums) - 10,d3.max(data, d => d.premiums) + 10])
    .rangeRound([height - padding, padding]);

  // scale radius based on of alcohol-impaired fatal collision
  let rScale = d3.scaleLinear()
    .domain(d3.extent(data, d => d.alcohol))
    .range([3,30]);

  // color scale based on % speeding
  let colorScale = d3.scaleLinear()
    .domain(d3.extent(data, d => d.speeding))
    .range(['#DFE0E2', '#21295C']);

  // Add x-Axis
  let xAxis = d3.axisBottom(xScale);

  d3.select('svg')
    .append('g')
      .call(xAxis)
      .attr('transform', `translate(0,${height - padding})`);

  d3.select('svg')
    .append('text')
      .attr('x', width / 2)
      .attr('y', height - padding / 4)
      .style('text-anchor', "middle")
      .text('Number of drivers involved in fatal collisions per billion miles');

  // Add y-axis
  let yAxis = d3.axisLeft(yScale);

  d3.select('svg')
    .append('text')
      .attr('x', -height / 2)
      .attr('y', 12)
      .attr('transform', 'rotate(-90)')
      .style('text-anchor', "middle")
      .text('Car Insurance Premiums ($)');

  // Heading
  d3.select('svg')
    .append('text')
      .text('Fatal Collision Data By State')
      .attr('x', width/2)
      .attr('y', '1rem')
      .style('text-anchor', 'middle');

  // Tooltip
  let tooltip = d3.select('body')
                  .append('div')
                    .classed('tooltip', true);

  d3.select('svg')
    .append('g')
      .call(yAxis)
      .attr('transform', `translate(${padding},0)`);

  d3.select('svg')
      .attr('width', width)
      .attr('height', height)
      //.style('border', '1px solid black')
    .selectAll('circle')
    .data(data)
    .enter()
    .append('circle')
      .attr('cx', d => xScale(d.collisions_per_billion))
      .attr('cy', d => yScale(d.premiums))
      .attr('r', d => rScale(d.alcohol))
      .style('stroke', 'white')
      .style('fill', d => colorScale(d.speeding))
      // adding tooltip functionality
      .on('mousemove', showTooltip) // will not work on touch devices
      .on('mouseout', hideTooltip)
      .on('touchstart', showTooltip) // works on touch devices
      .on('touchend', hideTooltip);

  function showTooltip(d){
    d3.select(this).style('cursor','none');
    tooltip
      .style('opacity', 1)
      .style('left', d3.event.x + 'px')
      .style('top', d3.event.y -87 + 'px')
      .html(`
        <h3>${d.state}</h3>
        <p>Premiums: <span>$${d.premiums.toLocaleString()}</span></p>
        <p>Fatal Collisions Per Billion Miles: <span>${d.collisions_per_billion}</span></p>
        <p>Speeding: <span>${d.speeding}%</span></p>
        <p>Alcohol-Impaired: <span>${d.alcohol}%</span></p>
        <p>Not Distracted: <span>${d.not_distracted}%</span></p>
        <p>First Collision: <span>${d.no_previous_accidents}%</span></p>
      `);
  }

  function hideTooltip(){
    tooltip.style('opacity', 0);
  }

  makeKey();
}

function makeKey(){
  let data = [3,8,18,30];
  let accum = 0;
  let availableMargin = 200 - data.reduce((acc, r) => acc += r);
  let margin = availableMargin / data.length;
  d3.select('.size-scale svg')
    .selectAll('circle')
    .data(data)
    .enter()
    .append('circle')
      .attr('cx', (d,i) => {
        let start = accum;
        accum += (margin / 2) + (d * 2);
        return start + (margin / 2) + d;
      })
      .attr('cy', 31)
      .attr('r', d => d)
      .attr('fill', '#21295c');
}