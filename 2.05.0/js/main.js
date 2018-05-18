/*
*    main.js
*    Mastering Data Visualization with D3.js
*    2.5 - Activity: Adding SVGs to the screen
*/
var svg = d3.select('#chart-area').append('svg')
  .attr('height', 400)
  .attr('width', 500);

var circle = svg.append('circle')
  .attr('cx', 200)
  .attr('cy', 300)
  .attr('r', 50)
  .attr('fill', 'purple');

var ellipse = svg.append('ellipse')
  .attr('cx', 100)
  .attr('cy', 350)
  .attr('rx', 50)
  .attr('ry', 30)
  .attr('fill', 'green');

var rect = svg.append('rect')
  .attr('height', 100)
  .attr('width', 100)
  .attr('y', 150)
  .attr('fill', 'blue');

var line = svg.append('line')
  .attr('x1', 50)
  .attr('y1', 100)
  .attr('x2', 300)
  .attr('y2', 80)
  .attr('stroke-width', '5')
  .attr('stroke', 'grey');
