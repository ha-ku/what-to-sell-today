import { useState, useEffect } from "react";

function useSources(shouldStart, setError) {
	const [JSONSources, setJSONSources] = useState({});
	const sources = {
		companySeal: {target: "军票", action: "换", withTime: false, source: JSONSources.companySealList ?? [], category: "货币"},
		botany: {target: "伐木", action: "砍", withTime: true, source: JSONSources.botanyList ?? [], category: "雇员"},
		mining: {target: "采矿", action: "挖", withTime: true, source: JSONSources.miningList ?? [], category: "雇员"},
		fish: {target: "捕鱼", action: "钓", withTime: true, source: JSONSources.fishList ?? [], category: "雇员"},
		hunting: {target: "战职", action: "带", withTime: true, source: JSONSources.huntingList ?? [], category: "雇员"},
		dye: {target: "染剂", action: "搓", withTime: false, source: JSONSources.dyeList ?? [], category: "生产"},
		map: {target: "宝图", action: "挖", withTime: false, source: JSONSources.mapList ?? [], category: "采集"},
		allegory: {target: "奇谭", action: "换", withTime: false, source: JSONSources.allegoryList ?? [], category: "货币"},
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