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