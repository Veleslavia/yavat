'use strict';

var timeline = waves.ui.timeline;
var segment  = waves.ui.segment;
var waveform = waves.ui.waveform;
var marker   = waves.ui.marker;
var label    = waves.ui.label;
var zoomer   = waves.ui.zoomer;
var d3 = timeline.d3;
var audioContext = waves.audio.audioContext;
var BufferLoader = waves.loaders.AudioBufferLoader;

// var Transport = require('transport');
// var GranularEngine = require('granular-engine');
// var PlayControl = require('play-control');

var waveformColor = 'SlateGrey';
var anchorColor = 'SlateGrey';
var segmentColor = 'SteelBlue';
var cursorColor = 'SlateGrey';

var graphWidth = 640;

/*
var segmentData = [
  {
    start: 3.8,
    duration: 2.4,
    text: 'Instrument 1'
  }, {
    start: 12,
    duration: 6.5,
    text: 'Instrument 2'
  }
];
*/
var segmentData = [];


// load a sound file to display
var bufferLoader = new BufferLoader();

bufferLoader.load(filePath).then(
  function(buffer) {
    // add a try/catch to work around promises error throwing
    try {
      drawGraph(buffer);
    } catch (err) {
      console.error(err.stack);
    }
  },
  function(err) {
    console.error(err);
  }
);

var drawGraph = function(buffer) {
  // 1. create the graph / timeline
  // ----------------------------------------
  var graph = timeline()
    .xDomain([0, buffer.duration])
    .width(graphWidth)
    .height(200)

  // 2. create the waveform visualizer
  // ----------------------------------------
  var waveformLayer = waveform()
    .params({ renderingStrategy: 'svg' })
    .data(buffer.getChannelData(0).buffer)
    .sampleRate(buffer.sampleRate)
    .color(waveformColor);

  // 3. create an anchor for zooming
  // ----------------------------------------
  var anchor = new marker()
    .params({ displayHandle: false })
    .color(anchorColor)
    .opacity(0.9);

  // 4. create some segments
  // ----------------------------------------
  // override layer selection handle
  var segmentLayer = segment()
    .params({
      interactions: { editable: true },
      opacity: 0.3,
      handlerOpacity: 0.5
    })
    .data(segmentData)
    .color(segmentColor);


  var labelLayer = label()
    .data(segmentData)
    .x(function(d, v) { return d.start; })
    .y(0)
    .width(function(d, v) { return d.duration; })
    .height(1)
    .margin({ top: 2, right: 0, bottom: 0, left: 4 })
    .bgColor('none')
    .color('#686868');

  segmentLayer.on('drag', function(item, e) {
    graph.update(labelLayer);
  });

  // 5. create cursor
  // ----------------------------------------
  var cursor = new marker()
    .params({ displayHandle: false })
    .color(cursorColor)
    .opacity(0.9);

  // 6. add all the components to the graph
  // ----------------------------------------
  graph.add(waveformLayer);
  graph.add(segmentLayer);
  graph.add(labelLayer);
  graph.add(anchor);
  graph.add(cursor);

  // 6. draw the timeline and all its components
  // ----------------------------------------
  d3.select('#timeline').call(graph.draw);

  // adding zooming ability
  // ----------------------------------------
  // create a svg element for the zoomer
  var zoomerSvg = d3.select('#zoomer').append('svg')
    .attr('width', graphWidth)
    .attr('height', 30);

  // create the time axis - here a common d3 axis
  // graph must be drawn in order to have `graph.xScale` up to date
  var xAxis = d3.svg.axis()
    .scale(graph.xScale)
    .tickSize(1)
    .tickFormat(function(d) {
      var form = d % 1 === 0 ? '%S' : '%S:%L';
      var date = new Date(d * 1000);
      var format = d3.time.format(form);
      return format(date);
    });

  // add the axis to the newly created svg element
  var axis = zoomerSvg.append('g')
    .attr('class', 'x-axis')
    .attr('transform', 'translate(0, 0)')
    .attr('fill', '#555')
    .call(xAxis);

  // instanciate the zoomer layer
  var zoom = zoomer()
    .select('#zoomer')
    .on('mousedown', function(e) {
      var xDomainPos = graph.xScale.invert(e.anchor);
      anchor.setCurrentTime(xDomainPos);
      graph.update(anchor);
    })
    .on('mousemove', function(e) {
      e.originalEvent.preventDefault();
      // update graph
      graph.xZoom(e);
      graph.update();
      // redraw the axis to keep it up to date with the graph
      axis.call(xAxis);
    })
    .on('mouseup', function(e) {
      // set the final xZoom value of the graph
      graph.xZoomSet();
      // update axis
      axis.call(xAxis);
    });
  // */

  // // AUDIO
  /*
  var currentTime = 0;
  var transport = new waves.audio.Transport();
  var playControl = new waves.audio.PlayControl(transport);
  var granularEngine = new waves.audio.GranularEngine(buffer);

  transport.add(granularEngine, 0, buffer.duration, 0);
  granularEngine.connect(audioContext.destination);

  // // controls
  document.querySelector('#play').addEventListener('click', function(e) {
    e.preventDefault();
    playControl.seek(currentTime);
    playControl.start();
  });

  document.querySelector('#pause').addEventListener('click', function(e) {
    e.preventDefault();
    playControl.pause();
  });

  // document.querySelector('#speed').addEventListener('input', function(e) {
  //   e.preventDefault();
  //   playControl.speed = parseFloat(this.value, 10);
  // });

  // // keep cursor up to date
  (function loop() {
    currentTime = playControl.currentPosition;
    cursor.setCurrentTime(currentTime);
    graph.update(cursor);

    requestAnimationFrame(loop);
  }());

  */

  var currentTime = 0;
  var playerEngine = new waves.audio.PlayerEngine();
  playerEngine.buffer = buffer;
  playerEngine.cyclic = true;
  playerEngine.connect(audioContext.destination);

  // create play control
  var playControl = new waves.audio.PlayControl(playerEngine);
  playControl.setLoopBoundaries(0, 2 * buffer.duration);
  playControl.loop = true;

  // create position display (as scheduled TimeEngine)
  // var scheduler = new waves.audio.getScheduler();
  // var positionDisplay = new waves.audio.TimeEngine();
  // positionDisplay.period = 0.05;

  // positionDisplay.advanceTime = function(time) {
  //   seekSlider.value = (playControl.currentPosition / beatDuration).toFixed(2);
  //   return time + this.period;
  // };

  // create GUI elements
  new wavesBasicControllers.Buttons("Play", ['Start', 'Pause', 'Stop', 'Segment'], document.querySelector('#audio'), function(value) {
    switch (value) {
      case 'Start':
        playControl.start();
        (function loop() {
            currentTime = playControl.currentPosition;
            cursor.setCurrentTime(currentTime);
            graph.update(cursor);

            requestAnimationFrame(loop);
        }());
        break;

      case 'Pause':
        playControl.pause();
        break;

      case 'Stop':
        playControl.stop();
        break;

      case 'Segment':
        segmentData.push({
            start: playControl.currentPosition,
            duration: 5,
            text: 'Instrument Playing'
        });
        graph.update(labelLayer);
        graph.update(segmentLayer);
        break;
    }
  });
};