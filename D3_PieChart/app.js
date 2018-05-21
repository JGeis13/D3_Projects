var minYear = d3.min(birthData, d => d.year);
var maxYear = d3.max(birthData, d => d.year);
var width = 600;
var height = 600;

let months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August',
                'September', 'October', 'November', 'December'];

let colorScale = d3.scaleOrdinal()
                   .domain(months)
                   .range(months.map( (item, i, arr) => {
                      return d3.interpolateHslLong('purple', 'orange')(i/ arr.length);
                   }));

let colorScale2 = d3.scaleOrdinal()
                    .domain([1,2,3,4])
                    .range([2,5,8,11].map((item, i, arr) => {
                      return d3.interpolateHslLong('purple', 'orange')((item + 0.5) / 12);
                    }));

d3.select('svg')
    .attr('width', width)
    .attr('height', height)
  .append('g')
    .attr('transform', `translate(${width / 2}, ${height / 2})`)
    .classed('chart', true);

d3.select('svg')
  .append('g')
    .attr('transform', `translate(${width / 2}, ${height / 2})`)
    .classed('chart2', true);

makeGraph(minYear);

d3.select('input')
    .property('min', minYear)
    .property('max', maxYear)
    .property('value', minYear)
    .on('input', () => makeGraph(+d3.event.target.value));

function makeGraph(year){
  d3.select('h2 span').text(year);
  let yearData = birthData.filter(d => d.year === year);
  let totalBirths = yearData.reduce( (acc, item) =>  acc + item.births,0);
  let quarters = yearData.reduce((acc, item) => {
    let quarter = getQuarter(item.month);
    let index = acc.findIndex((item) => item.quarter === quarter);
    if (index < 0) {
      acc.push({
        quarter: quarter,
        births: item.births
      });
    } else {
      acc[index].births += item.births;
    }
    return acc;
  }, []);

  let outerArcs = d3.pie()
    .sort( (a,b) => {
      return months.indexOf(a.month) - months.indexOf(b.month);
    })
    .value(d => d.births)
    (yearData);

  let innerArcs = d3.pie()
    .sort((a, b) => {
      return a.quarter - b.quarter;
    })
    .value(d => d.births)
    (quarters);

  let innerPath = d3.arc()
    .outerRadius(width / 4)
    .innerRadius(0);

  let outerPath = d3.arc()
    .outerRadius(width / 2 - 10)
    .innerRadius(width / 4);

  let outer = d3.select('.chart').selectAll('.arc').data(outerArcs);
  let inner = d3.select('.chart2').selectAll('.arc').data(innerArcs);

  outer.exit().remove();
  inner.exit().remove();

  outer
    .enter()
    .append('path')
      .classed('arc',true)
    .merge(outer)
      .attr('fill', d => colorScale(d.data.month))
      .attr('stroke', 'grey')
    .attr('d', outerPath);

  inner
    .enter()
    .append('path')
    .classed('arc', true)
    .merge(inner)
    .attr('fill', d => colorScale2(d.data.quarter))
    .attr('stroke', 'grey')
    .attr('d', innerPath);

  // Labels

  appendLabel('.chart', outerPath, outerArcs);
  appendLabel('.chart2', innerPath, innerArcs);

  function appendLabel(chartClass, _path, arcs){
    let lblUpdate = d3.select(chartClass).selectAll('text').data(arcs);
    let enter = lblUpdate.enter().append('text');
    enter.append('tspan').classed('label', true);
    enter.append('tspan').classed('percent', true);

    enter
      .merge(lblUpdate)
      .each(function (d) { createLabel(d, _path, d.data, this) });
  }

  function createLabel(d, _path, data, el) {
    var centroid = _path.centroid(d);
    let selection = d3.select(el)
      .attr('x', centroid[0])
      .attr('y', centroid[1])
      .attr('dy', '0.33em');
    let str = data.quarter ? 'Q' + data.quarter : data.month;
    selection.select('.label').text(str);
    selection.select('.percent').text(toPercent(data.births / totalBirths)).attr('x', centroid[0]).attr('dy', '1.2em');
  }
}

function getQuarter(month){
  return Math.floor(months.indexOf(month) / 3) + 1;
}

function toPercent(num){
  return +(num * 100).toFixed(2) + '%';
}

