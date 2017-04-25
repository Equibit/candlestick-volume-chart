import Component from 'can-component';
import view from './template.stache';
import ViewModel from './view-model';
import './style.less';

export default Component.extend({
  tag: 'chart-info',
  ViewModel,
  view
});
