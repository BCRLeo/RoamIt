import './App.css';
import ExamplePage from './pages/Example/ExamplePage';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

export default function App() {
    return (
        <Box sx = {{ width: "100%", maxWidth: 500 }}>
            <Typography variant = "h1">Roam It</Typography>
            <ExamplePage />
        </Box>
    )
}