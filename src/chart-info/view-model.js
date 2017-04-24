import DefineMap from 'can-define/map/map';
import moment from 'moment';

export const InfoData = DefineMap.extend({
  open: 'string',
  close: 'string',
  volumePrimary: 'string',
  volumeSecondary: 'string',
  currencyPrimary: 'string',
  currencySecondary: 'string',
  date: 'date',
  isVisible: 'boolean',
  get dateString () {
    return moment(this.date).format('MMMM D YYYY');
  },
  get time () {
    return moment(this.date).format('hh:mm A');
  }
});

export default DefineMap.extend({
  infoData: {
    type: InfoData
  }
});