import { MouseEvent, MouseEventHandler, SyntheticEvent, useState } from "react";
import { Autocomplete, AutocompleteChangeReason, Box, Chip, Fab, TextField } from "@mui/material";
import { Done, Edit } from "@mui/icons-material";
import { useToggleState } from "../../hooks/useToggleState";

export default function Tags(props: {
    tags?: string[],
    options: string[]
} | {
    tags?: string[],
    options: string[],
    onEdit: ((event: SyntheticEvent, value: string[], reason: AutocompleteChangeReason) => void),
    onSave?: MouseEventHandler<HTMLButtonElement>
}) {
    const options = props.options;
    
    const [tags, setTags] = useState<string[]>(props.tags ?? []);
    const [isEditing, toggleIsEditing] = useToggleState(false);

    const tagDisplay = (
        <Box sx = {{ display: "flex", flexWrap: "nowrap", overflowX: "scroll" }}>
            { tags.map((tag) => (
                <Chip variant = "outlined" label = { tag } key = { tag } />
            )).reverse() }
        </Box>
    );

    const tagSelector = (
        <Autocomplete
            fullWidth
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

        toggleIsEditing();
    }

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