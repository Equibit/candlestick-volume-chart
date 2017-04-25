import Component from 'can-component';
import view from './template.stache';
import ViewModel from './view-model';

export default Component.extend({
  tag: 'chart-info',
  ViewModel,
  view
});
