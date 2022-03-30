import {defineMessages, useIntl} from "react-intl";
import {FormattedMessage as FM} from "react-intl";



const useTranslate = (ns, keys = []) => {
	const intl = useIntl();
	const msgs = defineMessages(
		keys.reduce((acc, key) => {
			acc[key] = {id: `${ns}.${key}`}
			return acc;
		}, {})
	)
	const t = (key, param) => intl.formatMessage(msgs[key], param);
	const FormattedMessage = ({id: key, ...props}) => <FM id={`${ns}.${key}`} {...props} />
	return keys.length !== 0 ?
		{t, FormattedMessage, locale: intl.locale}
		: {FormattedMessage, locale: intl.locale}
}



export default useTranslate;