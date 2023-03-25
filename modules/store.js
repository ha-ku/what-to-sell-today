import {combineReducers, configureStore} from "@reduxjs/toolkit";
import configReducer from './config/configSlice';
import reportReducer from './report/reportSlice';
import {persistStore} from "redux-persist";




const store =  configureStore({
	reducer: combineReducers({
		config: configReducer,
		report: reportReducer,
	})
})
const persistor = persistStore(store);
export default () => ({persistor, store});