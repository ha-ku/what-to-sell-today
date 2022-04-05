import {defineMessage, useIntl} from "react-intl";
import {FormattedMessage as FM} from "react-intl";
import {useMemo} from "react";



const useTranslate = (ns = []) => {
	const intl = useIntl();
	const t = useMemo(() =>
			(key, param = {}) => intl.formatMessage(defineMessage({id: `${ns}.${key}`}), param)
	, [intl, ns]);
	const FormattedMessage = ({id: key, ...props}) => <FM id={`${ns}.${key}`} {...props} />
	return {t, FormattedMessage, locale: intl.locale}
}



export default useTranslate;