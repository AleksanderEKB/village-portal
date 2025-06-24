import React, { ChangeEvent, FormEvent, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../../axiosInstance';
import { registerSuccess, registerFail } from '../../auth/authSlice';
import '../../auth/auth.scss';
import { RegisterFormData, RegisterErrors } from '../types'
import { AppDispatch } from '../../../app/store';


const Register: React.FC = () => {
    const [formData, setFormData] = useState<RegisterFormData>({
        email: '',
        password: '',
        confirmPassword: '',
        username: '',
        avatar: null
    });

    const [errors, setErrors] = useState<RegisterErrors>({});
    const [successMessage, setSuccessMessage] = useState<string>('');

    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();

    const { email, password, confirmPassword, username, avatar } = formData;

    const onChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.name === 'avatar' && e.target.files) {
            setFormData(prev => ({ ...prev, avatar: e.target.files![0] }));
        } else {
            setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
        }
    };

    const validateForm = (): boolean => {
        const newErrors: RegisterErrors = {};
        if (password !== confirmPassword) {
            newErrors.confirmPassword = 'Пароли не совпадают';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!validateForm()) {
            return;
        }
        const newUser = new FormData();
        newUser.append('email', email);
        newUser.append('password', password);
        newUser.append('username', username);
        if (avatar) {
            newUser.append('avatar', avatar);
        }

        try {
            const res = await axiosInstance.post('/api/auth/register/', newUser, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            dispatch(registerSuccess(res.data));
            setSuccessMessage('Регистрация прошла успешно!');
            setTimeout(() => {
                navigate('/profile');
            }, 2000);
        } catch (err: any) {
            dispatch(registerFail(err.response?.data));
            setErrors(err.response?.data || {});
        }
    };

    return (
        <div className="auth-container">
            <h1>Регистрация</h1>
            {successMessage && <p className="success-message">{successMessage}</p>}
            <form onSubmit={onSubmit} encType="multipart/form-data">
                <input
                    type="text"
                    placeholder="Псевдоним"
                    name="username"
                    value={username}
                    onChange={onChange}
                    required
                />
                {errors.username && <p className="error-message">{errors.username}</p>}
                <input
                    type="email"
                    placeholder="Email"
                    name="email"
                    value={email}
                    onChange={onChange}
                    required
                />
                {errors.email && <p className="error-message">{errors.email}</p>}
                <input
                    type="password"
                    placeholder="Придумайте пароль"
                    name="password"
                    value={password}
                    onChange={onChange}
                    minLength={6}
                    required
                />
                {errors.password && <p className="error-message">{errors.password}</p>}
                <input
                    type="password"
                    placeholder="Подтвердите пароль"
                    name="confirmPassword"
                    value={confirmPassword}
                    onChange={onChange}
                    minLength={6}
                    required
                />
                {errors.confirmPassword && <p className="error-message">{errors.confirmPassword}</p>}

                <div className="file-input-container">
                    <p>Выбрать изображение для аватарки</p>
                    <input
                        id="file-input"
                        type="file"
                        name="avatar"
                        accept="image/*"
                        onChange={onChange}
                    />
                    <label htmlFor="file-input" className="file-input-label">Выбрать файл</label>
                    <span className="file-chosen">{avatar ? avatar.name : 'Файл не выбран'}</span>
                </div>

                <input type="submit" value="Зарегистрироваться" />
            </form>
        </div>
    );
};

export default Register;
