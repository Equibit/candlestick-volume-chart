/**
 * @module draw Draw chart
 *
 * Draw candlestick and volume charts on canvas.
 *
 * @param canvasId
 * @param data
 * @param left
 * @param right
 * @param candlestickPeriod
 * @param colors
 */

import moment from 'moment';

var numberOfCandles;
var shft;
var lineRangeTop;
var lineRangeBottom;

export default function draw (canvasId, data, left, right, candlestickPeriod, colors, mobile = false) {
  if (!data) {
    return false;
  }

  var c = document.getElementById(canvasId);
  var ctx = c.getContext("2d");
  var scaleFactor = window.devicePixelRatio;
  // scaleFactor = 1;

  if (scaleFactor > 1) {
    if (c.style.width < 10) {
      c.style.width = c.width;
      c.style.height = c.height;
      c.width = c.width * scaleFactor;
      c.height = c.height * scaleFactor;
      ctx = c.getContext("2d");
    }
  }
  ctx.clearRect(0, 0, c.width, c.height);

  var alignYaxisRight = false;

  var width = c.width;
  var height = c.height;
  ctx.lineWidth = 1 * scaleFactor;
  var marginLeft = 65 * scaleFactor;
  var marginRight = 0;
  if (alignYaxisRight) {
    marginLeft = 0 * scaleFactor;
    marginRight = 60 * scaleFactor;
    width = width - marginRight;
  }

  var dateMargin = (mobile ? 10 : 12) * scaleFactor;
  // Margin for candlestick chart and right Y-axis labels:
  var marginBottom = 60; //mobile ? 40 : 60;
  // Padding for Volume chart:
  var paddingBottom = 40; //mobile ? 22 : 40;
  var marginTop = (mobile ? 10 : 30) * scaleFactor;

  // The spacing for the middle chart that we dont need:
  var indicatorMargin = 0; // mobile ? 0.0 : Math.floor((height - marginBottom) * 0.20); // indicatorMargin already has scale applied from height

  marginBottom *= scaleFactor;
  paddingBottom *= scaleFactor;
  paddingBottom += indicatorMargin;
  marginBottom += indicatorMargin;

  var chartHigh, chartLow;
  var top = 0,
    bottom = 10000,
    maxVol = 0;
  var vScale, volScale;
  var fibLowX, fibHighX;
  //trace(canvasId + ' w = ' + width + ', h = ' + height + ' ; d=' +dark);

  // Colors:
  let { borderColor, wickColor, textColor, lineColor, volumeColor, greenColor, redColor } = colors;

  if (right > 1) right = 1;
  if (left >= right)left = right - 0.001;
  if (left < 0) left = 0;
  if (right <= left)right = left + 0.001;

  numberOfCandles = Math.floor(data.length * (right - left));
  var end = Math.floor(data.length * right);
  var start = end - numberOfCandles;
  var candleWidth = ((width - marginLeft) / numberOfCandles) * (2 / 3);
  var wickWidth = candleWidth / 4;
  var candleSpacing = candleWidth / 2;
  var returnArray = new Array();
  var detectArray = new Array();
  var size = Math.floor(10 * scaleFactor);
  ctx.font = size + "px Arial";
  ctx.clearRect(0, 0, width, height);
  if (data.length < 2) {
    ctx.fillStyle = textColor;
    ctx.fillText(
      "Chart will be available once a few more trades have been made.",
      width / 2 - 245, height / 2 - 20);
    detectArray[0] = {
      'left': 0,
      'right': width * scaleFactor,
      'high': 0.0,
      'low': 0.0,
      'open': 0.0,
      'close': 0.0,
      'volume': 0.0,
      'quoteVolume': 0.0,
      'weightedAverage': 0.0,
      'date': 'N/A'
    };
    returnArray['detectArray'] = detectArray;
    returnArray['high'] = 0.0;
    returnArray['low'] = 0.0;
    return returnArray;
  }
  for (var i = start; i < end; i++) {
    if (i < 0) continue;
    if (!(data[i] instanceof Object)) {
      delete data[i];
      continue;
    }
    if (data[i].high > top) top = data[i].high;
    if (data[i].low < bottom) bottom = data[i].low;
    if (data[i].volume > maxVol) maxVol = data[i].volume;
  }
  chartHigh = top;
  chartLow = bottom;
  if (top == bottom) {
    top += 0.00000005;
    bottom -= 0.00000005;
    if (bottom < 0) bottom = 0;
  }
  vScale = (height - (marginTop + marginBottom)) / (top - bottom);
  volScale = (height - marginTop) / maxVol;
  volScale = volScale * 0.6;
  shft = Math.floor(bottom * vScale - marginBottom);
  var step = Math.floor(height / (50*scaleFactor));
  var decimals = 4;
  var counter = 1;
  while (bottom.toFixed(counter) == 0 && decimals < 8) {
    decimals++;
    counter++;
  }
  var sticksPerTimestamp = Math.round(32*scaleFactor/candleWidth);
  if (sticksPerTimestamp < 1) sticksPerTimestamp = 1;

  // Draw dates on X-axis:
  drawXDates(ctx, data, start, end, sticksPerTimestamp, borderColor, marginLeft,
    candleWidth, candleSpacing, height, textColor, dateMargin, scaleFactor);

  // Draw Y-axis:
  var { lineBottom, paddingBottom } = drawYLabels(ctx, scaleFactor, vScale, step, height, width, top, bottom,
    marginTop, marginBottom, marginLeft, paddingBottom, textColor, lineColor, decimals);

  lineRangeBottom = lineBottom;

  // Draw Volume and Candlesticks:
  let count = 0;
  for (var i = start; i < end; i++) {
    if (i < 0) continue;
    if (!(data[i] instanceof Object)) {
      delete data[i];
      continue;
    }
    let high = data[i].high;
    let low = data[i].low;
    let open = data[i].open;
    let close = data[i].close;
    let volume = data[i].volume;
    let candlestickColor = close > open ? greenColor : redColor;
    let x = (count * candleWidth) + (count * candleSpacing) - 1;
    let w = candleWidth + (candleSpacing / 2);
    let h = Math.floor(volume * volScale);
    let y = height - h;

    ctx.fillStyle = volumeColor;
    ctx.fillRect(x + marginLeft, y - paddingBottom, w, h);

    x = (count * candleWidth) + (count * candleSpacing) + (candleWidth /
      2) - (wickWidth / 2);
    y = height - (high * vScale);
    h = (high - low) * vScale;
    //x=Math.floor(x);

    ctx.fillStyle = wickColor || candlestickColor;
    ctx.fillRect(x + marginLeft, y + shft, wickWidth, h);

    if (low == chartLow) fibLowX = x;
    if (high == chartHigh) fibHighX = x;
    if (close > open) {
      y = height - (close * vScale);
      h = (close - open) * vScale;
    }
    if (close < open) {
      y = height - (open * vScale);
      h = (open - close) * vScale;
    }
    if (close == open) {
      y = height - (open * vScale);
      h = 1;
    }
    x = (count * candleWidth) + (count * candleSpacing);
    if (h < 1) h = 1;
    y = Math.floor(y);
    h = Math.floor(h);

    ctx.fillStyle = candlestickColor;
    ctx.fillRect(x + marginLeft, y + shft, candleWidth, h);

    var date = new Date(data[i].date * 1000);
    detectArray[count] = {
      'left': (x + marginLeft) / scaleFactor,
      'right': (x + marginLeft + candleWidth + candleSpacing) / scaleFactor,
      'high': high,
      'low': low,
      'open': open,
      'close': close,
      'volume': volume,
      'quoteVolume': data[i].quoteVolume,
      'weightedAverage': data[i].weightedAverage,
      'date': date
    };
    count++;
    // because the canvas is 2x as wide as the div that contains it, for hi-res screens, we have to scale down the detect array elements
    // count += scaleFactor / 2;
  }
  // trace('create detectArray (' + detectArray.length + '), ' + detectArray[detectArray.length-1].right);
  // trace('scale is ' + scaleFactor);

  returnArray['detectArray'] = detectArray;
  returnArray['high'] = chartHigh;
  returnArray['low'] = chartLow;
  returnArray['rangeTop'] = typeof lineRangeTop == "undefined" ? 0 : lineRangeTop;
  returnArray['rangeBottom'] = typeof lineRangeBottom == "undefined" ? 0 : lineRangeBottom;
  returnArray['decimals'] = decimals;
  returnArray['mainChartHeight'] = (height - paddingBottom)/scaleFactor;
  returnArray['indicatorHeight'] = indicatorMargin/scaleFactor;
  return returnArray;
}

function drawXDates (ctx, data, start, end, sticksPerTimestamp, lineColor, marginLeft,
                     candleWidth, candleSpacing, height, textColor, dateMargin, scaleFactor) {
  let count = 0;
  let lineCount = 0;
  let timestampCount = sticksPerTimestamp;

  for (var i = start; i < end; i++) {
    if (i < 0) continue;
    if (!(data[i] instanceof Object)) {
      delete data[i];
      continue;
    }
    if (timestampCount == sticksPerTimestamp) {
      lineCount++;
      timestampCount = 0;

      ctx.fillStyle = lineColor;
      let x = marginLeft + count * (candleWidth + candleSpacing) + (candleWidth / 2);
      let y = 0;
      ctx.fillRect(x - 1, y + height - 50, 2, 6);

      var dateH =  height - dateMargin;
      var timeH = dateH + 10*scaleFactor;
      x -= 13 * scaleFactor;

      // show date on every 2nd vertical marks till there are less than 8 marks:
      if (lineCount % 2 === 1 || end - start < 8) {
        let momentDate = moment(new Date(data[i].date * 1000));
        let date = momentDate.format('MMMM D');
        let time = momentDate.format('hh:mm A');
        ctx.fillStyle = textColor;
        ctx.fillText(date, x, dateH);
        ctx.fillText(time, x, timeH);
      }
    }
    timestampCount++;
    count++;
  }
}

function drawYLabels (ctx, scaleFactor, vScale, step, height, width, top, bottom,
                      marginTop, marginBottom, marginLeft, paddingBottom, textColor, lineColor, decimals) {
  var lineBottom = bottom - ((marginBottom - paddingBottom) / vScale);
  if (lineBottom < 0){
    lineBottom = 0;
    paddingBottom -= Math.round((bottom - ((marginBottom - paddingBottom) / vScale)) * vScale);
  }
  var lineTop = top + (marginTop / vScale);

  // Horizontal lines and Y-axis labels:
  for (var l = lineBottom; l <= lineTop+((lineTop - lineBottom) / step)/2; l += (lineTop - lineBottom) / step) {
    ctx.fillStyle = lineColor;
    let x = marginLeft;
    let y = Math.floor(height - (l * vScale));
    // if (alignYaxisRight) { horizLineW = c.width; }
    ctx.fillRect(x, y + shft, width, 1);
    ctx.fillStyle = textColor;

    // move Y-axis text into right margin
    var labelPos = 0;
    // if (alignYaxisRight) { labelPos = w + 5; }
    var txtYpos = y + shft - 3;
    if ((l+(lineTop - lineBottom)/step)>lineTop+((lineTop - lineBottom) / step)/2)txtYpos+=10*scaleFactor+(2/scaleFactor);
    ctx.fillText(l.toFixed(decimals), labelPos, txtYpos);
    lineRangeTop = l;
  }
  return { lineBottom, paddingBottom };
}