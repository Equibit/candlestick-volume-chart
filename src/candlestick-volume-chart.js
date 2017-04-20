import Component from 'can-component';
import DefineMap from 'can-define/map/map';
import view from './template.stache';
import './style.less';
import refreshCandleSticksFirst, { initCharts_br_js } from './chart';

export const ViewModel = DefineMap.extend({
  /**
   * @property {Array} data
   */
  data: {
    type: '*',
    set (val) {
      // this.drawChart(val);
      setTimeout(function(){

        initCharts_br_js(val);
        // $(window).resize(function(){resizeCharts();});
      }, 0);
      return val;
    }
  },

  /**
   * @property {Number} candlestickSize
   * The size of a candlestick, in seconds
   */
  candlestickSize: 'number',

  /**
   * @property {Number} range
   * Date range of the data, in seconds
   */
  range: 'number',

  drawChart (data = this.data) {
    refreshCandleSticksFirst(data);
  },

});

export default Component.extend({
  tag: 'candlestick-volume-chart',
  ViewModel,
  view,
  events: {
    inserted () {

    }
  }
});