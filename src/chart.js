// import 'jquery-ui/ui/widgets/draggable';
import candlestick, { preview } from './candlestick';

//settiongs:
var primaryCurrency = 'BTC';
var secondaryCurrency = 'LTC';
var currencyPair = 'BTC_LTC';

var loggedIn = false;
var dark = false;
var mobile = false;
var mobileDetected = false;
var usid = false;
////

var chartLeft = 650;
var chartRight = 1000;
var chartLeftPrev = chartLeft;
var chartRightPrev = chartRight;
var chartLeftPercent = 0.90;
var chartRightPercent = 1.00;

var chartCanvasWidth = 1000;
var chartCanvasWidthPrev = chartCanvasWidth;
var handleWidth;

var depthDetectArrays;
var currencyPair;
var primaryCurrency;
var secondaryCurrency;
var returnArray = [];
var detectArray = [];
var chartData, range;
var smaPeriod =50;
var emaPeriod =30;
var ema2Period =20;
var showSma = false;
var showEma = false;
var showFib=false;
var bollingerBand=false;
var showEma2=false;
var dataByPeriod = {'300': {},'900': {},'1800': {},'7200': {},'14400': {},'86400': {}};
var candlestickPeriod = 1800;
var orderBook;
var chartsJsLoaded = false;
var destinationL = 0,destinationT = 0;
var chartRangeTop,chartRangeBottom;
var mainChartHeight, chartDecimals, indicatorHeight, macdRange;

var crosshairH;

function hideChartLoading() {
  $('#chart30Canvas').show();
  $('.bigChart').addClass("ready");
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
    'left': left,
    'width': (right - left) + handleWidth*2
  });

  returnArray = candlestick('chart30Canvas', chartData, leftPercent, rightPercent,
    candlestickPeriod, dark, smaPeriod, emaPeriod, ema2Period, showSma,
    showEma, showEma2, showFib, bollingerBand);

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
  returnArray = candlestick('chart30Canvas', chartData, leftPercent, rightPercent, candlestickPeriod, dark, smaPeriod, emaPeriod, ema2Period, showSma, showEma, showEma2, showFib, bollingerBand);
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
  var cw = $('.bigChart .chart').css('width');
  cw = Number(cw.substr(0, cw.length-2)-2); // -2 to account for 1px border
  return cw;
}

function refreshChart() {
  var cw = getChartWidth();
  var ch = 450;
  var dh = 200;
  var zh = 50;

  $('#zoomDiv, #previewCanvas, #chart30Canvas, #canvasContainer')
    .attr({width: cw})
    .css({width: cw});

  var scale = window.devicePixelRatio;

  $('#canvasContainer').css('height',ch + 'px');
  $('#chart30Canvas').attr({height: ch * scale, width: cw * scale}).css('height',ch + 'px');
  $('#previewCanvas').attr({height: zh * scale, width: cw * scale});

  var leftPercent = chartLeftPercent;
  var rightPercent = chartRightPercent

  changeCandlestickZoom(leftPercent, rightPercent);

  // The bottom Zoom control (preview of all data):
  preview('previewCanvas', chartData, handleWidth);
}

function changecandlestickPeriod(candlestickPeriod) {
  var left = $('#chartBoundsLeft').position().left + handleWidth;
  var right = $('#chartBoundsRight').position().left;
  window.candlestickPeriod = candlestickPeriod;

  if ('candleStick' in dataByPeriod[candlestickPeriod]){
    refreshCandleSticks();
  } else {
    refreshCandleSticksFirst();
  }
}

function setCurrentCandlestickButton() {
  $('.candlesticks .button.chartButtonActive').removeClass('chartButtonActive');
  $('.candlesticks .button#chartButton' + candlestickPeriod).addClass('chartButtonActive');
}

function refreshCandleSticksFirst(candlestickData) {

  // Load data for the selected candleStick period:
  dataByPeriod[candlestickPeriod].data = candlestickData;

  var data = dataByPeriod[candlestickPeriod].data;
  range = data[data.length-1].date - data[0].date;
  dataByPeriod[candlestickPeriod].range = range;

  chartData = data;
  setCurrentCandlestickButton();
  refreshChart();
  hideChartLoading();
}

function deactivateCurrentZoomButton() {
  $('.zoom .chartButtonActive').blur();
  $('.zoom .chartButtonActive').removeClass('chartButtonActive');
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

  $("#chartBoundsLeftContainer").css('padding-right', (chartCanvasWidth - right) + "px");
  $("#chartBoundsRightContainer").css('padding-left', (left) + "px");
  $("#chartBoundsRight").draggable({
    drag: function(event, ui) {
      var left = $('#chartBoundsLeft').position().left + handleWidth;
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

    containment: $('#zoomDiv'),
    stop: function(event, ui) {
      var left = $('#chartBoundsLeft').position().left + handleWidth;
      var right = $('#chartBoundsRight').position().left;
      if (right < left) right = left;
      $('#chartBoundsRight').css({
        'left': right,
      });
      $('#chartBounds').css({
        'left': left - handleWidth,
        'width': (right - left) + handleWidth*2
      });
      $("#chartBoundsLeftContainer").css(
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
      var left = $('#chartBoundsLeft').position().left + handleWidth;
      var right = $('#chartBoundsRight').position().left;
      var maxLeftHandleRight = right;
      if (left < minLeft) left = minLeft;
      if (left > maxLeftHandleRight) {
        left = maxLeftHandleRight - handleWidth;
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

    containment: $("#zoomDiv"),
    stop: function(event, ui) {
      var left = $('#chartBoundsLeft').position().left + handleWidth;
      var right = $('#chartBoundsRight').position().left;
      if (left > right) left = right;
      $('#chartBounds').css({
        'left': left - handleWidth,
        'width': (right - left) + handleWidth*2
      });
      $("#chartBoundsRightContainer").css(
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
        'left': left - handleWidth,
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
        'left': left - handleWidth,
      });
      $('#chartBoundsRight').css({
        'left': right,
      });
      $("#chartBoundsLeftContainer").css(
        'padding-right', (cw - right) + "px");
      $("#chartBoundsRightContainer").css(
        'padding-left', (left) +
        "px");
      chartLeftPercent = (left - handleWidth)/(cw - handleWidth*2);
      chartRightPercent = (right - handleWidth)/(cw - handleWidth*2);
    },
    containment: $("#zoomDiv")
  });
}

function updateChartCanvasWidth() {
  chartCanvasWidth = $('#canvasContainer').width();
}

export function resizeCharts() {
  updateChartCanvasWidth();

  var cw = getChartWidth();

  chartLeft = chartLeftPercent * (cw - handleWidth * 2);
  chartRight = chartRightPercent * (cw - handleWidth * 2);

  $('#chartBoundsRight').css({left: chartRight + handleWidth});
  $('#chartBoundsLeft').css({left: chartLeft});
  $('#chartBounds').css({width: (chartRight - chartLeft) + handleWidth*2, left:chartLeft});

  initPreview();
  refreshChart();

  chartCanvasWidthPrev = chartCanvasWidth;
}

function initChartMouseover() {
  // Main Chart
  $('#canvasContainer').on('mousemove', function (e) {
    if (!detectArray){
      return;
    }
    var posX = e.pageX - this.offsetLeft - $("#canvasContainer").offset().left;
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

        var chartInfoString = "<table class='mainChartInfoTable'><tr><td class='description'>Open:</td><td>" + info.open.toFixed(8) + "</td><td>&nbsp;</td>"
          + "<td class='description'>Close:</td><td>" + info.close.toFixed(8) + "</td><td>&nbsp;</td>"
          + "<td class='description'>High:</td><td>" + info.high.toFixed(8) + "</td><td>&nbsp;</td>"
          + "<td class='description'>Low:</td><td>" + info.low.toFixed(8) + "</td></tr>"
          + "<tr><td class='description'>Wtd Avg:</td><td>" + info.weightedAverage.toFixed(8) + "</td><td>&nbsp;</td>"
          + "<td class='description'>" + "Vol (" + primaryCurrency + "):</td><td>" + volumeString + "</td><td>&nbsp;</td>"
          + "<td class='description'>" + "Vol (" + secondaryCurrency + "):</td><td>" + quoteVolumeString + "</td><td>&nbsp;</td>"
          + "<td class='description'>Date:</td><td>" + info.date + "</td></tr></table>";
        $("#mainChartInfo").empty().append(chartInfoString);
        break;
      }
    }

    if (typeof crosshairH == "undefined")
      crosshairH = detectArray[detectArray.length-1].left + (gap/3) - 0.5;

    var l = e.pageX - 160;
    var crosshairV = e.pageY - $("#canvasContainer").offset().top - 3;
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
    /*
     if(e.pageX < 200){
     if ($('#mainChartInfo').css != 175){
     $('#mainChartInfo').css('margin-left',175);
     }
     } else {
     if ($('#mainChartInfo').css != 10){
     $('#mainChartInfo').css('margin-left',10);
     }
     }
     */
    //$('#mainChartInfo').css('left', l).css('top', e.pageY - 125).css('display', 'block');
    $('#mainChartInfo').css('display', 'block');
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
  $('#canvasContainer').mouseout(function() {
    $('#mainChartInfo').css('display', 'none');
    $('#indicatorInfo').css('display', 'none');
    $('#crosshairHInfo').css('display', 'none');
    $('#chartCrosshairH').css('display', 'none');
    $('#chartCrosshairV').css('display', 'none');
  });
}

export function init() {
  console.log('Chart:init()');
  handleWidth = $('#chartBoundsLeft').width();
  updateChartCanvasWidth();
  chartCanvasWidthPrev = chartCanvasWidth;
  initChartMouseover();

  $(window).resize(function(){resizeCharts();});
}

export default function render (data) {
  console.log('Chart:render()');
  chartData = data;
  range = data[data.length-1].date - data[0].date;
  hideChartLoading();
  resizeCharts();
}

$(document).ready(function() {
  chartsJsLoaded = true;
});