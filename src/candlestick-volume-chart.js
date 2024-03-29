import Component from 'can-component';
import view from './template.stache';
import './style.less';
import ViewModel from './view-model';

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
