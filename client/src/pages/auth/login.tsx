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
import { GoogleLogin } from '@react-oauth/google';

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: theme.background }}>
        <Loader />
      </div>
    );
  }

  return (
    <div
      className="w-full max-w-md rounded-2xl border px-8 py-10 shadow-sm space-y-8"
      style={{ backgroundColor: theme.surface, borderColor: theme.surface }}
    >
      <div className="flex flex-col items-center gap-3">
        <div
          className="flex h-12 w-12 items-center justify-center rounded-full"
          style={{ backgroundColor: theme.surfaceAlt, color: theme.primary }}
        >
          <span className="text-2xl">🧁</span>
        </div>
        <div className="space-y-1 text-center">
          <h2
            className="text-2xl font-semibold tracking-tight"
            style={{ color: theme.text }}
          >
            PantryPilot
          </h2>
          <p
            className="text-sm"
            style={{ color: theme.textMuted }}
          >
            Manage your bakery inventory with ease
          </p>
        </div>
      </div>
      <h2
        className="text-xl font-medium text-center"
        style={{ color: theme.text }}
      >
        Login
      </h2>

      <div className="w-full space-y-4">
        <GoogleLogin
          onSuccess={handleSuccess}
          onError={() => {
            console.log('Login Failed');
          }}
        />

        <div className="relative flex items-center justify-center">
          <div className="w-full border-t border-gray-300"></div>
          <span className="absolute px-3 text-sm text-gray-500" style={{ backgroundColor: theme.surface }}>
            OR
          </span>
        </div>
      </div>

      <form onSubmit={formik.handleSubmit} className="space-y-4">
        <FormikProvider value={formik}>
          <Field name="email" >
            {({ field, form, meta }) => (<>
              <TextField
                label="Email"
                name="email"
                type="email"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="you@example.com"
                error={meta.touched && meta.error ? meta.error : undefined}
                required
              />
            </>)}
          </Field>

          <Field name="password" >
            {({ field, form, meta }) => (
              <TextField
                label="Password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Enter your password"
                error={meta.touched && meta.error ? meta.error : undefined}
                required
                trailingIcon={
                  showPassword ? (
                    <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12s3.5-7 9-7 9 7 9 7-3.5 7-9 7-9-7-9-7Zm9 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m3 3 18 18M6.5 6.5C4.5 8 3 10.3 3 12c0 0 3.5 7 9 7 2 0 3.7-.6 5.1-1.5m2.4-2.4C20.8 13.7 21 12 21 12s-3.5-7-9-7c-1.6 0-3 .5-4.3 1.3M10 10a3 3 0 0 0 4 4" />
                    </svg>
                  )
                }
                onTrailingIconClick={() => setShowPassword((v) => !v)}
              />
            )}
          </Field>


        </FormikProvider>



        <div className="pt-2 flex justify-center">
          <Button
            type="submit"
            onClick={() => formik.handleSubmit()}
            variant="primary"
          >
            Login
          </Button>
        </div>
        <p
          className="pt-2 text-sm text-center"
          style={{ color: theme.textMuted }}
        >
          Don't have an account?{' '}
          <Link
            to="/signup"
            className="hover:underline"
            style={{ color: theme.primary }}
          >
            Sign up
          </Link>
        </p>
      </form>
    </div>
  );
}

export default Login;
