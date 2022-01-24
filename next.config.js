const withPlugins = require("next-compose-plugins");
//const withTM = require('next-transpile-modules')(['@mui/icons-material', '@mui/material', '@mui/system']);
//const withSvgr = require("next-plugin-svgr");
/* const withBundleAnalyzer = require('@next/bundle-analyzer')({
	enabled: false, //process.env.ANALYZE === 'true',
})*/
const withPWA = require("next-pwa");

module.exports = withPlugins([withPWA], {
//module.exports = {
  webpack5: true,
  webpack: (config) => {
    config.resolve.fallback = {
			"stream": require.resolve("stream-browserify"),
			"buffer": require.resolve("buffer/"),
			"util": require.resolve("util/"),
			"events": require.resolve("events"),
			"process": require.resolve("process/browser"),
			"zlib": require.resolve("browserify-zlib"),
			"assert": require.resolve("assert/")
		};
		/*config.resolve.alias = {
			...config.resolve.alias,
			'@mui/styled-engine': '@mui/styled-engine-sc',
			'@material-ui/styled-engine': '@mui/styled-engine-sc'
		};*/
		config.module.rules.push({
			test: /\.svg$/,
			use: ['@svgr/webpack'],
		})
    return config;
  },
//}
});
