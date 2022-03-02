import {createContext, useContext, useMemo, useState} from "react";


const SvgDefsContext = createContext({
})

const SvgDefsProvider = (props) => {
	const [defs, setDefs] = useState(new Map());
	const addDef = useMemo(() => (id, RenderDef) => {
		if(!defs.has(id)) {
			setDefs(defs => new Map([...defs, [id, RenderDef]]))
		}
	}, [defs])
	console.log([...(defs.values())])
	return (<SvgDefsContext.Provider value={addDef}>
		<svg style={{display: 'none'}}>
			{[...(defs.values())].map((RenderDef) => (
				<defs>
					<RenderDef />
				</defs>
			))}
		</svg>
		{props.children}
	</SvgDefsContext.Provider>)
}
const useSvgDefs = (id, renderDef) => {
	const addDef = useContext(SvgDefsContext);
	addDef(id, renderDef);
}



export { SvgDefsProvider };
export default useSvgDefs;