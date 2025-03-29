import './App.css';

import NavBar from './components/NavBar/NavBar';

import DiscoverPage from './pages/Discover/DiscoverPage';
import ExamplePage from './pages/Example/ExamplePage';
import ProfilePage from './pages/Profile/ProfilePage';
import HomePage from './pages/Home/HomePage';
import LogInPage from './pages/LogIn/LogInPage';
import NotFoundPage from './pages/NotFound/NotFoundPage';
import SignUpPage from './pages/SignUp/SignUpPage';
import ChatPage from './pages/Chat/ChatPage';
import ListingsPage from './pages/Listings/ListingsPage'; 

import { BrowserRouter, Route, Routes } from 'react-router';

export default function App() {
    return (
        <>
            <BrowserRouter>
                <NavBar></NavBar>
                <Routes>
                    <Route path = "*" element = {<NotFoundPage />} />

                    <Route index element = {<HomePage />} />
                    <Route path = "discover" element = {<DiscoverPage />} />
                    <Route path = "example" element = {<ExamplePage />} />
                    <Route path = "profile" element = {<ProfilePage />} />
                    <Route path = "login" element = {<LogInPage />} />
                    <Route path = "signup" element = {<SignUpPage />} />
                    <Route path="/listings" element={<ListingsPage />} />
                    <Route path="/chat/:discussionId" element={<ChatPage />} /> // ❌ Missing props
                </Routes>
            </BrowserRouter>
        </>
    );
}