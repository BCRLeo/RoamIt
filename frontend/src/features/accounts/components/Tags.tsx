import { MouseEvent, MouseEventHandler, useEffect, useState } from "react";

import { Autocomplete, Box, Chip, Fab, TextField } from "@mui/material";

import { getTags } from "../accountsApi";
import { USER_TAG_OPTIONS } from "../accountsConstants";
import { Done, Edit } from "@mui/icons-material";

export default function Tags(props: { userId: number } | { userId: number, onEdit: ((value: string[]) => void), onSave?: MouseEventHandler<HTMLButtonElement> }) {
    const userId = props.userId;
    const [tags, setTags] = useState<string[]>([]);
    const [isEditing, setIsEditing] = useState(false);

    const tagDisplay = (
        <Box sx = {{ display: "flex", flexWrap: "nowrap", overflowX: "scroll" }}>
            { tags.map((tag) => (
                <Chip variant = "outlined" label = { tag } key = { tag } />
            )).reverse() }
        </Box>
    );

    const tagSelector = (
        <Autocomplete
            multiple
            freeSolo
            options = { USER_TAG_OPTIONS }
            value = { tags }
            onChange = { (_, newValue) => handleEdit(newValue) }
            renderTags = { (value, getTagProps) =>
                <Box sx = {{ display: "flex", flexWrap: "nowrap", overflowX: "scroll" }}>
                    { value.map((interest, index) => (
                        <Chip variant = "outlined" label = { interest } { ...getTagProps({ index }) } />
                    )).reverse() }
                </Box>
            }
            renderInput = { (params) => (
                <TextField
                    { ...params }
                    variant = "outlined"
                    label = "Interests"
                    placeholder = "Add interests"
                />
            )}
            slotProps = {{
                popper: {
                    modifiers: [
                        {
                            name: "flip",
                            enabled: false, // force dropdown below
                        },
                    ],
                },
                listbox: {
                    sx: { maxHeight: 250 }, // limit height of dropdown box
                }
            }}
        />
    );

    function handleEdit(value: string[]) {
        if ("onEdit" in props) {
            props.onEdit(value);
        }

        setTags(value);
    }

    function handleToggle(event: MouseEvent<HTMLButtonElement>) {
        if (isEditing && "onSave" in props && props.onSave !== undefined) {
            props.onSave(event);
        }

        setIsEditing((isEditing) => !isEditing);
    }

    useEffect(() => {
        (async () => {
            const response = await getTags(userId);

            if (response) {
                setTags(response);
            }
        })();
    }, []);

    // <Tags userId = { userId } />
    if (!("onEdit" in props) || props.onEdit === undefined) {
        return tagDisplay;
    }

    // <Tags userId = { userId } onEdit = { onEdit } /> and <Tags userId = { userId } onEdit = { onEdit } onSave = { undefined } />
    if (props.onSave === undefined) {
        return tagSelector;
    }

    // <Tags userId = { userId } onEdit = { onEdit } onSave = { onSave } />
    return (
        <Box>
            { isEditing ? tagSelector : tagDisplay }
            
            <Fab onClick = { handleToggle } color = "inherit">
                { isEditing ? <Done /> : <Edit /> }
            </Fab>
        </Box>
    );
}