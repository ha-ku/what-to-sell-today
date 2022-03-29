import { useState, useEffect } from "react";
import strings from "./localization";

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
	const sources = {
		companySeal: {target: strings.companySeal, action: strings.companySealAction, withTime: false, source: JSONSources.companySealList, category: strings.categoryCurrency},
		botany: {target: strings.botany, action: strings.botanyAction, withTime: true, source: JSONSources.botanyList, category: strings.categoryRetainer},
		mining: {target: strings.mining, action: strings.miningAction, withTime: true, source: JSONSources.miningList, category: strings.categoryRetainer},
		fish: {target: strings.fish, action: strings.fishAction, withTime: true, source: JSONSources.fishList, category: strings.categoryRetainer},
		hunting: {target: strings.hunting, action: strings.huntingAction, withTime: true, source: JSONSources.huntingList, category: strings.categoryRetainer},
		dye: {target: strings.dye, action: strings.dyeAction, withTime: false, source: JSONSources.dyeList, category: strings.categoryCrafting},
		map: {target: strings.map, action: strings.mapAaction, withTime: false, source: JSONSources.mapList, category: strings.categoryGathering},
		allegory: {target: strings.allegory, action: strings.allegoryAction, withTime: false, source: JSONSources.allegoryList, category: strings.categoryCurrency},
		yellowGathererScrips: {target: strings.yellowGathererScrips, action: strings.yellowGathererScripsAction, withTime: false, source: JSONSources.yellowGathererScripsList, category: strings.categoryGathering}
	};
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