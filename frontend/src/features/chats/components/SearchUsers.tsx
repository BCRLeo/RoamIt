import { TextField, Box } from '@mui/material';

interface SearchUsersProps {
	value: string;
	onChange: (val: string) => void;
	disabled?: boolean;
}

export default function SearchUsers({ value, onChange, disabled }: SearchUsersProps) {
	return (
		<Box mb={2}>
			<TextField
				fullWidth
				label="Search users"
				value={value}
				onChange={e => onChange(e.target.value)}
				disabled={disabled}
			/>
		</Box>
	);
}