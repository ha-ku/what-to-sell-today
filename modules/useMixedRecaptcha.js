import {useGoogleReCaptcha} from "react-google-recaptcha-v3";
import {useMemo, useRef, useState} from "react";
import ReCAPTCHA from "react-google-recaptcha";


function useMixedRecaptcha(defaultVersion) {
	const { executeRecaptcha: executeV3 } = useGoogleReCaptcha();
	const recaptchaRef = useRef();
	const [recaptchaVersion, setRecaptchaVersion] = useState(defaultVersion);

	const executeRecaptcha =  useMemo(() =>
		(recaptchaVersion === 3 && executeV3) || recaptchaRef.current ?
			(param) => {
				if (recaptchaVersion === 3) {
					return executeV3(param)
				}
				recaptchaRef.current.reset();
				return recaptchaRef.current.executeAsync();
			} : null, [executeV3, recaptchaVersion, recaptchaRef]) ;

	const MixedRecaptcha = function MixedRecaptcha(props) {
		return recaptchaVersion === 3 ?
			null
			: (<ReCAPTCHA ref={recaptchaRef} {...props} />)
	}

	return [MixedRecaptcha, executeRecaptcha, setRecaptchaVersion, recaptchaVersion];
}

export default useMixedRecaptcha;