import {useCallback, useState} from "react";
import useLocalStorageState from "use-local-storage-state";

function useHandler(defaultValue, handler, localStoreKey = "") {
	const [unStoredState, setUnstoredState] = useState(defaultValue);
	const [storedState, setStoredState] = useLocalStorageState(localStoreKey, {ssr: true, defaultValue});
	const [state, setState] = localStoreKey.length ? [storedState, setStoredState] : [unStoredState, setUnstoredState];
	const wrapper = useCallback((...params) => {
		const res = handler(...params)
		if(typeof res !== "undefined"){
			if(Promise.prototype.isPrototypeOf(res)) {
				res.then(setState)
			}
			else {
				setState(res);
			}
		}
	}, [])
	return [state, wrapper];
}

export default useHandler;