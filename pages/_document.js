import Document, { Html, Head, Main, NextScript } from 'next/document'
import { extractCritical } from '@emotion/server' // change here
import { Fragment } from "react";

export default class MyDocument extends Document {
  static getInitialProps ({ renderPage }) {
    const page = renderPage()
    const styles = extractCritical(page.html) // change here
    return { ...page, ...styles }
  }
  render() {
    return (
        <Html>
          <Head>
            <meta name='application-name' content='What To Sell Today' />
            <meta name='apple-mobile-web-app-capable' content='yes' />
            <meta name='apple-mobile-web-app-status-bar-style' content='default' />
            <meta name='apple-mobile-web-app-title' content='What To Sell Today' />
            <meta name='description' content='Frontend and backend to compare FFXIV item price in various list.' />
            <meta name='format-detection' content='telephone=no' />
            <meta name='mobile-web-app-capable' content='yes' />
            {/* <meta name='msapplication-config' content='/icons/browserconfig.xml' /> */}
            <meta name='msapplication-TileColor' content='#64b5f6' />
            <meta name='msapplication-tap-highlight' content='no' />
            <meta name='theme-color' content='#64b5f6' />

            {/*
            <link rel='apple-touch-icon' href='/icons/touch-icon-iphone.png' />
            <link rel='apple-touch-icon' sizes='152x152' href='/icons/touch-icon-ipad.png' />
            <link rel='apple-touch-icon' sizes='180x180' href='/icons/touch-icon-iphone-retina.png' />
            <link rel='apple-touch-icon' sizes='167x167' href='/icons/touch-icon-ipad-retina.png' />
            */}

            {/*
            <link rel='icon' type='image/png' sizes='32x32' href='/icons/favicon-32x32.png' />
            <link rel='icon' type='image/png' sizes='16x16' href='/icons/favicon-16x16.png' />
            <link rel='mask-icon' href='/icons/safari-pinned-tab.svg' color='#5bbad5' />
            */}
            <link rel='manifest' href='/manifest.json' />
            <link rel='shortcut icon' href='/favicon.ico' />
            <link rel='stylesheet' href='https://fonts.googleapis.com/css?family=Roboto:300,400,500' />

            <meta name='twitter:card' content='summary' />
            <meta name='twitter:url' content='https://what-to-sell-today.vercel.app' />
            <meta name='twitter:title' content='What To Sell Today' />
            <meta name='twitter:description' content='Frontend and backend to compare FFXIV item price in various list.' />
            <meta name='twitter:image' content='https://what-to-sell-today.vercel.app/icons/icon-192x192.png' />
            <meta name='twitter:creator' content='@haku' />
            <meta property='og:type' content='website' />
            <meta property='og:title' content='What To Sell Today' />
            <meta property='og:description' content='Frontend and backend to compare FFXIV item price in various list.' />
            <meta property='og:site_name' content='What To Sell Today' />
            <meta property='og:url' content='https://what-to-sell-today.vercel.com' />
            {/*<meta property='og:image' content='https://yourdomain.com/icons/apple-touch-icon.png' />*/}

            {/* apple splash screen images */}
            {/*
			<link rel='apple-touch-startup-image' href='/images/apple_splash_2048.png' sizes='2048x2732' />
			<link rel='apple-touch-startup-image' href='/images/apple_splash_1668.png' sizes='1668x2224' />
			<link rel='apple-touch-startup-image' href='/images/apple_splash_1536.png' sizes='1536x2048' />
			<link rel='apple-touch-startup-image' href='/images/apple_splash_1125.png' sizes='1125x2436' />
			<link rel='apple-touch-startup-image' href='/images/apple_splash_1242.png' sizes='1242x2208' />
			<link rel='apple-touch-startup-image' href='/images/apple_splash_750.png' sizes='750x1334' />
			<link rel='apple-touch-startup-image' href='/images/apple_splash_640.png' sizes='640x1136' />
			*/}
            {
              ["www.gstatic.cn", "www.recaptcha.net", "aws-cf.ha-ku.cyou"].map(domain => (<Fragment key={domain}>
                <link rel="preconnect" href={`https://${domain}`}/>
                <link rel="dns-prefetch" href={`https://${domain}`}/>
              </Fragment>))
            }
          </Head>
          <body>
          <Main />
          <NextScript />
          </body>
        </Html>
    )
  }
}