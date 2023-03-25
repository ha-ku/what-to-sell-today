import {createAsyncThunk, createSlice} from "@reduxjs/toolkit";
import {persistReducer} from "redux-persist";
import storage from 'redux-persist/lib/storage';


const SOURCE = 'companySeal',
	RETRY = 1;
export const SOURCE_INFO = Object.fromEntries(Object.entries({
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
	}).map(([sourceName, value]) => [sourceName, {
		...value,
		name: sourceName,
		target:`${sourceName}.source`,
		action: `${sourceName}.action`
	}] ));
const initialState = {
		update: true,
		error: null,
		retry: 0,
		sourceLength: Number.MAX_SAFE_INTEGER,
		progress: {received: 0, parsed: 0},
		listSource: SOURCE_INFO[SOURCE],
	},
	initialSelectors = {
		...(Object.fromEntries(Object.keys(initialState).map(key =>
			[key, ({[key]: config}) => config]
		))),
		shouldRetry: ({retry}) => retry < RETRY,
	};
const handleError = createAsyncThunk('report/handleError',
		(arg, {signal}) => new Promise((resolve) => {
			const id = setTimeout(() => resolve(), 3000);
			signal.addEventListener('abort', () => clearTimeout(id));
		}),
		{getPendingMeta: ({arg}) => ({error: arg})}
	);
export const reportSlice = createSlice({
	name: 'report',
	initialState,
	reducers: {
		startUpdate: (state) => {
			state.progress = {...initialState.progress};
			state.update = true;
		},
		finishUpdate: (state) => {
			state.update = false;
			state.retry = 0;
		},
		setSourceLength: (state, {payload: sourceLength}) => {
			state.sourceLength = sourceLength;
		},
		incrementProgress: (state, {payload: progress}) => {
			progress.received && (state.progress.received += progress.received);
			progress.parsed && (state.progress.parsed += progress.parsed);
		},
		handleListSource: (state, {payload: name}) => {
			if(SOURCE_INFO.hasOwnProperty(name)) {
				state.listSource = SOURCE_INFO[name];
				state.sourceLength = initialState.sourceLength;
				state.retry = 0;
				state.progress = {...initialState.progress};
				state.update = true;
			}
		},
	},
	extraReducers: (builder) => {
		builder.addCase(handleError.pending, (state, {meta: {error}}) => {
			state.update = false;
			state.error = error;
		});
		builder.addCase(handleError.fulfilled, (state) => {
			state.retry += 1;
			state.progress = {...initialState.progress};
			state.update = true;
			state.error = null;
		})
	}
})

const withReport = (selectors) =>
		Object.fromEntries(Object.entries(selectors).map(([key, selector]) =>
			[key, typeof selector === 'function' ?
				state => selector(state.report)
				: withReport(selector)
			]
		));
export const reportSelectors = withReport(initialSelectors);
export const reportAction = {
	...reportSlice.actions,
	handleError,
};



export default persistReducer({
	key: 'report',
	storage,
	whitelist: ['listSource']
}, reportSlice.reducer);