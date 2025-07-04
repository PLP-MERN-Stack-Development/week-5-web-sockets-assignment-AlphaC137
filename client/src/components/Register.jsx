// components/Register.jsx - Registration component
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const Register = ({ onRegister }) => {
  const { register, isLoading } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [localErrors, setLocalErrors] = useState({});

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear specific error when user starts typing
    if (localErrors[e.target.name]) {
      setLocalErrors({
        ...localErrors,
        [e.target.name]: ''
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setLocalErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLocalErrors({});

    try {
      const { confirmPassword, ...registerData } = formData;
      const result = await register(registerData);
      onRegister(result.user, result.token);
    } catch (error) {
      if (error.errors) {
        const backendErrors = {};
        error.errors.forEach(err => {
          backendErrors[err.param] = err.msg;
        });
        setLocalErrors(backendErrors);
      } else {
        setLocalErrors({ general: error.message || 'Registration failed' });
      }
    }
  };

  return (
    <div className="register-container">
      <form onSubmit={handleSubmit} className="register-form">
        <h2>Register for Chat</h2>
        
        {localErrors.general && <div className="error-message">{localErrors.general}</div>}
        
        <div className="form-group">
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
            required
          />
          {localErrors.username && <span className="field-error">{localErrors.username}</span>}
        </div>
        
        <div className="form-group">
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          {localErrors.email && <span className="field-error">{localErrors.email}</span>}
        </div>
        
        <div className="form-group">
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          {localErrors.password && <span className="field-error">{localErrors.password}</span>}
        </div>
        
        <div className="form-group">
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />
          {localErrors.confirmPassword && <span className="field-error">{localErrors.confirmPassword}</span>}
        </div>
        
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Registering...' : 'Register'}
        </button>
      </form>
    </div>
  );
};

export default Register;
