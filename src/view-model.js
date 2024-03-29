import DefineMap from 'can-define/map/map';
import render, { init, chartSnapZoom } from './init-and-render';
import colors from './colors';
import { InfoData } from './chart-info/view-model';

export default DefineMap.extend({
  /**
   * @property {Array} data
   */
  chartData: {
    type: '*',
    set (val) {
      this.drawChart(val);
      return val;
    }
  },

  /**
   * @property {Number} candlestickSize
   * The size of a candlestick, in seconds.
   */
  candlestickSize: 'number',

  /**
   * @property {Object} colors
   * Colors for the chart.
   */
  colors: {
    type: '*',
    value: colors,
    set (val) {
      return Object.assign(colors, val);
    }
  },

  /**
   * @property {Number} chartHeight
   */
  chartHeight: {
    value: 200
  },

  /**
   * @property {Boolean} isInitialized
   * Indicates whether the chart was initialized.
   */
  isInitialized: 'boolean',

  zoom: 'number',

  /**
   * @property {Number} zoomStart
   * Initial value for the left border of the preview zoom window. From 0 to 1.
   */
  zoomStart: {
    type: 'number',
    value: 0.9
  },

  /**
   * @property {Number} zoomEnd
   * Initial value for the right border of the preview zoom window. From `zoomStart` to 1.
   */
  zoomEnd: {
    type: 'number',
    value: 1
  },

  chartHoverInfo: {
    value: new InfoData({
      currencyPrimary: 'EQB',
      currencySecondary: 'BTC'
    })
  },

	/**
   * @property {String} zoomLabel
   * Text label for zoom controls
	 */
	zoomLabel: {
	  value: 'Zoom'
  },

	/**
   * @property {String} candlestickLabel
   * Text label for candlestick size controls
	 */
	candlestickLabel: {
	  value: 'Candlesticks'
  },

	/**
	 * @property {String} dateFormat
	 * String format for MomentJS, the date of X-axis tick.
	 */
	dateFormat: {
	  value: 'MMMM D'
  },

	/**
	 * @property {String} timeFormat
	 * String format for MomentJS, the time of X-axis tick.
	 */
	timeFormat: {
	  value: 'hh:mm A'
  },

	/**
	 * @property {String} fontFamily
	 * Font family for Y-axis.
	 */
	fontFamily: {
	  value: 'Arial'
  },

	/**
   * @function initChart
   * Initializes chart (size, mouse events, etc).
   */
  initChart () {
    init({
      colors: this.colors,
      height: this.chartHeight,
      chartHoverInfo: this.chartHoverInfo,
      zoomStart: this.zoomStart,
      zoomEnd: this.zoomEnd,
			fontFamily: this.fontFamily,
			dateFormat: this.dateFormat,
			timeFormat: this.timeFormat
    });
    this.isInitialized = true;
    if (this.chartData) {
      this.drawChart();
    }
  },

  /**
   * @function drawChart
   * Main function to render chart data.
   *
   * @param {Array} data
   */
  drawChart (data = this.chartData) {
    if (!this.isInitialized){
      return;
    }
    render(data);
  },

  /**
   * @function zoomTo
   * A click handler for custom zoom button.
   *
   * @param {Number} hours
   */
  zoomTo (hours) {
    this.zoom = hours;
    chartSnapZoom(hours);
  },

  /**
   * @function sizeTo
   * A click handler for changing candlestick size.
   *
   * @param {Number} seconds
   * The size of a candlestick
   */
  sizeTo (seconds) {
    this.candlestickSize = seconds;
  }
});