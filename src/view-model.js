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
      setTimeout(() => {
        this.drawChart();
      }, 0);
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
    value: colors
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

  chartHoverInfo: {
    value: new InfoData({
      currencyPrimary: 'EQB',
      currencySecondary: 'BTC'
    })
  },

  /**
   * @function initChart
   * Initializes chart (size, mouse events, etc).
   */
  initChart () {
    init({
      colors: this.colors,
      height: this.chartHeight,
      chartHoverInfo: this.chartHoverInfo
    });
    this.isInitialized = true;
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