import React, { useState } from "react";
import store, { RootState, useAppDispatch } from "../stores";
import { openAirport } from "../stores/gameSlice";
import TalkBox from "./TalkBox";
interface NPCDialogProps {
    initialDialog?: string;
    onClose: () => void;
}

const NPCDialog = () => {

    const handleClose = () => {
        store.dispatch(openAirport());
    };

    return (
        <div>
            <TalkBox/>
        </div>
    );
};

export default NPCDialog;
