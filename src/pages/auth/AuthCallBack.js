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
      localStorage.setItem('token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      api.get('/users/me')
        .then(res => {
          setUser(res.data);
          navigate('/');
        })
        .catch(err => {
          console.error('Erro ao buscar usuário:', err);
          navigate('/login');
        });
    } else {
      navigate('/login');
    }
  }, [token, navigate, setUser]);

  return <p>Redirecionando...</p>;
}

export default AuthCallBack;
