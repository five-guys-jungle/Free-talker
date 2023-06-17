import { configureStore } from '@reduxjs/toolkit';
import modeSlice from './statusSlice';
import userSlice from './userSlice';
import { useDispatch } from 'react-redux';

export const store = configureStore({
  reducer: {
    mode: modeSlice,
    user: userSlice,
   
  },
});

// store.dispatch(fetchMuteInfo());
// store.dispatch(getbojInfos());

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = () => useDispatch<typeof store.dispatch>();

export default store;
