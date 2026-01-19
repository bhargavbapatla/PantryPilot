import { Field, FormikProvider, useFormik } from 'formik';
import * as Yup from 'yup';
import TextField from '../../components/TextField';
import Button from '../../components/Button';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../features/auth/authContext';
import { useState } from 'react';
import Loader from '../../components/Loader';
import { loginUser } from '../../api/auth';
import toast from 'react-hot-toast';

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
        const { data, status } = await loginUser(values);
        console.log(data, status);
        if (status == 200) {
          console.log("datadatadata",data)
          toast.success(data.message || 'Login successful');
          login(data, data.token);
          // navigate("/dashboard");

        } else {
          toast.error(data.message || 'Login failed');
        }

      } catch (error) {
        console.error("Login error:", error);
      } finally {
        setLoading(false);
      }
    },
  });

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
        <Button
          type="button"
          variant="ghost"
          fullWidth
          onClick={() => {
            console.log("Google Login clicked");
            toast.success("Redirecting to Google Login...");
          }}
          className="flex items-center justify-center gap-2"
          style={{
            backgroundColor: theme.secondary,
            color: theme.surface,
            borderColor: theme.secondary,
          }}
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Login via Google
        </Button>
        
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
