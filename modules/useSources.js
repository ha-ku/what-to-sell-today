import {useState, useEffect, useMemo} from "react";

function useSources(shouldStart, setError) {

	const [JSONSources, setJSONSources] = useState({
		companySealList: [],
		botanyList: [],
		miningList: [],
		fishList: [],
		huntingList: [],
		dyeList: [],
		mapList: [],
		allegoryList: [],
		yellowGathererScripsList: []
	});
	const sources = useMemo(() => ({
		companySeal: {target: 'companySeal.source', action: 'companySeal.action', withTime: false, source: JSONSources.companySealList, category: 'category.currency'},
		botany: {target: 'botany.source', action: 'botany.action', withTime: true, source: JSONSources.botanyList, category: 'category.retainer'},
		mining: {target: 'mining.source', action: 'mining.action', withTime: true, source: JSONSources.miningList, category: 'category.retainer'},
		fish: {target: 'fish.source', action: 'fish.action', withTime: true, source: JSONSources.fishList, category: 'category.retainer'},
		hunting: {target: 'hunting.source', action: 'hunting.action', withTime: true, source: JSONSources.huntingList, category: 'category.retainer'},
		dye: {target: 'dye.source', action: 'dye.action', withTime: false, source: JSONSources.dyeList, category: 'category.crafting'},
		map: {target: 'map.source', action: 'map.action', withTime: false, source: JSONSources.mapList, category: 'category.gathering'},
		allegory: {target: 'allegory.source', action: 'allegory.action', withTime: false, source: JSONSources.allegoryList, category: 'category.currency'},
		yellowGathererScrips: {target: 'yellowGathererScrips.source', action: 'yellowGathererScrips.action', withTime: false, source: JSONSources.yellowGathererScripsList, category: 'category.gathering'}
	}), [JSONSources]);
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