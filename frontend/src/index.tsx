// frontend/src/index.tsx
import React, { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import { Provider, useDispatch } from 'react-redux';
import Home from './features/home/Home';
import Register from './features/auth/components/Register';
import Login from './features/auth/components/Login';
import UserProfile from './features/userProfile/components/UserProfile';
import UserProfileView from './features/userProfile/components/UserProfileView';
import store from './app/store';
import Header from './features/header/components/Header';
import HamburgerMenu from './features/menu/components/HamburgerMenu';
import PrivateRoute from './features/shared/components/PrivateRoute';
import PostForm from './features/posts/components/PostForm';
import PostFeed from './features/posts/components/PostFeed';
import PostPage from './features/posts/components/PostPage';
import AdsFeed from './features/ads/components/AdsFeed';
import SocialComponent from './features/info/components/inform';
import AdsForm from './features/ads/components/AdsForm';
import AdsPage from './features/ads/components/AdsPage';


import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface User {
  id: number;
  username: string;
  email: string;
}

const Main: React.FC = () => {
  const location = useLocation();
  const dispatch = useDispatch();

  useEffect(() => {
    const accessToken = localStorage.getItem('access_token');
    const refreshToken = localStorage.getItem('refresh_token');
    const userStr = localStorage.getItem('user');
    let user: User | null = null;

    if (userStr) {
      try {
        user = JSON.parse(userStr) as User;
      } catch {
        user = null;
      }
    }

    if (accessToken && refreshToken && user) {
      dispatch({ type: 'LOGIN_SUCCESS', payload: { access: accessToken, refresh: refreshToken, user } });
    }
  }, [dispatch]);

  return (
    <>
      <HamburgerMenu />
      {location.pathname === '/' && <Header />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/posts" element={<PostFeed />} />
        <Route path="/post/:postId" element={<PostPage />} />
        <Route path="/create-post" element={<PrivateRoute><PostForm mode="create" /></PrivateRoute>} />
        <Route path="/edit-post/:postId" element={<PrivateRoute><PostForm mode="edit" /></PrivateRoute>} />        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile/:userId" element={<UserProfileView />} />
        <Route path="/profile" element={<PrivateRoute><UserProfile /></PrivateRoute>} />
        <Route path="/info/social" element={<SocialComponent />} />
        <Route path="/ads" element={<AdsFeed />} />
        <Route path="/ads/create-ads" element={<AdsForm />} />
        <Route path="/ads/:slug" element={<AdsPage />} />
        <Route path="/ads/:slug/edit" element={<PrivateRoute><AdsForm /></PrivateRoute>} />
      </Routes>
    </>
  );
};

const App: React.FC = () => (
  <Provider store={store}>
    <Router>
      <Main />
      <ToastContainer autoClose={3000} position="top-center" />
    </Router>
  </Provider>
);

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}

export default App;
