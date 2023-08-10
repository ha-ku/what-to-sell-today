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
		return () => delete window.grecaptcha
	}, [execute])
	return null;
}

function MixedRecaptcha({version, onLoad, v2Props, v3Props}) {

	console.log(`rerender MixedRecaptcha v${version}`, onLoad, v2Props, v3Props)
	const [{execute: executeV3}, setExecuteV3] = useState({execute: null});
	const recaptchaRef = useRef();
	const container = v3Props?.container?.element;
	const [v2Loaded, setV2Loaded] = useState(false);


	useEffect(() => {
		if((version === 3 && executeV3) || (version !== 3 && recaptchaRef.current)) {
			const controller = version === 3 ? executeV3
				: v2Loaded ?
					() => {
						recaptchaRef.current.reset();
						return recaptchaRef.current.executeAsync();
					} : null;
			onLoad({execute: controller});
		}
	}, [executeV3, recaptchaRef, version, v2Loaded])

	return version === 3 ? <ReCaptchaProvider {...v3Props}>
			<ReCAPTCHAv3 setExecuteV3={setExecuteV3}/>
			<Box {...(typeof container === 'string' ? {id: container} : {})} ></Box>
		</ReCaptchaProvider>
		: <ReCAPTCHAv2 {...v2Props} ref={recaptchaRef}
					   asyncScriptOnLoad={(param) => {
						   setV2Loaded(true);
						   if(v2Props.asyncScriptOnLoad) v2Props.asyncScriptOnLoad(param)
					   }} />
}


export default memo(MixedRecaptcha)