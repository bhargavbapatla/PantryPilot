import { Field, FormikProvider, useFormik } from 'formik';
import * as Yup from 'yup';
import TextField from '../../components/TextField';
import Button from '../../components/Button';
import { Link } from 'react-router-dom';
import { useAuth } from '../../features/auth/authContext';

const Login = () => {
  const {login} = useAuth();
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
    onSubmit: (values) => {
      // handle login submit with values.email and values.password
      console.log('Login values:', values);
      const mockUser = { id: '1', name: 'Mom', email: 'mom@bakery.com', role: 'user' };
      const mockToken = 'abc-123-xyz';

      login(mockUser, mockToken);

    },
  });

  console.log('formik:', formik);
  return (
    <div className="bg-white p-8 rounded shadow-md w-96">
      <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
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
              <>{console.log('meta:', meta)}</>
            </>)}
          </Field>

          <Field name="password" >
            {({ field, form, meta }) => (
              <TextField
                label="Password"
                name="password"
                type="password"
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Enter your password"
                error={meta.touched && meta.error ? meta.error : undefined}
                required
              />
            )}
          </Field>


        </FormikProvider>



        <div className="flex justify-center">
          <Button
            type="submit"
            onClick={() => formik.handleSubmit()}
          >
            Login
          </Button>
        </div>
        <p className="text-sm text-gray-600 text-center">
          dont have an account ?{' '}
          <Link to="/signup" className="text-blue-600 hover:underline">
            sign up
          </Link>
        </p>
      </form>
    </div>
  );
}

export default Login;
