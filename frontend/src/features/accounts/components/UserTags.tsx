import { AutocompleteChangeReason } from "@mui/material";
import { MouseEventHandler, SyntheticEvent } from "react";
import Tags from "../../../components/Tags/Tags";
import { USER_TAG_OPTIONS } from "../accountsConstants";

export default function UserTags(props: {
    userId: number
} | {
    userId: number,
    onEdit: ((event: SyntheticEvent, value: string[], reason: AutocompleteChangeReason) => void),
    onSave?: MouseEventHandler<HTMLButtonElement>
}) {
    return (
        <Tags { ...props } options = { [...USER_TAG_OPTIONS] } />
    );
}