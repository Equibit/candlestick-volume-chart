/**
 * @module preview Preview
 *
 * Draws chart preview with data of the whole range.
 *
 * @param canvasId
 * @param data
 * @param gutterWidth
 * @param colors
 */

export default function preview (canvasId, data, gutterWidth, colors) {
  if (data === undefined) { return false; }
  var c = document.getElementById(canvasId);
  var ctx = c.getContext("2d");
  var scaleFactor = window.devicePixelRatio;
  if (scaleFactor > 1) {
    if (c.style.width < 10) {
      c.style.width = c.width;
      c.style.height = c.height;
      c.width = c.width * scaleFactor;
      c.height = c.height * scaleFactor;
      ctx = c.getContext("2d");
    }
  }
  gutterWidth *= scaleFactor;
  var width = c.width - (gutterWidth * 2);
  var height = c.height;
  var x, vScale;
  var top = 0,
    bottom = 10000;
  var close;
  var marginTop = 10 * scaleFactor;
  var marginBottom = 10 * scaleFactor;

  // To avoid unnecessary load, skip data points between pixels
  var iStep = Math.max(Math.floor(data.length/width),1);

  for (var i = 0; i < data.length; i+=iStep) {
    if (!(data[i] instanceof Object)) {
      delete data[i];
      continue;
    }
    close = data[i].close;
    if (close > top) top = close;
    if (close < bottom) bottom = close;
  }
  vScale = (height - (marginTop + marginBottom)) / (top - bottom);
  let shft = Math.floor(bottom * vScale - marginBottom);
  close = data[0].close;
  ctx.beginPath();
  ctx.moveTo(gutterWidth, height - (close * vScale) + shft);


  for (var i = 1; i < data.length; i+=iStep) {
    if (!(data[i] instanceof Object)) {
      delete data[i];
      continue;
    }
    close = data[i].close;
    x = (i / data.length) * width;
    ctx.lineTo(x + gutterWidth, height - (close * vScale) + shft);
  }
  ctx.strokeStyle = colors.preview;

  ctx.stroke();
}