const runtimeCaching = require('next-pwa/cache');
const withPWA = require("next-pwa")({
	dest: 'public',
	runtimeCaching
});
//const withTM = require('next-transpile-modules')(['@mui/icons-material', '@mui/material', '@mui/system']);
//const withSvgr = require("next-plugin-svgr");
const withBundleAnalyzer = require('@next/bundle-analyzer')({
	enabled: false, //process.env.ANALYZE === 'true',
})

module.exports = withBundleAnalyzer(withPWA({
//module.exports = {
	experimental: {
		runtime: 'experimental-edge'
	},
	modularizeImports: {
		'@mui/material': {
			transform: '@mui/material/{{member}}'
		},
		'@mui/icons-material': {
			transform: '@mui/icons-material/{{member}}'
		}
	},
	webpack: (config) => {
		config.resolve.fallback = {
			buffer: require.resolve("buffer/"),
		};
		config.resolve.alias = {
			...config.resolve.alias,
			assert: false,
			util: false,
			zlib: false,
			stream: false,
			process: false,
			events: false,
		};
		config.module.rules.push({
			test: /\.svg$/,
			use: ['@svgr/webpack']
		})
		return config;
	}
//}
}));
