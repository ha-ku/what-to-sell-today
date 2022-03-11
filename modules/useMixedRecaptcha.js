import {useGoogleReCaptcha} from "react-google-recaptcha-v3";
import {useMemo, useRef, useState} from "react";


function useMixedRecaptcha(defaultVersion) {
	const { executeRecaptcha: executeV3 } = useGoogleReCaptcha();
	const recaptchaRef = useRef();
	const [recaptchaVersion, setRecaptchaVersion] = useState(defaultVersion);

	const executeRecaptcha =  useMemo(() =>
		recaptchaVersion === 3 ? executeV3 : (() => {
			console.log(recaptchaRef.current);
			recaptchaRef.current.reset();
			return recaptchaRef.current.executeAsync();
		}), [executeV3, recaptchaVersion, recaptchaRef]) ;

	return [recaptchaRef, executeRecaptcha, setRecaptchaVersion, recaptchaVersion];
}

export default useMixedRecaptcha;