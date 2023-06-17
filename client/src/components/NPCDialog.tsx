import React, { useState } from "react";
import store, { RootState, useAppDispatch } from "../stores";
import { openAirport } from "../stores/gameSlice";
interface NPCDialogProps {
    initialDialog?: string;
    onClose: () => void;
}

const NPCDialog = ({ initialDialog = "Hello World!" }) => {
    const [dialog, setDialog] = useState(initialDialog);

    const handleClose = () => {
        store.dispatch(openAirport());
    };

    return (
        <div
            style={{
                position: "absolute",
                top: "10px",
                left: "10px",
                width: "200px",
                height: "100px",
                border: "1px solid black",
                padding: "10px",
                backgroundColor: "white",
            }}
        >
            <p>{dialog}</p>
            <button onClick={handleClose}>닫기</button>
        </div>
    );
};

export default NPCDialog;
