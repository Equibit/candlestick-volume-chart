import Component from 'can-component';
import DefineMap from 'can-define/map/map';
import view from './template.stache';
import './style.less';
import render, { init, chartSnapZoom } from './chart';

export const ViewModel = DefineMap.extend({
  /**
   * @property {Array} data
   */
  data: {
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
   * @property {Boolean} isInitialized
   * Indicates whether the chart was initialized.
   */
  isInitialized: 'boolean',

  zoom: 'number',

  /**
   * @function initChart
   * Initializes chart (size, mouse events, etc).
   */
  initChart () {
    init();
    this.isInitialized = true;
  },

  /**
   * @function drawChart
   * Main function to render chart data.
   *
   * @param {Array} data
   */
  drawChart (data = this.data) {
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
   * Changes candlestick size to the given value, in seconds.
   *
   * @param {Number} seconds
   * The size of a candlestick
   */
  sizeTo (seconds) {
    this.candlestickSize = seconds;
  }
});

export default Component.extend({
  tag: 'candlestick-volume-chart',
  ViewModel,
  view,
  events: {
    inserted () {
      this.viewModel.initChart();
    }
  }
});
