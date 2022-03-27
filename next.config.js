const withPlugins = require("next-compose-plugins");
//const withTM = require('next-transpile-modules')(['@mui/icons-material', '@mui/material', '@mui/system']);
//const withSvgr = require("next-plugin-svgr");
/* const withBundleAnalyzer = require('@next/bundle-analyzer')({
	enabled: false, //process.env.ANALYZE === 'true',
})*/
const withPWA = require("next-pwa");
const runtimeCaching = require('next-pwa/cache')

module.exports = withPlugins([withPWA], {
//module.exports = {
	pwa: {
		dest: 'public',
		runtimeCaching,
	},
	webpack5: true,
	experimental: {
		modularizeImports: {
			'@mui/material': {
				transform: '@mui/material/{{member}}'
			},
			'@mui/icons-material': {
				transform: '@mui/icons-material/{{member}}'
			}
		}
	},
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
