import { configureStore } from "@reduxjs/toolkit";
import GameModeSlice from "./gameSlice";
import userSlice from "./userSlice";
import talkBoxSlice from "./talkBoxSlice";
import recordSlice from "./recordSlice";
import sentenceBoxSlice from "./sentenceBoxSlice";
import correctionSlice from "./reportSlice";
import scoreSlice  from "./scoreSlice";
import rtcSlice from "./RtcSlice";
import { useDispatch } from "react-redux";

export const store = configureStore({
    reducer: {
        mode: GameModeSlice,
        user: userSlice,
        talkBox: talkBoxSlice,
        record: recordSlice,
        sentenceBox: sentenceBoxSlice,
        correction: correctionSlice,
        score: scoreSlice,
        rtc: rtcSlice,
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
