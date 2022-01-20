//import { createGlobalStyle } from 'styled-components';
import {Global, css} from "@emotion/react";
import { createTheme, ThemeProvider } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery'
import { CssBaseline } from "@mui/material";

import useLocalStorageState from "use-local-storage-state";

import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";
//import { ReCaptchaProvider } from "react-recaptcha-x";
import Script from 'next/script';

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
	.MuiDataGrid-root .MuiDataGrid-footerContainer {
	  	justify-content: flex-end !important;
	  	flex-direction: row-reverse;
	}
`

export default function App({ Component, pageProps }) {
	const [userDarkMode, setUserDarkMode] = useLocalStorageState('userDarkMode', 'auto');
	const autoDarkMode = useMediaQuery('(prefers-color-scheme: dark)') ? 'dark' : 'light';

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
				<GoogleReCaptchaProvider
					reCaptchaKey="6LcSMRkcAAAAALGjPf5wGvQtvTmbhcwi0feTRSYR"
					language="zh-CN"
					useRecaptchaNet={true}
				>
					<Component {...pageProps} userDarkMode={userDarkMode} setUserDarkMode={setUserDarkMode}/>
				</GoogleReCaptchaProvider>
			</ThemeProvider>
		</>
	)
}

