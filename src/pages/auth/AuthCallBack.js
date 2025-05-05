import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

function AuthCallBack() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const { setUser } = useAuth();

  useEffect(() => {
    if (token) {
        const { access_token, user } = response.data;

        localStorage.setItem('token', access_token);
        api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
        setUser(user); 
        
        navigate('/');
    }
  }, [token, navigate, setUser]);

  return <p>Redirecionando...</p>;
}

export default AuthCallBack;
