import { Field, FormikProvider, useFormik } from 'formik';
import * as Yup from 'yup';
import TextField from '../../components/TextField';
import Button from '../../components/Button';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../features/auth/authContext';
import { useState } from 'react';
import Loader from '../../components/Loader';
import { googleSSOLogin, loginUser } from '../../api/auth';
import toast from 'react-hot-toast';
import { GoogleLogin, useGoogleLogin } from '@react-oauth/google';
import { Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const { login, theme } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .email('Invalid email address')
        .required('Email is required'),
      password: Yup.string()
        .required('Password is required'),
    }),
    onSubmit: async (values) => {
      setLoading(true);
      try {
        // handle login submit with values.email and values.password
        // Simulate API call delay

        const { data, status, message } = await loginUser(values);
        if (status == 200) {
          toast.success(message || 'Login successful');
          login(data, data.token);
          // navigate("/dashboard");

        } else {
          toast.error(message || 'Login failed');

        }

      } catch (error) {
        console.error("Login error:", error);
      } finally {
        setLoading(false);
      }
    },
  });

  const handleSuccess = async (credentialResponse: any) => {
    // 1. Capture the 'credential' (This is the JWT ID Token from Google)
    const { credential } = credentialResponse;
    setLoading(true);
    try {
      // 2. Send it to your backend
      const { data, status, message } = await googleSSOLogin(credential);
      console.log(data, status);
      console.log("datadatadata", data)

      if (status == 200) {
        toast.success(message || 'Login successful');
        login(data, data.token);
        // navigate("/dashboard");

      } else {
        toast.error(message || 'Login failed');
      }
    } catch (error) {
      console.error("Login Failed", error);
    } finally {
      setLoading(false);
    }
  };

  // if (loading) {
  //   return (
  //     <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: theme.background }}>
  //       <Loader />
  //     </div>
  //   );
  // }


  return (
    <div
      className="w-full max-w-md rounded-2xl border px-8 py-10 shadow-sm space-y-8"
      style={{ backgroundColor: theme.surface, borderColor: theme.surface }}
    >
      {/* ================= HEADER ================= */}
      <div className="space-y-4 text-center">
        {/* Logo */}
        <div className="flex justify-center">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl"
            style={{ backgroundColor: theme.surfaceAlt, color: theme.primary }}
          >
            <span className="text-xl font-semibold">🧁</span>
          </div>
        </div>

        {/* Title */}
        <div className="space-y-1">
          <h1
            className="text-4xl font-semibold"
            style={{ color: theme.text }}
          >
            Welcome back
          </h1>
          <p
            className="text-sm"
            style={{ color: theme.textMuted, margin: '10px' }}
          >
            Sign in to your PantryPilot account
          </p>
        </div>
      </div>

      {/* ================= FORM ================= */}
      <form onSubmit={formik.handleSubmit} className="space-y-4">
        <FormikProvider value={formik}>
          <Field name="email">
            {({ meta }) => (
              <TextField
                label="Email"
                name="email"
                type="email"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="you@example.com"
                error={meta.touched ? meta.error : undefined}
                required
              />
            )}
          </Field>

          <Field name="password">
            {({ meta }) => (
              <TextField
                label="Password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Enter your password"
                error={meta.touched ? meta.error : undefined}
                required
                trailingIcon={
                  showPassword ? (
                    <Eye className="w-5 h-5 text-gray-500" />
                  ) : (
                    <EyeOff className="w-5 h-5 text-gray-500" />
                  )
                }
                onTrailingIconClick={() => setShowPassword((v) => !v)}
              />
            )}
          </Field>
        </FormikProvider>

        <div className="pt-4">
          <Button type="submit" fullWidth variant="primary" loading={loading}>
            Login
          </Button>
        </div>
      </form>

      {/* ================= SOCIAL LOGIN (BOTTOM) ================= */}
      <div className="space-y-4">
        <div className="relative flex items-center">
          <div className="flex-grow border-t border-gray-300" />
          <span
            className="mx-3 text-xs text-gray-500"
            style={{ backgroundColor: theme.surface }}
          >
            Or
          </span>
          <div className="flex-grow border-t border-gray-300" />
        </div>

        <div className="grid grid-cols-1 gap-3">
          <GoogleLogin
            onSuccess={handleSuccess}
            onError={() => console.log('Login Failed')}
          />
        </div>
      </div>

      {/* ================= FOOTER ================= */}
      <p
        className="pt-2 text-sm text-center"
        style={{ color: theme.textMuted }}
      >
        Don&apos;t Have An Account?{' '}
        <Link
          to="/signup"
          className="hover:underline"
          style={{ color: theme.primary }}
        >
          Register Now.
        </Link>
      </p>
    </div>
  );
}

export default Login;
