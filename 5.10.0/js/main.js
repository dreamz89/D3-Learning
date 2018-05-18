/*
*    main.js
*    Mastering Data Visualization with D3.js
*    Project 2 - Gapminder Clone
*/
var margin = {top: 20, left: 70, right: 20, bottom: 100};
var height = 500 - margin.top - margin.bottom; // height of actual chart inside svg area
var width = 800 - margin.left - margin.right;
var t = d3.transition().duration(50);
var i = 0;
var data;
var interval;

var svg = d3.select('#chart-area')
  .append('svg')
    .attr('height', height + margin.top + margin.bottom)
    .attr('width', width + margin.left + margin.right)
  .append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

// X Label
svg.append('text')
  .attr('class', 'x-axis-label')
  .attr('x', width/2)
  .attr('y', height + 60)
  .attr('font-size', '20px')
  .attr('text-anchor', 'middle')
  .text('GDP per capita ($)');
// Y label
svg.append('text')
  .attr('class', 'y-axis-label')
  .attr('x', - (height / 2))
  .attr('y', - 50)
  .attr('font-size', '20px')
  .attr('text-anchor', 'middle')
  .attr('transform', 'rotate(-90)')
  .text('Life expectancy (Years)');
// year label
var yearLabel = svg.append('text')
  .attr('class', 'year-label')
  .attr('x', width)
  .attr('y', height - 10)
  .attr('fill', 'grey')
  .attr('font-size', '30px')
  .attr('text-anchor', 'end')

// Define scales for x, y, size, color
var continents = ['europe', 'asia', 'americas', 'africa'];
var colors = ['#7192BE', '#DC6BAD', '#EDA2F2', '#8C7AA9'];

var x = d3.scaleLog()
  .domain([300, 150000])
  .range([0, width])
  .base(10)
var y = d3.scaleLinear()
  .domain([0, 90])
  .range([height, 0])
var size = d3.scaleLinear()
  .range([5, 25])
var color = d3.scaleOrdinal()
  .domain(continents)
  .range(colors)

// Create axis
var xAxisCall = d3.axisBottom(x)
  .ticks(3)
  .tickFormat((d)=> {return '$' + d})
  .tickValues([400, 4000, 40000]);
svg.append('g')
  .attr('class', 'x-axis')
  .attr('transform', 'translate(0,' + height + ')')
  .transition(t)
  .call(xAxisCall);

var yAxisCall = d3.axisLeft(y);
svg.append('g')
  .attr('class', 'y-axis')
  .transition(t)
  .call(yAxisCall);

// Legend
var legend = svg.append('g')
  .attr('transform', 'translate(' + (width - 10) + ',' + (height - 125) + ')')
continents.forEach(function(continent, i){
  var legendRow = legend.append('g').attr('transform', 'translate(0,' + (i*20) + ')')
  legendRow.append('rect')
    .attr('height', 10)
    .attr('width', 10)
    .attr('fill', colors[i])
  legendRow.append('text')
    .attr('x', -10)
    .attr('y', 10)
    .attr('text-anchor', 'end')
    .style('text-transform', 'capitalize')
    .text(continent)
})

// Tooltip
var tip = d3.tip().attr('class', 'd3-tip')
  .html((d) => {
    var text = '<strong>Country: </strong> <span style="color:teal">' + d.country + '</span><br>'
    text += '<strong>Continent: </strong> <span style="color:teal; text-transform: capitalize">' + d.continent + '</span><br>'
    text += '<strong>Life Expectancy: </strong> <span style="color:teal">' + d3.format('.2f')(d.life_exp) + '</span><br>'
    text += '<strong>GDP per capita: </strong> <span style="color:teal">' + d3.format('$,.0f')(d.income) + '</span><br>'
    text += '<strong>Population: </strong> <span style="color:teal">' + d3.format(',.0f')(d.population) + '</span>'
    return text;
  })
svg.call(tip)

d3.json("data/data.json").then((dataz) => {
  data = dataz;
})

// Activate buttons
$('#play-button').on('click', function(){
  var button = $(this)
  if (button.text() === 'Play'){
    button.text('Pause')
    interval = setInterval(step, 500)
  }
  else {
    button.text('Play')
    clearInterval(interval)
  }
})

$('#reset-button').on('click', function(){
  i = 0;
  update(data[i]);
})

$('#continent-select').on('change', function(){
  update(data[i]);
})

$('#date-slider').slider({
  min: 1800,
  max: 2014,
  step: 1,
  slide: function(event, ui){
    i = ui.value - 1800;
    update(data[i]);
  }
})

function step(){
  update(data[i]);
  i++
  if (i >= data.length) { i = 0 };
}

function update(data){
  // Change year text
  yearLabel.text(data.year)
  $('#year')[0].innerHTML = i + 1800;
  $('#date-slider').slider('value', i + 1800);

  // remove null values in JSON dataset
  var beforeFilter = data.countries;
  var data = beforeFilter.filter(value => typeof(value.income) === 'number' && typeof(value.life_exp) === 'number');

  var continent = $('#continent-select').val();
  var data = data.filter(value => {
    if (continent === 'all') { return value }
    else { return value.continent === continent }
  })

  // Change domain for size
  size.domain(d3.extent(data, (d) => { return Math.sqrt(d.population / Math.PI) }))

  // JOIN
  var circles = svg.selectAll("circle").data(data, function(d){
    return d.country;
  });

  // EXIT
  circles.exit().remove();

  // ENTER
  circles.enter().append('circle')
    .attr('fill', (d) => { return color(d.continent) })
    .on('mouseover', tip.show)
    .on('mouseout', tip.hide)
    .merge(circles)
    .transition(t)
      .attr('cx', (d) => { return x(d.income) })
      .attr('cy', (d) => { return y(d.life_exp) })
      .attr('r', (d) => { return size(Math.sqrt(d.population / Math.PI)) })
}
