const runtimeCaching = require('next-pwa/cache');
const withPWA = require("@murkrage/next-pwa")({
	disable: process.env.DEVELOPMENT === 'true',
	dest: 'public',
	runtimeCaching
});
//const withSvgr = require("next-plugin-svgr");
const withBundleAnalyzer = require('@next/bundle-analyzer')({
	enabled: process.env.ANALYZE === 'true',
})

module.exports = withBundleAnalyzer(withPWA({
//module.exports = {
	experimental: {
		appDir: true
		//runtime: process.env.DEVELOPMENT ? 'nodejs' : 'experimental-edge',
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
		config.resolve.conditionNames = ['mui-modern', '...'];
		config.module.rules.push({
			test: /\.svg$/,
			use: ['@svgr/webpack']
		})
		return config;
	}
//}
}));
