import { TextField } from '@mui/material';

interface GroupNameInputProps {
	value: string;
	onChange: (val: string) => void;
}

export default function GroupNameInput({ value, onChange }: GroupNameInputProps) {
	return (
		<TextField
			fullWidth
			label="Group Name"
			value={value}
			onChange={e => onChange(e.target.value)}
			margin="normal"
		/>
	);
}
