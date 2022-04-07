//import { createGlobalStyle } from 'styled-components';
import {Global, css} from "@emotion/react";
import { createTheme, ThemeProvider } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery'
import { CssBaseline } from "@mui/material";

import useLocalStorageState from "use-local-storage-state";

import Script from 'next/script';
import {SvgDefsProvider} from "../modules/useSvgDefs";
import {IntlProvider} from 'react-intl';
import {useEffect} from "react";
import ZH_MESSAGE from '../public/locales/zh.json';
import EN_MESSAGE from '../public/locales/en.json';
import flatten from 'flat';


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
}
//const GlobalStyle = createGlobalStyle`
const GlobalStyle = css`
	body {
		margin: 0;
		padding: 0;
		box-sizing: border-box;
	}
`
const LOCALE = 'zh';
const zhMessage = flatten(ZH_MESSAGE);
const enMessage = flatten(EN_MESSAGE);

const App = ({ Component, pageProps }) => {
	const [userDarkMode, setUserDarkMode] = useLocalStorageState('userDarkMode', {ssr: true, defaultValue: 'auto'});
	const autoDarkMode = useMediaQuery('(prefers-color-scheme: dark)') ? 'dark' : 'light';
	const [locale, setLocale] = useLocalStorageState('locale', {ssr: true, defaultValue: LOCALE});
	const message = locale === 'zh' ? zhMessage : enMessage
	useEffect(() => {
		if(navigator.language.startsWith('en')){
			setLocale('en');
		}
	}, []);

	const theme = createTheme({
		...THEME,
		palette: {
			...THEME.palette,
			mode: userDarkMode === 'auto' ? autoDarkMode : userDarkMode
		}
	});

	return (
		<>
			{/*<GlobalStyle />*/}
			<Global styles={GlobalStyle}/>
			<ThemeProvider theme={theme}>
				<Script strategy="afterInteractive">{`window.recaptchaOptions = {useRecaptchaNet: true};`}</Script>
				<CssBaseline />
				<SvgDefsProvider>
					<IntlProvider locale={locale} messages={message} defaultLocale={LOCALE} >
						<Component {...pageProps} userDarkMode={userDarkMode} setUserDarkMode={setUserDarkMode} setLocale={setLocale}/>
					</IntlProvider>
				</SvgDefsProvider>
			</ThemeProvider>
		</>
	)
}

export default App;