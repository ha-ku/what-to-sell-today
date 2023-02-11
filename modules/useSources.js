import {useState, useEffect, useMemo} from "react";



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
function useSources(shouldStart, setError) {

	const [JSONSources, setJSONSources] = useState(Object.fromEntries(Object.entries(SOURCE_INFO).map(([category]) => [`${category}List`, []])));
	const sources = useMemo(() => Object.fromEntries(Object.entries(SOURCE_INFO).map(([category, value]) => [category, {
		...value,
		target:`${category}.source`,
		action: `${category}.action`,
		source: JSONSources[`${category}List`]
	}] )), [JSONSources]);
	useEffect(() => {
		if(shouldStart) {
			import('../public/json/itemLists.json')
				.then(setJSONSources)
				.catch(error => {
					setError({code: '000', content: error.message});
				})
		}
	}, [shouldStart]);

	return sources;
}

export default useSources;