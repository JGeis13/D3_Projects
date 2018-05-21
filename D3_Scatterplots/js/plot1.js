// y-axis = Life Expectancy
// x-axis = Births per Capita

let width = 600;
let height = 600;
let padding = 36;

let yScale = d3.scaleLinear()
  .domain(d3.extent(data, d => d.lifeExpectancy))
  .range([height - padding, padding]);

let xScale = d3.scaleLinear()
  .domain(d3.extent(data, d => d.births / d.population))
  .range([padding, width - padding]);

let xAxis = d3.axisBottom(xScale);
let yAxis = d3.axisLeft(yScale);

let colorScale = d3.scaleLinear()
  .domain(d3.extent(data, d => d.population / d.area))
  .range(['lightgreen', 'darkgreen']);

let radiusScale = d3.scaleLinear()
  .domain(d3.extent(data, d => d.births))
  .range([2, 30]);

let div = d3.select("body").append("div")
  .attr("class", "tooltip")
  .style("opacity", 0);

d3.select('svg')
  .append('g')
  .attr('transform', 'translate(0,' + (height - padding) + ')')
  .call(xAxis);

d3.select('svg')
  .append('g')
  .attr('transform', 'translate(' + padding + ',0)')
  .call(yAxis);

d3.select('svg')
  .attr('width', width)
  .attr('height', height)
  .selectAll('circle')
  .data(data)
  .enter()
  .append('circle')
  .attr('cx', d => xScale(d.births / d.population))
  .attr('cy', d => yScale(d.lifeExpectancy))
  .attr('r', d => radiusScale(d.births))
  .style('fill', d => colorScale(d.population / d.area))
  .on("mouseover", function (d) {
    div.transition()
      .duration(200)
      .style("opacity", .9);
    div.text(d.region)
      .style("left", (d3.event.pageX) + "px")
      .style("top", (d3.event.pageY - 28) + "px");
  })
  .on("mouseout", function (d) {
    div.transition()
      .duration(500)
      .style("opacity", 0);
  });

d3.select('svg')
  .append('text')
  .attr('x', width / 2)
  .attr('y', height - padding)
  .style('text-anchor', "middle")
  .attr('dy', '2em')
  .text('Births per Capita');

d3.select('svg')
  .append('text')
  .attr('transform', 'rotate(-90)')
  .attr('x', - height / 2)
  .attr('y', padding)
  .style('text-anchor', "middle")
  .attr('dy', '-1.6em')
  .text('Life Expectancy');

d3.select('svg')
  .append('text')
  .attr('x', width / 2)
  .attr('y', padding)
  .style('text-anchor', "middle")
  .style('font-size', '1.2rem')
  .text('Data on Births by Country 2011');