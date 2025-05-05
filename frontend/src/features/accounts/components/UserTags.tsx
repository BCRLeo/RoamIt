import { AutocompleteChangeReason } from "@mui/material";
import { MouseEventHandler, SyntheticEvent } from "react";
import Tags from "../../../components/Tags/Tags";
import { USER_TAG_OPTIONS } from "../accountsConstants";
import { useSuspenseQuery } from "@tanstack/react-query";
import { getTags } from "../accountsApi";

export default function UserTags(props: {
    userId: number
} | {
    userId: number,
    onEdit: ((event: SyntheticEvent, value: string[], reason: AutocompleteChangeReason) => void),
    onSave?: MouseEventHandler<HTMLButtonElement>
}) {
    const userId = props.userId;

    const { data: tags } = useSuspenseQuery({
        queryKey: ["getTags", userId],
        queryFn: () => getTags(userId)
    });

    return (
        <Tags
            tags = { tags ?? undefined }
            onEdit = { "onEdit" in props ? props.onEdit : undefined }
            onSave = { "onSave" in props ? props.onSave : undefined }
            options = { [...USER_TAG_OPTIONS] }
        />
    );
}