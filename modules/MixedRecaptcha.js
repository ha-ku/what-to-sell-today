import {useGoogleReCaptcha} from "react-google-recaptcha-v3";
import {useEffect, useRef} from "react";
import { GoogleReCaptchaProvider as ReCaptchaProvider} from 'react-google-recaptcha-v3';
import ReCAPTCHA from "react-google-recaptcha";


function MixedRecaptcha({version, onLoad, v2Props}) {
	const { executeRecaptcha: executeV3 } = useGoogleReCaptcha();
	const recaptchaRef = useRef();

	useEffect(() => {
		if((version === 3 && executeV3) || (version !== 3 && recaptchaRef.current)) {
			const controller = version === 3 ? executeV3
				: () => {
					recaptchaRef.current.reset();
					return recaptchaRef.current.executeAsync();
				};
			onLoad({execute: controller});
		}
	}, [executeV3, recaptchaRef, version])

	return version === 3 ? null
		: <ReCAPTCHA {...v2Props} ref={recaptchaRef} />
}


export {ReCaptchaProvider}
export default MixedRecaptcha