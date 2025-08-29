// front/src/features/auth/Pages/EmailVerifyPage.tsx
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from '../../../axiosInstance';

const EmailVerifyPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [status, setStatus] = useState<'pending'|'success'|'fail'|'expired'>('pending');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) return;
    axios.get(`/api/auth/verify-email/${token}/`)
      .then(res => {
        setStatus('success');
        setMessage(res.data.detail || 'Email подтверждён!');
      })
      .catch(err => {
        if (err.response?.status === 410) {
          setStatus('expired');
          setMessage('Срок действия ссылки истёк. Зарегистрируйтесь снова.');
        } else {
          setStatus('fail');
          setMessage(err.response?.data?.detail || 'Ошибка подтверждения');
        }
      });
  }, [token]);

  return (
    <div style={{ maxWidth: 400, margin: "40px auto", textAlign: "center" }}>
      <h1>Email подтверждение</h1>
      <p>
        {status === 'pending' && 'Проверяем ссылку...'}
        {status === 'success' && <span style={{color: 'green'}}>{message}</span>}
        {status === 'fail' && <span style={{color: 'red'}}>{message}</span>}
        {status === 'expired' && <span style={{color: 'orange'}}>{message}</span>}
      </p>
      {(status === 'success' || status === 'expired') && (
        <Link to="/login">На страницу входа</Link>
      )}
    </div>
  );
};

export default EmailVerifyPage;
