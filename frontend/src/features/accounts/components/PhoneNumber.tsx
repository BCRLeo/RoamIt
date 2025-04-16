import { Box, Fab, TextField } from "@mui/material";
import { ChangeEvent, ChangeEventHandler, MouseEvent, MouseEventHandler, useEffect, useState } from "react";
import { useToggleState } from "../../../hooks/useToggleState";
import { getPhoneNumber } from "../accountsApi";
import usePublicUserData from "../hooks/usePublicUserData";
import { Done, Edit } from "@mui/icons-material";

export default function PhoneNumber(props: { userId: number } | { userId: number, onEdit: ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>, onSave?: MouseEventHandler<HTMLButtonElement> }) {
    const userId = props.userId;
    const isAuthenticated = usePublicUserData(userId).isAuthenticated;
    const [phoneNumber, setPhoneNumber] = useState("");
    const [isEditing, toggleIsEditing] = useToggleState(false);

    function handleEdit(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
        if ("onEdit" in props) {
            props.onEdit(event);
        }

        setPhoneNumber(event.target.value);
    }

    function handleToggle(event: MouseEvent<HTMLButtonElement>) {
        if (isEditing && "onSave" in props && props.onSave !== undefined) {
            props.onSave(event);
        }

        toggleIsEditing();
    }

    useEffect(() => {
        (async () => {
            const response = await getPhoneNumber(userId);

            if (response) {
                setPhoneNumber(response);
            }
        })();
    }, []);

    // <PhoneNumber userId = { userId } />
    if (!("onEdit" in props) || props.onEdit === undefined) {
        return (
            isAuthenticated ?
                <TextField
                    fullWidth
                    label = "Phone Number"
                    variant = "outlined"
                    margin = "normal"
                    value = { phoneNumber }
                    disabled
                />
            :
                <></>
        );
    }

    // <PhoneNumber userId = { userId } onEdit = { onEdit } />
    if (props.onSave === undefined) {
        return (
            <Box>
                <TextField
                    fullWidth
                    label = "Phone Number"
                    variant = "outlined"
                    margin = "normal"
                    value = { phoneNumber }
                    onChange = { handleEdit }
                />
            </Box>
        );
    }

    // <PhoneNumber userId = { userId } onEdit = { onEdit } onSave = { onSave } />
    return (
        <Box>
            <TextField
                fullWidth
                label = "Phone Number"
                variant = "outlined"
                margin = "normal"
                value = { phoneNumber }
                onChange = { handleEdit }
                placeholder = { isEditing ? "Enter your phone number" : undefined }
                disabled = { !isEditing }
            />
            
            <Fab onClick = { handleToggle } color = "inherit">
                { isEditing ? <Done /> : <Edit /> }
            </Fab>
        </Box>
    );
}