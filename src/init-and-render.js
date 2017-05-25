import 'jquery-ui/ui/widgets/draggable';
import draw from './draw';
import preview from './preview';

// Main options:
let options;

let ch = 200;
let zh = 50;
let chartHoverInfo;
let chartLeftPercent;
let chartRightPercent;

var chartCanvasWidth;
var handleWidth;

var returnArray = [];
var detectArray = [];
var chartData, range;
// var dataByPeriod = {'300': {},'900': {},'1800': {},'7200': {},'14400': {},'86400': {}};
var candlestickPeriod = 1800;
var chartsJsLoaded = false;
var chartRangeTop, chartRangeBottom;
var mainChartHeight, chartDecimals, indicatorHeight, macdRange;

var crosshairH;

function hideChartLoading() {
  $('#chart-canvas').show();
  $('.chart-container').addClass("ready");
}

function updateChartHighLow(high,low){
  high = parseFloat(high);
  low = parseFloat(low);
  if (isNaN(high))high = 0;
  if (isNaN(low))low = 0;
  $("#currentChartRange .low.info").empty().append(low.toFixed(8));
  $("#currentChartRange .high.info").empty().append(high.toFixed(8));
}

export function chartSnapZoom(hours) {
  var cw = getChartWidth();
  var leftPercent = 1 - (hours / (range / 3600));
  if (leftPercent<0)leftPercent=0;
  var rightPercent = 1.0;
  var left = (cw - handleWidth * 2) * leftPercent;
  var right = (cw - handleWidth * 2) * rightPercent;
  $('#chartBoundsLeft').css({
    'left': left,
  });
  $('#chartBoundsRight').css({
    'left': right + handleWidth,
  });
  $('#chartBounds').css({
    'left': left + handleWidth,
    'width': (right - left) + handleWidth
  });

  returnArray = draw('chart-canvas', chartData, leftPercent, rightPercent, candlestickPeriod, options);

  detectArray = returnArray['detectArray'];
  chartRangeTop = returnArray.rangeTop;
  chartRangeBottom = returnArray.rangeBottom;
  mainChartHeight = returnArray.mainChartHeight;
  chartDecimals = returnArray.decimals;
  indicatorHeight = returnArray.indicatorHeight;
  macdRange = returnArray.macdRange;
  updateChartHighLow(returnArray['high'],returnArray['low']);
  chartLeftPercent = leftPercent;
  chartRightPercent = rightPercent;
}

function changeCandlestickZoom(leftPercent, rightPercent) {
  returnArray = draw('chart-canvas', chartData, leftPercent, rightPercent, candlestickPeriod, options);
  detectArray = returnArray['detectArray'];
  chartRangeTop = returnArray.rangeTop;
  chartRangeBottom = returnArray.rangeBottom;
  mainChartHeight = returnArray.mainChartHeight;
  chartDecimals = returnArray.decimals;
  indicatorHeight = returnArray.indicatorHeight;
  macdRange = returnArray.macdRange;
  updateChartHighLow(returnArray['high'],returnArray['low']);
  chartLeftPercent = leftPercent;
  chartRightPercent = rightPercent;
}

function getChartWidth(){
  var cw = $('.chart-container .chart').css('width');
  cw = Number(cw.substr(0, cw.length-2)-2); // -2 to account for 1px border
  return cw;
}

function refreshChart() {
  var cw = getChartWidth();

  $('#preview-container, #preview-canvas, #chart-canvas, .chart-canvas-container')
    .attr({width: cw})
    .css({width: cw});

  var scale = window.devicePixelRatio;

  $('.chart-canvas-container').css('height',ch + 'px');
  $('#chart-canvas').attr({height: ch * scale, width: cw * scale}).css('height',ch + 'px');
  $('#preview-canvas').attr({height: zh * scale, width: cw * scale});

  changeCandlestickZoom(chartLeftPercent, chartRightPercent);

  // The bottom Zoom control (preview of all data):
  preview('preview-canvas', chartData, handleWidth, options.colors);
}

// function changecandlestickPeriod(candlestickPeriod) {
//   var left = $('#chartBoundsLeft').position().left + handleWidth;
//   var right = $('#chartBoundsRight').position().left;
//
//   if ('candleStick' in dataByPeriod[candlestickPeriod]){
//     refreshCandleSticks();
//   } else {
//     refreshCandleSticksFirst();
//   }
// }

// function setCurrentCandlestickButton() {
//   $('.candlesticks .button.chartButtonActive').removeClass('chartButtonActive');
//   $('.candlesticks .button#chartButton' + candlestickPeriod).addClass('chartButtonActive');
// }

// function refreshCandleSticksFirst(candlestickData) {
//
//   // Load data for the selected candleStick period:
//   dataByPeriod[candlestickPeriod].data = candlestickData;
//
//   var data = dataByPeriod[candlestickPeriod].data;
//   range = data[data.length-1].date - data[0].date;
//   dataByPeriod[candlestickPeriod].range = range;
//
//   chartData = data;
//   setCurrentCandlestickButton();
//   refreshChart();
//   hideChartLoading();
// }

function deactivateCurrentZoomButton() {
  $('.zoom .active').blur();
  $('.zoom .active').removeClass('active');
}

export function initPreview() {
  updateChartCanvasWidth();
  var cw = getChartWidth();
  var maxRight = cw - handleWidth,
    minRight = handleWidth,
    maxLeft = cw - handleWidth*2,
    minLeft = 0;
  var cbl = $("#chartBoundsLeft");
  var cbr = $('#chartBoundsRight');
  var left = cbl.position().left + handleWidth;
  var right = cbr.position().left;

  $("#chart-bounds-left-container").css('padding-right', (chartCanvasWidth - right) + "px");
  $("#chart-bounds-right-container").css('padding-left', (left) + "px");
  $("#chartBoundsRight").draggable({
    drag: function(event, ui) {
      var left = $('#chartBoundsLeft').position().left + handleWidth * 2;
      var right = $('#chartBoundsRight').position().left;
      var maxRightHandleLeft = left;
      if (right > maxRight) right = maxRight;
      if (right < maxRightHandleLeft) {
        right = maxRightHandleLeft;
        cbr.css({left: maxRightHandleLeft});
        return false;
      }
      var leftPercent = (left - handleWidth)/(cw - handleWidth*2);
      var rightPercent = (right - handleWidth)/(cw - handleWidth*2);

      changeCandlestickZoom(leftPercent, rightPercent);
      $('#chartBounds').css({
        'left': left - handleWidth,
        'width': (right - left) + handleWidth*2
      });
      deactivateCurrentZoomButton();
    },
    cursor: 'ew-resize',
    axis: "x",

    containment: $('#preview-container'),
    stop: function(event, ui) {
      var left = $('#chartBoundsLeft').position().left + handleWidth * 2;
      var right = $('#chartBoundsRight').position().left;
      if (right < left) right = left;
      $('#chartBoundsRight').css({
        'left': right,
      });
      $('#chartBounds').css({
        'left': left - handleWidth,
        'width': (right - left) + handleWidth*2
      });
      $("#chart-bounds-left-container").css(
        'padding-right', (chartCanvasWidth -
        right) + "px");

      var cw = getChartWidth();
      chartLeftPercent = (left - handleWidth)/(cw - handleWidth*2);
      chartRightPercent = (right - handleWidth)/(cw - handleWidth*2);

      deactivateCurrentZoomButton();
    },
    refreshPositions: true
  });
  $("#chartBoundsLeft").draggable({
    drag: function(event, ui) {
      var left = $('#chartBoundsLeft').position().left + handleWidth * 2;
      var right = $('#chartBoundsRight').position().left;
      var maxLeftHandleRight = right;
      if (left < minLeft) left = minLeft;
      if (left > maxLeftHandleRight) {
        left = maxLeftHandleRight - handleWidth * 2;
        cbl.css({left: left});
        return false;
      }
      $('#chartBoundsLeft').css({
        'left': left - handleWidth,
      });
      $('#chartBounds').css({
        'left': left - handleWidth,
        'width': (right - left) + handleWidth*2
      });
      var cw = getChartWidth();
      var leftPercent = (left - handleWidth)/(cw - handleWidth*2);
      var rightPercent = (right - handleWidth)/(cw - handleWidth*2);

      changeCandlestickZoom(leftPercent, rightPercent);
      deactivateCurrentZoomButton();
    },
    cursor: 'ew-resize',
    axis: "x",

    containment: $("#preview-container"),
    stop: function(event, ui) {
      var left = $('#chartBoundsLeft').position().left + handleWidth * 2;
      var right = $('#chartBoundsRight').position().left;
      if (left > right) left = right;
      $('#chartBounds').css({
        'left': left - handleWidth,
        'width': (right - left) + handleWidth*2
      });
      $("#chart-bounds-right-container").css(
        'padding-left', (left) +
        "px");

      var cw = getChartWidth();
      chartLeftPercent = (left - handleWidth)/(cw - handleWidth*2);
      chartRightPercent = (right - handleWidth)/(cw - handleWidth*2);
      deactivateCurrentZoomButton();
    },
    refreshPositions: true
  });
  $("#chartBounds").draggable({
    drag: function(event, ui) {
      var left = $('#chartBounds').position().left + handleWidth;
      var right = left + $('#chartBounds').width() - handleWidth * 2;
      if (left < minLeft) left = minLeft;
      if (left > maxLeft) left = maxLeft;
      if (right > maxRight) right = maxRight;
      if (right < minRight) right = minRight;
      $('#chartBoundsLeft').css({
        'left': left - handleWidth * 2,
      });
      $('#chartBoundsRight').css({
        'left': right,
      });
      var cw = getChartWidth();
      var leftPercent = (left - handleWidth)/(cw - handleWidth*2);
      var rightPercent = (right - handleWidth)/(cw - handleWidth*2);

      changeCandlestickZoom(leftPercent, rightPercent);
    },
    axis: "x",
    stop: function(event, ui) {
      var cw = getChartWidth();
      var left = $('#chartBounds').position().left + handleWidth;
      var right = left + $('#chartBounds').width() - handleWidth * 2;
      if (left < minLeft) left = minLeft;
      if (left > maxLeft) left = maxLeft;
      if (right > maxRight) right = maxRight;
      if (right < minRight) right = minRight;
      $('#chartBoundsLeft').css({
        'left': left - handleWidth * 2,
      });
      $('#chartBoundsRight').css({
        'left': right,
      });
      $("#chart-bounds-left-container").css(
        'padding-right', (cw - right) + "px");
      $("#chart-bounds-right-container").css(
        'padding-left', (left) +
        "px");
      chartLeftPercent = (left - handleWidth)/(cw - handleWidth*2);
      chartRightPercent = (right - handleWidth)/(cw - handleWidth*2);
    },
    containment: $("#preview-container")
  });
}

function updateChartCanvasWidth() {
  chartCanvasWidth = $('.chart-canvas-container').width();
}

export function resizeCharts() {
  updateChartCanvasWidth();

  var cw = getChartWidth();

  let chartLeft = chartLeftPercent * (cw - handleWidth * 2);
  let chartRight = chartRightPercent * (cw - handleWidth * 2);

  $('#chartBoundsRight').css({left: chartRight + handleWidth});
  $('#chartBoundsLeft').css({left: chartLeft - handleWidth});
  $('#chartBounds').css({width: (chartRight - chartLeft) + handleWidth*2, left: chartLeft});

  initPreview();
  refreshChart();
}

function initChartMouseover() {
  // Main Chart
  $('.chart-canvas-container').on('mousemove', function (e) {
    if (!detectArray){
      return;
    }
    var posX = e.pageX - this.offsetLeft - $(".chart-canvas-container").offset().left;
    for (var c = 0; c < detectArray.length; c++) {
      var info = detectArray[c];
      var gap = info.right - info.left;
      if (posX > info.left && posX < info.right) {
        crosshairH = info.left + (gap/3) - 0.5;
        var volumeString = info.volume.toString();
        if (volumeString.length > 6)volumeString = volumeString.substring(0, 6);
        var quoteVolumeString = info.quoteVolume.toString();
        if (quoteVolumeString.length > 8 && quoteVolumeString.indexOf(".")>0){
          var qSub = quoteVolumeString.substring(0, quoteVolumeString.indexOf("."));
          if (qSub.length>4){
            quoteVolumeString = qSub;
          } else {
            quoteVolumeString = quoteVolumeString.substring(0,8);
          }
        }

        chartHoverInfo.open = info.open.toFixed(8);
        chartHoverInfo.close = info.close.toFixed(8);
        chartHoverInfo.volumePrimary = volumeString;
        chartHoverInfo.volumeSecondary = quoteVolumeString;
        chartHoverInfo.date = info.date
        chartHoverInfo.isVisible = true;
        break;
      }
    }

    if (typeof crosshairH == "undefined")
      crosshairH = detectArray[detectArray.length-1].left + (gap/3) - 0.5;

    var l = e.pageX - 160;
    var crosshairV = e.pageY - $(".chart-canvas-container").offset().top - 3;
    var linePosText;

    if (crosshairV<=mainChartHeight){
      linePosText = (chartRangeTop - ((crosshairV+1)/mainChartHeight)*(chartRangeTop-chartRangeBottom)).toFixed(chartDecimals);
    } else {
      linePosText = (0-((crosshairV - mainChartHeight) / indicatorHeight * (macdRange * 2) - macdRange)).toFixed(8);
    }

    $("#crosshairHInfoTextContainer").empty().append(linePosText);
    var crosshairHInfoPos = crosshairV;
    if (crosshairV < 12 | (crosshairV>mainChartHeight && crosshairV<mainChartHeight + 12)){
      $('#crosshairHInfo').css('margin-top','0px');
    } else {
      $('#crosshairHInfo').css('margin-top','-' + $('#crosshairHInfo').css('height'));
    }
    $('#indicatorInfo').css('top', mainChartHeight+1).css('display', 'block');
    $('#chartCrosshairV').css('left', crosshairH).css('display', 'block');
    if (crosshairV > (mainChartHeight + indicatorHeight) | crosshairV<-1){
      $('#crosshairHInfo').css('top', crosshairHInfoPos).css('display', 'none');
      $('#chartCrosshairH').css('top', crosshairV).css('display', 'none');
    } else {
      $('#crosshairHInfo').css('top', crosshairHInfoPos).css('display', 'block');
      $('#chartCrosshairH').css('top', crosshairV).css('display', 'block');
    }

  });
  $('.chart-canvas-container').mouseout(function() {
    chartHoverInfo.isVisible = false;
    $('#indicatorInfo').css('display', 'none');
    $('#crosshairHInfo').css('display', 'none');
    $('#chartCrosshairH').css('display', 'none');
    $('#chartCrosshairV').css('display', 'none');
  });
}

/**
 * @function init
 * Initialize chart: canvas, control listeners, etc.
 *
 * @param options
 */
export function init (opts) {
  options = opts;

  ch = opts.height;
  chartHoverInfo = opts.chartHoverInfo;
  chartLeftPercent = opts.zoomStart;
  chartRightPercent = opts.zoomEnd;

  handleWidth = $('#chartBoundsLeft').width();
  updateChartCanvasWidth();
  initChartMouseover();

  $(window).resize(function(){ resizeCharts(); });
}

export default function render (data) {
  chartData = data;
  range = data[data.length-1].date - data[0].date;
  hideChartLoading();
  resizeCharts();
}

$(document).ready(function() {
  chartsJsLoaded = true;
});