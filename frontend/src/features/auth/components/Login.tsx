import React, { useState, ChangeEvent, FormEvent } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../../axiosInstance';
import { loginSuccess, loginFail } from '../authSlice';
import '../../auth/auth.scss';
import { LoginResponse } from '../types'


const Login: React.FC = () => {
    const [formData, setFormData] = useState<{ email: string; password: string }>({
        email: '',
        password: ''
    });
    const [error, setError] = useState<string>('');

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { email, password } = formData;

    const onChange = (e: ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            const body = JSON.stringify({ email, password });
            const res = await axiosInstance.post<LoginResponse>('/api/auth/login/', body, {
                headers: { 'Content-Type': 'application/json' }
            });
            dispatch(loginSuccess(res.data));
            navigate('/profile');
        } catch (err: any) {
            // Можно расширить обработку ошибки, если нужно
            dispatch(loginFail(err.response?.data));
            setError('Неправильный логин или пароль');
        }
    };

    return (
        <div className="auth-container">
            <h1>Вход</h1>
            {error && <p className="error-message">{error}</p>}
            <form onSubmit={onSubmit}>
                <input
                    type="email"
                    placeholder="Введите ваш Email"
                    name="email"
                    value={email}
                    onChange={onChange}
                    required
                />
                <input
                    type="password"
                    placeholder="Пароль"
                    name="password"
                    value={password}
                    onChange={onChange}
                    minLength={6}
                />
                <input type="submit" value="Войти" />
            </form>
        </div>
    );
};

export default Login;
