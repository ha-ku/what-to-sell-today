import {defineMessage, useIntl} from "react-intl";
import {FormattedMessage as FM} from "react-intl";



const useTranslate = (ns = []) => {
	const intl = useIntl();
	const msgs = new Map();
	const t = (key, param) => {
		if(!msgs.has(key))
			msgs.set(key, defineMessage({
				id: `${ns}.${key}`
			}))
		return intl.formatMessage(msgs.get(key), param)
	};
	const FormattedMessage = ({id: key, ...props}) => <FM id={`${ns}.${key}`} {...props} />
	return {t, FormattedMessage, locale: intl.locale}
}



export default useTranslate;