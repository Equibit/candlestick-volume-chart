Candlestick and Volume Chart
=======

A canvas based candlestick chart implemented as CanJS component. Built with StealJS.

![Demo](./demo.png)

To try out the demo open the following file in browser: `/demo/demo.html`.

## API

- `chart-data`, an array of data  (see demo data `/demo/data-1.json`);
- `chart-height`, a height of the chart;
- `candlestick-size`, is updated by the Candlestick Size control. Bind to this property to load data for different candlestick sizes.

## Usage

Your page template can look like this:
```html
<can-import from="candlestick-volume-chart" />

<candlestick-volume-chart {chart-data}="chartData"
                          {(candlestick-size)}="candlestickSize"
                          {chart-height}="chartHeight" />
```
* Note: this package is built with StealJS and uses `stache` template engine which is default for CanJS stack. *

Given data:
```json
[{
  "date": 1489780800,
  "high": 0.04239985,
  "low": 0.04,
  "open": 0.041,
  "close": 0.04168,
  "volume": 11433.08759323,
  "quoteVolume": 276626.89447141
}, {}]
```

Your view model can look like:
```js
import DefineMap from 'can-define/map/map';
import stache from 'can-stache';

// Define your page viewmodel:
const VM = DefineMap.extend({
  chartData: {
    type: '*'
  },
  chartHeight: {
    value: 250
  },
  candlestickSize: {
    set (val) {
      setTimeout(() => {
        this.loadData(val);
      }, 0);
      return val;
    }
  },
  loadData (candlestickSize) {
    // Load your data here and assign it to `chartData`:
    console.log(`loadData(${candlestickSize})`);
    $.get(candlestickSize < 1000 ? 'data-1.json' : 'data-2.json').then(chartData => {
      console.log(`loadedData(${chartData.length})`);
      this.chartData = chartData;
    });
  }
});

// Instantiate your view model:
const vm = new VM({ candlestickSize: 7200 });

// Render your template with VM:
const template = stache.from('demo-html');
const frag = template(vm);
document.body.appendChild(frag);
```