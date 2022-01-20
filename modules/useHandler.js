import {useState} from "react";
import useLocalStorageState from "use-local-storage-state";

function useHandler(defaultValue, handler, localStoreKey = "") {
	const [unStoredState, setUnstoredState] = useState(defaultValue);
	const [storedState, setStoredState] = useLocalStorageState(localStoreKey, defaultValue);
	const [state, setState] = localStoreKey.length ? [storedState, setStoredState] : [unStoredState, setUnstoredState];
	const wrapper = event => {
		const res = handler(event)
		if(typeof res !== "undefined"){
			setState(res);
		}
	}
	return [state, wrapper];
}

export default useHandler;