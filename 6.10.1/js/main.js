/*
*    main.js
*    Mastering Data Visualization with D3.js
*    CoinStats
*/
var margin = { left:70, right:70, top:50, bottom:70 },
    height = 500 - margin.top - margin.bottom,
    width = 800 - margin.left - margin.right;
var varChoice = 'price_usd';
var t = d3.transition().duration(1000);
var data;

var svg = d3.select("#chart-area")
    .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate(" + margin.left + ", " + margin.top + ")");

// X and Y labels
var xLabel = svg.append("text")
    .attr("class", "x-axis-label")
    .attr("x", width / 2)
    .attr("y", height + 50)
    .attr("font-size", "20px")
    .attr("text-anchor", "middle")
    .text("Time");
var yLabel = svg.append("text")
    .attr("class", "y-axis-label")
    .attr("transform", "rotate(-90)")
    .attr("x", - (height / 2))
    .attr("y", - 50)
    .attr("font-size", "20px")
    .attr("text-anchor", "middle")
    .text('Price (USD)')

// Time parser for x-scale
var parseTime = d3.timeParse("%d/%m/%Y");
var formatTime = d3.timeFormat("%d/%m/%Y");
// For tooltip
var bisectDate = d3.bisector(d => { return d.date; }).left;

function formatAbbreviation(x) {
  var s = d3.format(".2s")(x);
  switch (s[s.length - 1]) {
    case "G": return s.slice(0, -1) + "B";
    case "k": return s.slice(0, -1) + "K";
  }
  return s;
}

// Scales
var x = d3.scaleTime().range([0, width]);
var y = d3.scaleLinear().range([height, 0]);

// Axis generators
var xAxisCall = d3.axisBottom().ticks(4)
var yAxisCall = d3.axisLeft().tickFormat(d => { return formatAbbreviation(d) })

// Axis groups
var xAxis = svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")");
var yAxis = svg.append("g")
    .attr("class", "y axis")

d3.json("data/coins.json").then(dataz => {
  data = dataz;
  for(var coin in data){
    data[coin] = data[coin].filter(value => value.price_usd !== null );
    data[coin].forEach(function(d) {
      d['24h_vol'] = + d['24h_vol'];
      d['date'] = parseTime(d['date']);
      d.market_cap = + d.market_cap;
      d.price_usd = + d.price_usd;
    })
  };
  update();
});

// Date selection
$('#date-slider').slider({
  min: parseTime("12/5/2013").getTime(),
  max: parseTime("31/10/2017").getTime(),
  step: 60 * 60 * 24 * 1000, // 1 day
  range: true,
  values: [parseTime("12/5/2013").getTime(), parseTime("31/10/2017").getTime()],
  slide: function(event, ui){
    $("#dateLabel1").text(formatTime(new Date(ui.values[0])));
    $("#dateLabel2").text(formatTime(new Date(ui.values[1])));
    update();
  }
})

// Coin selection
$("#coin-select").on('change', function(){ update() });
// Var selection
$("#var-select").on('change', function(){
  varChoice = $(this).val();
  if (varChoice === 'price_usd') { yLabel.text('Price (USD)') }
  if (varChoice === 'market_cap') { yLabel.text('Market Capitalization (USD)') }
  if (varChoice === '24h_vol') { yLabel.text('24 Hour Trading Volume (USD)') }
  update();
});

// Line path generator
svg.append("path")
  .attr("class", "line")
  .attr("fill", "none")
  .attr("stroke", "grey")
  .attr("stroke-with", "3px");

function update(){
  var coinChoice = $("#coin-select").val();
  var coinData = data[coinChoice];

  var sliderValues = $("#date-slider").slider("values");
  var coinData = coinData.filter(function(d){
    return ((d.date >= sliderValues[0]) && (d.date <= sliderValues[1]))
  });

  // Set scale domains
  x.domain(d3.extent(coinData, d => { return d['date'] }));
  y.domain([0, d3.max(coinData, d => { return d[varChoice] }) * 1.005]);

  // Generate axes once domains have been set
  xAxis.transition(t).call(xAxisCall.scale(x))
  yAxis.transition(t).call(yAxisCall.scale(y))

  var line = d3.line()
      .x(d => { return x(d.date) })
      .y(d => { return y(d[varChoice]) });
  svg.select('.line').transition(t).attr("d", line(coinData));

  /************************* Tooltip Code ***********************/
  // Clear old tooltips
  d3.select(".focus").remove();
  d3.select(".overlay").remove();

  var focus = svg.append("g")
      .attr("class", "focus")
      .style("display", "none");

  focus.append("line")
      .attr("class", "x-hover-line hover-line")
      .attr("y1", 0)
      .attr("y2", height);

  focus.append("line")
      .attr("class", "y-hover-line hover-line")
      .attr("x1", 0)
      .attr("x2", width);

  focus.append("circle")
      .attr("r", 5);

  focus.append("text")
      .attr("x", 15)
      .attr("dy", ".31em");

  svg.append("rect")
      .attr("class", "overlay")
      .attr("width", width)
      .attr("height", height)
      .on("mouseover", function() { focus.style("display", null); })
      .on("mouseout", function() { focus.style("display", "none"); })
      .on("mousemove", mousemove);

  function mousemove() {
    var x0 = x.invert(d3.mouse(this)[0]),
      i = bisectDate(coinData, x0, 1),
      d0 = coinData[i - 1],
      d1 = coinData[i],
      d = (d1 && d0) ? (x0 - d0.date > d1.date - x0 ? d1 : d0) : 0;
    focus.attr("transform", "translate(" + x(d.date) + "," + y(d[varChoice]) + ")");
    focus.select("text").text(d[varChoice]);
    focus.select(".x-hover-line").attr("y2", height - y(d[varChoice]));
    focus.select(".y-hover-line").attr("x2", -x(d.date));
  }
  /******************** Tooltip Code ***********************/
}
