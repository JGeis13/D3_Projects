
const width = 800;
const height = 600;
const barPadding = 1;
const padding = 50;

let ageData = regionData.filter( d => d.medianAge !== null);

let xScale = d3.scaleLinear()
                .domain(d3.extent(ageData, d => d.medianAge))
                .rangeRound([padding, width - padding])


let histogram = d3.histogram()
                  .domain(xScale.domain())
                  .thresholds(xScale.ticks())
                  .value( d => d.medianAge);

let bins = histogram(ageData);

let yScale = d3.scaleLinear()
               .domain([0, d3.max(bins, d => d.length )])
               .range([height - padding, padding]);

let svg = d3.select('svg')
            .attr('width', width)
            .attr('height', height);

// X - Axis
svg.append('g')
  .classed('x-axis', true)
  .attr('transform', 'translate(0,' + (height - padding) + ')')
  .call(d3.axisBottom(xScale));

svg.append('text')
  .text('Median Age')
  .style('text-anchor', 'middle')
  .attr('x', width / 2)
  .attr('y', height - 10);

// Y - Axis
svg.append('g')
  .classed('y-axis', true)
  .attr('transform', 'translate(' + padding + ',0)')
  .call(d3.axisLeft(yScale));

svg.append('text')
  .text('Frequency')
  .style('text-anchor', 'middle')
  .attr('x', - height / 2)
  .attr('y', 15)
  .attr('transform', 'rotate(-90)');

svg.selectAll('rect')
  .data(bins)
  .enter()
  .append('rect')
    .attr('x', d => xScale(d.x0))
    .attr('y', d => yScale(d.length))
    .attr('height', d => height - padding - yScale(d.length))
    .attr('width', d => xScale(d.x1) - xScale(d.x0) - barPadding)
    .attr('fill', 'green');
            

function update(binCount){
  histogram.thresholds(xScale.ticks(binCount));
  bins = histogram(ageData);
  yScale.domain([0, d3.max(bins, d => d.length)]);

  d3.select('.y-axis')
    .call(d3.axisLeft(yScale));

  d3.select('.x-axis')
    .call(d3.axisBottom(xScale).ticks(binCount));

  let rect = svg.selectAll('rect').data(bins);

  rect.exit().remove();

  rect
    .enter()
      .append('rect')
    .merge(rect)
      .attr('x', d => xScale(d.x0))
      .attr('y', d => yScale(d.length))
      .attr('height', d => height - padding - yScale(d.length))
      .attr('width', d => xScale(d.x1) - xScale(d.x0) - barPadding)
      .attr('fill', 'green');
}

d3.select('input')
  .on('input', () => {
    let binCount = +d3.event.target.value;
    update(binCount);
    d3.select('h5 span')
      .text(bins.length);
  });
