import { useNavigate } from 'react-router-dom';

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div style={{ height: '100vh', display: 'grid', placeItems: 'center' }}>
      <div>
        <h1>Welcome to Inventory Management</h1>
        <p>Manage inventory, recipes and more.</p>

        <button onClick={() => navigate('/login')}>
          Login
        </button>
      </div>
    </div>
  );
};

export default Landing;
