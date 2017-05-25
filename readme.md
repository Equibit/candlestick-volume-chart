Candlestick and Volume Chart
=======

A canvas based candlestick chart implemented as CanJS component. Built with StealJS.

![Demo](https://source.tonicdev.net/raw-npm/candlestick-volume-chart/demo.png?t=14956952712671)

To try out the demo open the following file in browser: `/demo/demo.html`.

## API

Main parameters:
- `chart-data`, an array of data  (see demo data `/demo/data-1.json`);
- `chart-height`, a number, a height of the chart in px;
- `candlestick-size`, is updated by the Candlestick Size control. Bind to this property to load data for different candlestick sizes.

Customization parameters:
- `colors`, an object:
  - `borderColor`, default '#d3d3d3';
  - `textColor`, default '#333333';
  - `lineColor`, default '#F2F2F2';
  - `volumeColor`, default '#cccccc';
  - `greenColor`, default '#32B576';
  - `redColor`, default '#EC2F39';
  - `preview`, default '#777777'.
- `dateFormat`, format of the date for X-axis, `moment` package is used, default `MMMM D`.
- `timeFormat`, format of the time for X-axis, `moment` package is used, default `hh:mm A`.
- `zoomStart`, a float from 0 to 1, initial value for the left border of the preview zoom window, default `0.9`.
- `zoomEnd`, a float from 0 to 1, initial value for the right border of the preview zoom window, default `1.0`.

The controls (Zoom and Candlestick Size) and the mouse-hover meta-data can be customized with CSS.

## Usage

Your page template can look like this:
```html
<can-import from="candlestick-volume-chart" />

<candlestick-volume-chart {chart-data}="chartData"
                          {(candlestick-size)}="candlestickSize"
                          {chart-height}="chartHeight"
                          font-family="sans-serif" />
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
  colors: {
    type: '*',
    value: {
      greenColor: '#00ff00',
      redColor: '#ff5500'
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