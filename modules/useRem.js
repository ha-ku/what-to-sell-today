import {useEffect, useState} from "react";


const useRem = () => {
	const [rem, setRem] = useState(16);
	useEffect(() => {
		setRem(Number(getComputedStyle(document.querySelector('html')).fontSize.slice(0, -2)))
	}, [])
	return rem;
}


export default useRem;