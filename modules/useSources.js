import {useState, useEffect, useMemo, startTransition} from "react";



const SOURCE_INFO = {
	companySeal: {withTime: false, category: 'category.currency'},
	wolfMark: {withTime: false, category: 'category.currency'},
	botany: {withTime: true, category: 'category.retainer'},
	mining: {withTime: true, category: 'category.retainer'},
	fish: {withTime: true, category: 'category.retainer'},
	hunting: {withTime: true, category: 'category.retainer'},
	dye: {withTime: false, category: 'category.crafting'},
	map: {withTime: false, category: 'category.gathering'},
	whiteGathererScrips: {withTime: false, category: 'category.gathering'},
	whiteCrafterScrips: {withTime: false, category: 'category.crafting'},
	khloeBronze: {withTime: false, category: 'category.wondrousTail'},
	khloeSilver: {withTime: false, category: 'category.wondrousTail'},
	khloeGold: {withTime: false, category: 'category.wondrousTail'},
	poetics: {withTime: false, category: 'category.currency'},
}
function useSources(listSource, setError) {

	const [JSONSources, setJSONSources] = useState(Object.fromEntries(Object.entries(SOURCE_INFO).map(([category]) => [`${category}List`, []])));
	const sources = useMemo(() => Object.fromEntries(Object.entries(SOURCE_INFO).map(([category, value]) => [category, {
		...value,
		target:`${category}.source`,
		action: `${category}.action`,
		source: JSONSources[`${category}List`]
	}] )), [JSONSources]);
	useEffect(() => {
		import(`../public/json/itemLists/${listSource}.json`)
			.then(({default:json}) => startTransition(() => setJSONSources(J => ({...J, [`${listSource}List`]: json}))))
			.catch(error => {
				setError({code: '000', content: error.message});
			})
	}, [listSource]);

	return sources;
}

export default useSources;