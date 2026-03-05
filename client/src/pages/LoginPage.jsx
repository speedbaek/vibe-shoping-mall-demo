import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    email: '',
    password: '',
    remember: true,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.email.trim()) {
      setError('이메일을 입력해 주세요.');
      return;
    }
    if (!form.password) {
      setError('비밀번호를 입력해 주세요.');
      return;
    }

    setIsSubmitting(true);
    try {
      await login(form.email, form.password, form.remember);
      navigate('/');
    } catch (err) {
      setError(err.message || '로그인에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h1 className="login-title">로그인</h1>
        <p className="login-subtitle">이메일과 비밀번호로 로그인하세요</p>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">이메일</label>
            <div className="input-wrap">
              <span className="input-icon" aria-hidden>✉️</span>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="your@email.com"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">비밀번호</label>
            <div className="input-wrap">
              <span className="input-icon" aria-hidden>🔒</span>
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="비밀번호를 입력하세요"
                value={form.password}
                onChange={handleChange}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="input-toggle"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <label className="checkbox-row remember-me">
            <input
              type="checkbox"
              name="remember"
              checked={form.remember}
              onChange={handleChange}
            />
            <span>자동 로그인 (로그인 상태 유지)
            </span>
          </label>

          {error && <p className="form-error">{error}</p>}

          <button type="submit" className="btn-submit" disabled={isSubmitting}>
            {isSubmitting ? '로그인 중...' : '로그인'}
          </button>

          <p className="login-footer">
            계정이 없으신가요? <Link to="/signup">회원가입</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
