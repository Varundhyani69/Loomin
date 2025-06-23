import { useSelector } from 'react-redux';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

const ProtectedRoute = () => {
    const { user } = useSelector((state) => state.auth);
    const location = useLocation();

    if (!user) {
        // Redirect to login with intended path
        return <Navigate to={`/login?redirect=${location.pathname}`} replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
