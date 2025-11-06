// front/src/index.tsx
import React, { StrictMode, Suspense, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { Provider } from "react-redux";
import store from "./app/store";
import { useAppDispatch } from "./app/hook";
import { hydrateFromStorage } from "./features/auth/model/authSlice";
import "./features/shared/styles/global.scss";
import AppLayout from "./layouts/AppLayout";
import AuthLayout from "./layouts/AuthLayout";

const Home = React.lazy(() =>
  import(/* webpackChunkName: "home", webpackPrefetch: true */ "./features/Home/Home")
);

const AuthPage = React.lazy(() =>
  import(/* webpackChunkName: "auth-page" */ "./features/auth/Pages/AuthPage")
);

const ProfilePage = React.lazy(() =>
  import(/* webpackChunkName: "profile" */ "./features/auth/Pages/profile/ProfilePage")
);

const PrivateRoute = React.lazy(() =>
  import(/* webpackChunkName: "private" */ "./features/auth/ui/PrivateRoute/PrivateRoute")
);

const EmailVerifyPage = React.lazy(() => import('./features/auth/Pages/EmailVerifyPage'));

const ResetPasswordPage = React.lazy(() =>
  import(/* webpackChunkName: "reset-password" */ './features/auth/Pages/ResetPasswordPage')
);

const ToastContainerLazy = React.lazy(() =>
  import(/* webpackChunkName: "toastify" */ "react-toastify").then((m) => ({
    default: m.ToastContainer,
  }))
);

const ServicesListPage = React.lazy(() =>
  import(/* webpackChunkName: "services-list" */ "./features/services/pages/ServicesListPage")
);

const ServiceDetailPage = React.lazy(() =>
  import(/* webpackChunkName: "service-detail" */ "./features/services/pages/ServiceDetailPage")
);

const PostsFeedPage = React.lazy(() =>
  import(/* webpackChunkName: "posts-feed" */ "./features/posts/pages/PostsFeedPage")
);
const PostDetailPage = React.lazy(() =>
  import(/* webpackChunkName: "post-detail" */ "./features/posts/pages/PostDetailPage")
);

const Main: React.FC = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(hydrateFromStorage());
  }, [dispatch]);

  return (
    <Routes>
      {/* Роуты с Header */}
      <Route element={<AppLayout />}>
        <Route path="/" element={<Home />} />

        {/* NEW: услуги */}
        <Route path="/services" element={<ServicesListPage />} />
        <Route path="/services/:slug" element={<ServiceDetailPage />} />
        <Route path="/posts" element={<PostsFeedPage />} />
        <Route path="/posts/:id" element={<PostDetailPage />} />
      </Route>

      {/* Роуты без Header */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<AuthPage />} />
        <Route path="/register" element={<AuthPage />} />
        <Route path="/verify-email/:token" element={<EmailVerifyPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <ProfilePage />
            </PrivateRoute>
          }
        />
      </Route>
    </Routes>
  );
};

const App: React.FC = () => (
  <Provider store={store}>
    <Router>
      <Suspense fallback={<div>Загрузка...</div>}>
        <Main />
        <ToastContainerLazy autoClose={3000} position="top-center" />
      </Suspense>
    </Router>
  </Provider>
);

const container = document.getElementById("root");
if (container) {
  const root = createRoot(container);
  root.render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}

export default App;
