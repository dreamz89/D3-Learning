/*
*    main.js
*    Mastering Data Visualization with D3.js
*    Project 1 - Star Break Coffee
*/
var flag = true;
var t = d3.transition().duration(750);

var margin = { left:90, right:20, top:20, bottom:70 };
var width = 600 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

// Create chart area with margins
var g = d3.select('#chart-area')
  .append('svg')
    .attr('height', height + margin.top + margin.bottom)
    .attr('width', width + margin.left + margin.right)
  .append("g")
    .attr("transform", "translate(" + margin.left
      + ", " + margin.top + ")");

// Create axis groups
var xAxisGroup = g.append('g')
  .attr('class', 'x-axis')
  .attr('transform', 'translate(0,' + height + ')')

var yAxisGroup = g.append('g')
  .attr('class', 'y-axis')

// Define scales for x and y axis
var x = d3.scaleBand()
  .range([0, width])
  .paddingInner(0.3)
  .paddingOuter(0.3);

var y = d3.scaleLinear()
  .range([height, 0]);

// X Label
g.append('text')
  .attr('class', 'x-axis-label')
  .attr('x', width/2)
  .attr('y', height + 60)
  .attr('font-size', '20px')
  .attr('text-anchor', 'middle')
  .text('Month');

// Y label
var yLabel = g.append('text')
  .attr('class', 'y-axis-label')
  .attr('x', - (height / 2))
  .attr('y', - 70)
  .attr('font-size', '20px')
  .attr('text-anchor', 'middle')
  .attr('transform', 'rotate(-90)')
  .text('Revenue');

d3.json('data/revenues.json').then(function(data) {
  update(data);
  // Clean data
  data.forEach(function(d) {
    d.revenue = +d.revenue;
    d.profit = +d.profit;
  });
  d3.interval(function(){
    var newData = flag ? data : data.slice(1)
    update(newData)
    flag = !flag
  }, 2000);
})

function update(data){
  var value = flag ? 'revenue' : 'profit';

  x.domain(data.map(function(d){ return d.month; }))
  y.domain([0, d3.max(data, function(d) { return d[value] })])

  // Make X and Y axis
  var xAxisCall = d3.axisBottom(x);
  xAxisGroup.transition(t).call(xAxisCall);

  var yAxisCall = d3.axisLeft(y)
    .tickFormat((d) => { return '$' + d });
  yAxisGroup.transition(t).call(yAxisCall);

  // JOIN
  var rects = g.selectAll('rect').data(data, (d) => {
    return d.month;
  })

  // EXIT
  rects.exit()
    .attr('fill', 'red')
  .transition(t)
    .attr('y', y(0))
    .attr('height', 0)
    .remove();

  // ENTER
  rects.enter()
    .append('rect')
      .attr('y', y(0) )
      .attr('height', 0)
      .attr('fill', 'grey')
      // UPDATE
      .merge(rects)
      .transition(t)
        .attr('x', (d) => { return x(d.month) })
        .attr('width', x.bandwidth)
        .attr('y', (d) => { return y(d[value]) })
        .attr('height', (d) => { return height - y(d[value]) })

  var label = flag ? 'Revenue' : 'Profit';
  yLabel.text(label)
}
