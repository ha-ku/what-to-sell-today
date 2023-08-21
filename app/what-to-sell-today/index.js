'use client';

//import { createGlobalStyle } from 'styled-components';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import {CssBaseline, Skeleton, useMediaQuery} from "@mui/material";
import Script from 'next/script';

import {IntlProvider} from 'react-intl';
import {flatten} from 'flat';

import {SvgDefsProvider} from "../../modules/useSvgDefs";
import ZH_MESSAGE from '../../public/locales/zh.json';
import EN_MESSAGE from '../../public/locales/en.json';
import WhatToSellToday from "../../modules/WhatToSellToday";
import {Provider, useSelector} from "react-redux";
import getStore from "../../modules/store";
import {PersistGate} from "redux-persist/integration/react";
import {configSelectors} from "../../modules/config/configSlice";


const THEME = {
	palette: {
		primary: {
			main: '#42a4f5',
			contrastText: '#ffffff'
		},
		secondary: {
			main: '#6fb663',
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
const {store, persistor} = getStore();
const withPersistRedux = (Component) =>
	(props) => (
		<>
			<Provider store={store}>
				<PersistGate loading={<Skeleton variant="rectangular" width="100%" height="100%" />} persistor={persistor} >
					<Component {...props}/>
				</PersistGate>
			</Provider>
		</>
	)
export default withPersistRedux(function Index() {
	const userDarkMode = useSelector(configSelectors.userDarkMode);
	const autoDarkMode = useMediaQuery('(prefers-color-scheme: dark)') ? 'dark' : 'light';
	const locale = useSelector(configSelectors.locale);
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
				<CssBaseline  enableColorScheme />
				<SvgDefsProvider>
					<IntlProvider locale={locale} messages={message} defaultLocale={LOCALE} >
						<WhatToSellToday />
					</IntlProvider>
				</SvgDefsProvider>
			</ThemeProvider>
		</>
	)
})