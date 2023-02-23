'use client';

//import { createGlobalStyle } from 'styled-components';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import {CssBaseline, useMediaQuery} from "@mui/material";
import Script from 'next/script';

import useLocalStorageState from "use-local-storage-state";
import {IntlProvider} from 'react-intl';
import flatten from 'flat';

import {SvgDefsProvider} from "../../modules/useSvgDefs";
import ZH_MESSAGE from '../../public/locales/zh.json';
import EN_MESSAGE from '../../public/locales/en.json';
import useHandler from "../../modules/useHandler";
import WhatToSellToday from "../../modules/WhatToSellToday";


const THEME = {
	palette: {
		primary: {
			main: '#64b5f6',
			contrastText: '#ffffff'
		},
		secondary: {
			main: '#FF986A',
		},
		tonalOffset: 0.3
	},
	components: {
		MuiCssBaseline: {
			styleOverrides: `
				body {
					margin: 0;
					padding: 0;
					box-sizing: border-box;
				}`
		}
	}
}

const LOCALE = 'zh';
const zhMessage = flatten(ZH_MESSAGE);
const enMessage = flatten(EN_MESSAGE);

export default function Index() {
	const [userDarkMode, handleUserDarkMode] = useHandler('auto', ({target: {value}}) => value, 'userDarkMode')//useLocalStorageState('userDarkMode', {ssr: true, defaultValue: 'auto'});
	const autoDarkMode = useMediaQuery('(prefers-color-scheme: dark)') ? 'dark' : 'light';
	const [locale, setLocale] = useLocalStorageState('locale', {ssr: true, defaultValue: LOCALE});
	const message = locale === 'zh' ? zhMessage : enMessage

	const theme = createTheme({
		...THEME,
		palette: {
			...THEME.palette,
			mode: userDarkMode === 'auto' ? autoDarkMode : userDarkMode
		}
	});

	return (
		<>
			<ThemeProvider theme={theme}>
				<Script strategy="afterInteractive">{`window.recaptchaOptions = {useRecaptchaNet: true};`}</Script>
				<CssBaseline />
				<SvgDefsProvider>
					<IntlProvider locale={locale} messages={message} defaultLocale={LOCALE} >
						<WhatToSellToday userDarkMode={userDarkMode} handleUserDarkMode={handleUserDarkMode} setLocale={setLocale}/>
					</IntlProvider>
				</SvgDefsProvider>
			</ThemeProvider>
		</>
	)
}


export const metadat = {
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