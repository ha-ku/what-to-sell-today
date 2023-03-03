import {combineReducers, configureStore} from "@reduxjs/toolkit";
import configReducer from './config/configSlice';
import {persistStore} from "redux-persist";




const store =  configureStore({
	reducer: combineReducers({
		config: configReducer
	})
})
const persistor = persistStore(store);
export default () => ({persistor, store});