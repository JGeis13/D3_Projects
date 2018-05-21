const usableData = regionData.filter(d => {
  return d.medianAge != null && d.extremePovertyRate != null &&
    d.subscribersPer100 != null && d.adultLiteracyRate != null;
});

let height = 600;
let width = 800;
let padding = 40;

let xScale = d3.scaleLinear()
  .domain(d3.extent(usableData, d => d.medianAge))
  .range([padding, width - padding]);

let yScale = d3.scaleLinear()
  .domain(d3.extent(usableData, d => d.extremePovertyRate))
  .range([height - padding, padding]);

let rScale = d3.scaleLinear()
  .domain(d3.extent(usableData, d => d.subscribersPer100))
  .range([4, 20]);

let colorScale = d3.scaleLinear()
  .domain(d3.extent(usableData, d => d.adultLiteracyRate))
  .range(['red', 'navy']);

let xAxis = d3.axisBottom(xScale)
  .ticks(8)
  .tickSize(-height + padding * 2 - 14)
  .tickSizeOuter(0);

let yAxis = d3.axisLeft(yScale)
  .tickSize(-width + padding * 2)
  .tickSizeOuter(0);

let tooltipDiv = d3.select('body').append('div')
  .classed('tooltip', true)
  .style('opacity', 0);

d3.select('svg')
  .append('g')
  .attr('transform', `translate(0,${height - padding + 14})`)
  .call(xAxis);

d3.select('svg')
  .append('g')
  .attr('transform', `translate(${padding},0)`)
  .call(yAxis);

d3.select('svg')
  .attr('width', width)
  .attr('height', height)
  .selectAll('circle')
  .data(usableData)
  .enter()
  .append('circle')
  .attr('cx', d => xScale(d.medianAge))
  .attr('cy', d => yScale(d.extremePovertyRate))
  .attr('r', d => rScale(d.subscribersPer100))
  .style('fill', d => colorScale(d.adultLiteracyRate))
  .on('mouseover', d => {
    let title = d.region;
    let lit = `Adult Lit Rate: <span>${d.adultLiteracyRate}</span>`;
    let subs = `Cell subs per 100: <span>${d.subscribersPer100}</span>`;
    let age = `Median Age: <span>${d.medianAge}</span>`;
    let pov = `Ext Pov Rate: <span>${d.extremePovertyRate}</span>`;
    let html = '<span>' + title + '</span>';
    html += '<div>' + lit + '</div>';
    html += '<div>' + subs + '</div>';
    html += '<div>' + age + '</div>';
    html += '<div>' + pov + '</div>';
    tooltipDiv
      .transition()
      .duration(200);
    tooltipDiv
      .style("left", (d3.event.pageX) + "px")
      .style("top", (d3.event.pageY - 28) + "px")
      .style("opacity", .9)
      .html(html);
  })
  .on('mouseout', d => {
    tooltipDiv
      .style("opacity", 0);
  });

d3.select('svg')
  .append('text')
  .attr('x', width / 2)
  .attr('y', height - padding)
  .attr('dy', '2.3em')
  .style('text-anchor', 'middle')
  .text('Median Age');

d3.select('svg')
  .append('text')
  .attr('transform', `rotate(-90)`)
  .attr('x', - (height - padding) / 2)
  .attr('y', '-1.2em')
  .attr('dy', '2.3em')
  .style('text-anchor', 'middle')
  .text('Extreme Poverty Rate');