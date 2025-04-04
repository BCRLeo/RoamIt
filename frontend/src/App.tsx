import "./App.css";

import { lazy, Suspense } from 'react';

import { LinearProgress } from "@mui/material";
import { BrowserRouter, Route, Routes } from 'react-router';

import NavBar from "./components/NavBar/NavBar";
const ChatPage = lazy(() => import("./pages/Chat/ChatPage"));
const DiscoverPage = lazy(() => import("./pages/Discover/DiscoverPage"));
const ExamplePage = lazy(() => import("./pages/Example/ExamplePage"));
const HomePage = lazy(() => import("./pages/Home/HomePage"));
const ListingsPage = lazy(() => import("./pages/Listings/ListingsPage"));
const LogInPage = lazy(() => import("./pages/LogIn/LogInPage"));
const NotFoundPage = lazy(() => import("./pages/NotFound/NotFoundPage"));
const ProfilePage = lazy(() => import("./pages/Profile/ProfilePage"));
const SignUpPage = lazy(() => import("./pages/SignUp/SignUpPage"));

export default function App() {
    return (
        <>
            <BrowserRouter>
                <NavBar />
                <Suspense fallback = {<LinearProgress/>}>
                    <Routes>
                        <Route index element = { <HomePage /> } />

                        <Route path = "/discover" element = { <DiscoverPage /> } />
                        <Route path = "/example" element = { <ExamplePage /> } />
                        <Route path = "/:username" element = { <ProfilePage /> } />
                        <Route path = "/login" element = { <LogInPage /> } />
                        <Route path = "/signup" element = { <SignUpPage /> } />
                        <Route path = "/listings" element={ <ListingsPage /> } />
                        <Route path = "/chat/:discussionId" element = { <ChatPage /> } />

                        <Route path = "/*" element = { <NotFoundPage /> } />
                        <Route path = "/not-found" element = { <NotFoundPage /> } />
                    </Routes>
                </Suspense>
            </BrowserRouter>
        </>
    );
}