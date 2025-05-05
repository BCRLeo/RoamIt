import { MouseEvent, MouseEventHandler, SyntheticEvent, useEffect, useState } from "react";

import { Autocomplete, AutocompleteChangeReason, Box, Chip, Fab, TextField } from "@mui/material";

import { getTags } from "../../features/accounts/accountsApi";
import { Done, Edit } from "@mui/icons-material";

export default function Tags(props: {
    userId: number,
    options: string[]
} | {
    userId: number,
    options: string[],
    onEdit: ((event: SyntheticEvent, value: string[], reason: AutocompleteChangeReason) => void),
    onSave?: MouseEventHandler<HTMLButtonElement>
}) {
    const userId = props.userId;
    const options = props.options;
    
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
            options = { options }
            value = { tags }
            onChange = { handleEdit }
            renderTags = { (value, getTagProps) =>
                <Box sx = {{ display: "flex", flexWrap: "nowrap", overflowX: "scroll" }}>
                    { value.map((tag, index) => (
                        <Chip variant = "outlined" label = { tag } { ...getTagProps({ index }) } />
                    )).reverse() }
                </Box>
            }
            renderInput = { (params) => (
                <TextField
                    { ...params }
                    variant = "outlined"
                    label = "Tags"
                    placeholder = "Add tags"
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

    function handleEdit(event: SyntheticEvent, value: string[], reason: AutocompleteChangeReason) {
        if ("onEdit" in props) {
            props.onEdit(event, value, reason);
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