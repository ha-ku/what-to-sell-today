import Index from './index';



export default function Page() {
	return <Index />;
}

export const metadata = {
	title: 'What to Sell Today',
	description: 'Frontend and backend to compare FFXIV item price in various list.',
	applicationName: 'What To Sell Today',
	themeColor: '#64b5f6',
	creator: '@haku',
	formatDetection: {
		telephone:'no'
	},
	icons: {
		icon: [
			{url: '/icons/favicon-32x32.png', sizes: '32x32', type: 'image/png'},
			{url: '/icons/favicon-16x16.png', sizes: '16x16', type: 'image/png'},
		],
		shortcut: ['/favicon.ico'],
		apple: [
			{url: '/icons/icon-60x60.png'},
			{url: '/icons/icon-152x152.png', sizes: '152x152', type: 'image/png'},
			{url: '/icons/icon-167x167.png', sizes: '167x167', type: 'image/png'},
			{url: '/icons/icon-180x180.png', sizes: '180x180', type: 'image/png'},
		],
	},
	manifest: '/manifest.json',
	twitter: {
		card: 'summary',
		title: 'What to Sell Today',
		description: 'Frontend and backend to compare FFXIV item price in various list.',
		creator: '@haku',
		images: ['https://what-to-sell-today.vercel.app/icons/icon-192x192.png'],
	},
	appleWebApp: {
		title: 'What to Sell Today',
		statusBarStyle: 'default',
	}
}