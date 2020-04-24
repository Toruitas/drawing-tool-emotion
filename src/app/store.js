import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit';
import logger from 'redux-logger'
// import counterReducer from '../features/counter/counterSlice';
import toolReducer from "../features/drawer/tool/toolSlice";
import colorPickerReducer from "../features/drawer/colorPicker/colorPickerSlice";
import cameraColorSlice from "../features/drawer/cameraColor/cameraColorSlice";
import clearButtonReducer from "../features/drawer/clearButton/clearButtonSlice";

export default configureStore({
  reducer: {
    tool: toolReducer,
    color: cameraColorSlice,
    clear: clearButtonReducer
  },
  middleware:[...getDefaultMiddleware(), logger]
});
