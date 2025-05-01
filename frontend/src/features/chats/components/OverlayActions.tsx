import { DialogActions, Button, CircularProgress } from '@mui/material';

interface OverlayActionsProps {
    onClose: () => void;
    onCreate: () => void;
    disabled: boolean;
    loading: boolean;
    label: string;
}

export default function OverlayActions({ onClose, onCreate, disabled, loading, label }: OverlayActionsProps) {
    return (
        <DialogActions>
            <Button onClick={onClose} disabled={loading}>Cancel</Button>
            <Button onClick={onCreate} variant="contained" disabled={disabled}>
                {loading ? <CircularProgress size={24} /> : label}
            </Button>
        </DialogActions>
    );
}
