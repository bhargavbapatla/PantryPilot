import { Outlet, Link } from 'react-router-dom';
import { useAuth } from '../features/auth/authContext';

const AuthLayout = () => {
    const { token } = useAuth();
    if (!token) {
        return (
            // 1. MAIN CONTAINER: Full screen height, centered content, light gray background
            <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">

                {/* 2. THE CARD: White background, shadow, rounded corners */}
                <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg border border-gray-100">

                    {/* 3. HEADER: Branding Section (Logo & Title) */}
                    <div className="text-center">
                        {/* Replace this div with an <img src="/logo.png" /> later */}
                        <div className="mx-auto h-12 w-12 bg-emerald-100 rounded-full flex items-center justify-center">
                            <span className="text-2xl">🧁</span>
                        </div>

                        <h2 className="mt-4 text-3xl font-extrabold text-gray-900 tracking-tight">
                            PantryPilot
                        </h2>
                        <p className="mt-2 text-sm text-gray-600">
                            Manage your bakery inventory with ease
                        </p>
                    </div>

                    {/* 4. THE OUTLET: This is where Login.tsx / Signup.tsx will automatically appear */}
                    <div className="mt-8">
                        <Outlet />
                    </div>

                    {/* 5. FOOTER: Simple copyright or links */}
                    <div className="mt-6 text-center text-xs text-gray-400">
                        &copy; {new Date().getFullYear()} Mom's Bakery Inc.
                    </div>

                </div>
            </div>
        );
    } else {
        return (
            <div>
                
            </div>
        );
    }
};

export default AuthLayout;