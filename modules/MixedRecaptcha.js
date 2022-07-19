import {useGoogleReCaptcha} from "react-google-recaptcha-v3";
import {useEffect, useRef, useState, memo} from "react";
import { GoogleReCaptchaProvider as ReCaptchaProvider} from 'react-google-recaptcha-v3';
import ReCAPTCHAv2 from "react-google-recaptcha";
import {Box} from "@mui/material";

function ReCAPTCHAv3({setExecuteV3}) {
	const {executeRecaptcha: execute} = useGoogleReCaptcha();
	useEffect(() => {
		if(execute) {
			setExecuteV3({execute});
		}
	}, [execute])
	return null;
}

function MixedRecaptcha({version, onLoad, v2Props, v3Props}) {

	console.log(`render v${version}`, onLoad, v2Props, v3Props)
	const [{execute: executeV3}, setExecuteV3] = useState({execute: null});
	const recaptchaRef = useRef();
	const container = v3Props?.container?.element;

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

	return version === 3 ? <ReCaptchaProvider {...v3Props}>
			<ReCAPTCHAv3 setExecuteV3={setExecuteV3}/>
			<Box {...(typeof container === 'string' ? {id: container} : {})} sx={{visibility: 'hidden', position: 'absolute', zIndex: -1 * Number.MAX_SAFE_INTEGER, top: 0, left: 0}}></Box>
		</ReCaptchaProvider>
		: <ReCAPTCHAv2 {...v2Props} ref={recaptchaRef} isolated />
}


export default memo(MixedRecaptcha)