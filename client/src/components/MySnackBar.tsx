import MuiAlert, { AlertProps } from "@mui/material/Alert";
import React from "react";
import { Snackbar, SnackbarOrigin } from "@mui/material";

type AlertColor = "success" | "info" | "warning" | "error";

interface propsType {
    text: string;
    onOpen: boolean;
    onClose: (event?: React.SyntheticEvent | Event, reason?: string) => void;
    state?: AlertColor;
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(
    props,
    ref
) {
    return <MuiAlert elevation={10} ref={ref} variant="standard" {...props} />;
});

const MySnackbar = (props: propsType) => {
    return (
        <Snackbar
            onClose={props.onClose}
            autoHideDuration={3000} // 시간을 1500에서 3000으로 늘림
            anchorOrigin={{ vertical: "top", horizontal: "center" }} // 위치를 바꿈: 오른쪽 하단
            open={props.onOpen}
        >
            <Alert severity={props.state} sx={{ width: "100%" }}>
                {props.text}
            </Alert>
        </Snackbar>
    );
};

export default MySnackbar;
