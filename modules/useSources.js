import { useState, useEffect } from "react";
import useTranslate from "./useTranslate";

function useSources(shouldStart, setError) {

	const { t } = useTranslate('navbar')

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
		companySeal: {target: t('companySeal.source'), action: t('companySeal.action'), withTime: false, source: JSONSources.companySealList, category: t('category.currency')},
		botany: {target: t('botany.source'), action: t('botany.action'), withTime: true, source: JSONSources.botanyList, category: t('category.retainer')},
		mining: {target: t('mining.source'), action: t('mining.action'), withTime: true, source: JSONSources.miningList, category: t('category.retainer')},
		fish: {target: t('fish.source'), action: t('fish.action'), withTime: true, source: JSONSources.fishList, category: t('category.retainer')},
		hunting: {target: t('hunting.source'), action: t('hunting.action'), withTime: true, source: JSONSources.huntingList, category: t('category.retainer')},
		dye: {target: t('dye.source'), action: t('dye.action'), withTime: false, source: JSONSources.dyeList, category: t('category.crafting')},
		map: {target: t('map.source'), action: t('map.action'), withTime: false, source: JSONSources.mapList, category: t('category.gathering')},
		allegory: {target: t('allegory.source'), action: t('allegory.action'), withTime: false, source: JSONSources.allegoryList, category: t('category.currency')},
		yellowGathererScrips: {target: t('yellowGathererScrips.source'), action: t('yellowGathererScrips.action'), withTime: false, source: JSONSources.yellowGathererScripsList, category: t('category.gathering')}
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