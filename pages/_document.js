import Document from 'next/document'
import { extractCritical } from '@emotion/server' // change here

export default class MyDocument extends Document {
  static getInitialProps ({ renderPage }) {
    const page = renderPage()
    const styles = extractCritical(page.html) // change here
    return { ...page, ...styles }
  }
}