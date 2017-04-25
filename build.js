var stealTools = require('steal-tools');

stealTools.export({
  steal: {
    config: 'package.json!npm',
    main: '@equibit/candlestick-volume-chart/candlestick-volume-chart'
  },
  outputs: {
    '+cjs': {
      dest: __dirname + '/dist',
      sourceMaps: false,
      minify: true
    }
  }
});
