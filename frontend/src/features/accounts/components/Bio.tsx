import { ChangeEvent, ChangeEventHandler, MouseEvent, MouseEventHandler, useEffect, useState } from "react";

import { Box, Fab, TextField } from "@mui/material";
import { getBio } from "../accountsApi";
import { Done, Edit } from "@mui/icons-material";

export default function Bio(props: { userId: number } | { userId: number, onEdit: ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>, onSave?: MouseEventHandler<HTMLButtonElement>}) {
    const userId = props.userId;
    const [bio, setBio] = useState("");
    const [isEditing, setIsEditing] = useState(false);

    function handleEdit(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
        if ("onEdit" in props) {
            props.onEdit(event);
        }

        setBio(event.target.value);
    }

    function handleToggle(event: MouseEvent<HTMLButtonElement>) {
        if (isEditing && "onSave" in props && props.onSave !== undefined) {
            props.onSave(event);
        }

        setIsEditing((isEditing) => !isEditing);
    }

    useEffect(() => {
        (async () => {
            const response = await getBio(userId);

            if (response) {
                setBio(response);
            }
        })();
    }, []);

    // <Bio userId = { userId } />
    if (!("onEdit" in props) || props.onEdit === undefined) {
        return (
            <TextField
                fullWidth
                label = "Bio"
                variant = "outlined"
                margin = "normal"
                value = { bio }
                disabled
            />
        );
    }

    // <Bio userId = { userId } onEdit = { onEdit } />
    if (props.onSave === undefined) {
        return (
            <Box>
                <TextField
                    fullWidth
                    label = "Bio"
                    rows = { 4 }
                    variant = "outlined"
                    margin = "normal"
                    value = { bio }
                    onChange = { handleEdit }
                />
            </Box>
        );
    }

    // <Bio userId = { userId } onEdit = { onEdit } onSave = { onSave } />
    return (
        <Box>
            <TextField
                fullWidth
                label = "Bio"
                rows = { 4 }
                variant = "outlined"
                margin = "normal"
                value = { bio }
                onChange = { handleEdit }
                disabled = { !isEditing }
            />
            
            <Fab onClick = { handleToggle } color = "inherit">
                { isEditing ? <Done /> : <Edit /> }
            </Fab>
        </Box>
    );
}