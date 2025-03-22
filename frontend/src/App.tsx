import './App.css';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import NavBar from './components/NavBar/NavBar';

import ExamplePage from './pages/Example/ExamplePage';
import HomePage from './pages/Home/HomePage';

import { BrowserRouter, Route, Routes } from 'react-router';

export default function App() {
    return (
        <>
            <BrowserRouter>
                <NavBar></NavBar>
                <Routes>
                    <Route index element = {<HomePage />} />
                    <Route path = "example" element = {<ExamplePage />} />
                </Routes>
            </BrowserRouter>
        </>
    );

    return (
        <Box sx = {{ width: "100%", maxWidth: 500 }}>
            <Typography variant = "h1">Roam It</Typography>
            <ExamplePage />
        </Box>
    );
}