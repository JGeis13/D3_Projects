let width = 600;
let height = 600;

let numBars = 12;
let barPadding = 10;
let barWidth = width / numBars - barPadding;
let maxBirths = d3.max(birthData, d => d.births);

let minYear = d3.min(birthData, d => d.year);
let maxYear = d3.max(birthData, d => d.year);

let yScale = d3.scaleLinear()
  .domain([0, maxBirths])
  .range([height, 0]);

d3.select('input')
  .property('min', minYear)
  .property('max', maxYear)
  .property('value', minYear);


let groups = d3.select('svg')
  .attr('width', width)
  .attr('height', height)
  .selectAll('g')
  .data(birthData.filter(d => d.year === minYear));

let groupsEnter = groups
  .enter()
  .append('g');

groupsEnter.append('rect')
  .attr('width', barWidth)
  .attr('height', d => height - yScale(d.births))
  .attr('y', d => yScale(d.births))
  .attr('x', (d, i) => (barWidth + barPadding) * i)
  .classed('highest', d => {
    let max = d3.max(birthData.filter(x => x.year === minYear), b => b.births);
    return d.births === max;
  })
  .classed('lowest', d => {
    let min = d3.min(birthData.filter(x => x.year === minYear), b => b.births);
    return d.births === min;
  });

groupsEnter.append('text')
  .attr('x', (d, i) => (barWidth + barPadding) * i + barWidth / 2)
  .attr('y', d => yScale(d.births))
  .text(d => shortenNum(d.births));

d3.select('input')
  .on('input', function () {
    let year = +d3.event.target.value;
    d3.selectAll('rect')
      .data(birthData.filter(d => d.year === year))
      .classed('highest', d => {
        let max = d3.max(birthData.filter(x => x.year === year), b => b.births);
        return d.births === max;
      })
      .classed('lowest', d => {
        let min = d3.min(birthData.filter(x => x.year === year), b => b.births);
        return d.births === min;
      })
      .transition()
      .attr('height', d => height - yScale(d.births))
      .attr('y', d => yScale(d.births));
      

    d3.selectAll('text')
      .data(birthData.filter(d => d.year === year))
      .transition()
      .attr('x', (d, i) => (barWidth + barPadding) * i + barWidth / 2)
      .attr('y', d => yScale(d.births))
      .text(d => shortenNum(d.births));
  });


function shortenNum(num) {
  if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M';
  else return (num / 1000).toFixed(1) + 'K';
}