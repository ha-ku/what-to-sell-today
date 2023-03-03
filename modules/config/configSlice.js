import {createSlice, createSelector} from "@reduxjs/toolkit";
import {servers, worlds} from "../worldsAndServers";
import {persistReducer} from "redux-persist";
import storage from 'redux-persist/lib/storage';
import deepEqual from 'fast-deep-equal';
import deepMerge from '../deepMerge';



const PRICE_WINDOW = 5,
	QUALITY = 'nq',
	WORLD = worlds[0],
	CONSIDER_TIME = true,
	MAX = Number.MAX_SAFE_INTEGER,
	JOB_INFO = {
		botany: {level: MAX, gathering: MAX, perception: MAX, },
		mining: {level: MAX, gathering: MAX, perception: MAX, },
		fish: {level: MAX, gathering: MAX, perception: MAX, },
		hunting: {level: MAX, averageItemLevel: MAX, },
	},
	LOCALE = 'zh';

const LOCAL_CONFIG_KEYS = ['priceWindow', 'world', 'server', 'jobInfo'],
	initialState = {
		priceWindow: PRICE_WINDOW,
		world: WORLD,
		server: servers[worlds.indexOf(WORLD)][0],
		jobInfo: JOB_INFO,
		userDarkMode: 'auto',
		quality: QUALITY,
		considerTime: CONSIDER_TIME,
		locale: LOCALE,
		sortModel: null,
	},
	initialSelectors = Object.fromEntries(Object.keys(initialState).map(key =>
		[key, ({[key]: config}) => config]
	));

export const configSlice = createSlice({
	name: 'config',
	initialState: {
		...initialState,
		local: {},
	},
	reducers: {
		"setLocalPriceWindow": (state, {payload}) => {
			state.local.priceWindow = payload
		},
		"setLocalWorld": (state, {payload}) => {
			[state.local.world, state.local.server] = [payload, servers[worlds.indexOf(payload)][0]]
		},
		"setLocalServer": (state, {payload}) => {
			state.local.server = payload
		},
		"setLocalJobInfo": (state, {payload}) => {
			state.local.jobInfo = deepMerge(state.local.jobInfo, payload)
		},
		"setUserDarkMode": (state, {payload}) => {
			state.userDarkMode = payload
		},
		"setQuality": (state, {payload}) => {
			state.quality = payload
		},
		"setConsiderTime": (state, {payload}) => {
			state.considerTime = payload
		},
		"setLocale": (state, {payload}) => {
			state.locale = payload
		},
		"setSortModel": (state, {payload}) => {
			deepEqual(state.sortModel, payload) || (state.sortModel = payload)
		},
		"setGlobalConfig": (state) => {
			Object.entries(state.local).forEach(([key, nextValue]) => {
				state[key] = deepMerge(state[key], nextValue)
			})
			state.local = {};
		},
		"setAllConfig": (state, {payload}) => {
			Object.entries(payload).forEach(([key, value]) => {
				LOCAL_CONFIG_KEYS.includes(key) ?
					state.local[key] = value
					: Object.keys(initialState).includes(key) && (state[key] = value);
			})
		}
	}
})
const withConfig = (selectors) =>
		Object.fromEntries(Object.entries(selectors).map(([key, selector]) =>
			[key, typeof selector === 'function' ?
				state => selector(state.config)
				: withConfig(selector)
			]
		)),
	withLocal = (selectors) =>
		Object.fromEntries(Object.entries(selectors).map(([key, selector]) =>
			[key, createSelector(
				state => selector(state),
				state => selector(state.local),
				(config, localConfig) => deepMerge(config, localConfig)
			)]
		));
export const configSelectors = withConfig({
	...initialSelectors,
	local: withLocal(
		Object.fromEntries(Object.entries(initialSelectors).filter(([key]) => LOCAL_CONFIG_KEYS.includes(key)))
	)
})
export const configAction = configSlice.actions;



export default persistReducer({
	key: 'config',
	storage,
	blacklist: ['local']
}, configSlice.reducer);