module.exports = {
  // dev mode only feature for highlighting potential problems in an app
  // more info: https://reactjs.org/docs/strict-mode.html
  reactStrictMode: true,

  // create a folder at .next/standalone which can then be deployed on it's own without installing node_modules
  // more info: https://nextjs.org/docs/advanced-features/output-file-tracing
  output: 'standalone',

  // webpack rules, more info on: https://webpack.js.org/guides/asset-modules
  webpack: (config, options) => {
    // Import content of YAML files (to use Swagger UI):
    config.module.rules.push({
      test: /\.yaml/,
      type: 'asset/source',
    });

    // Enable hot reloading with Docker:
    config.watchOptions = {
      poll: 1000, // check for changes every second
      aggregateTimeout: 300, // 300 ms of delay before rebuilding once the first file changed
    };

    return config;
  },
}
