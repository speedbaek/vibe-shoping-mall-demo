import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createUser } from '../utils/api';

const PASSWORD_HINT = '8자 이상, 영문, 숫자, 특수문자 포함';

function SignUpPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [agreeMarketing, setAgreeMarketing] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    contact: '',
    password: '',
    confirmPassword: '',
    address: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const agreeAllChecked = agreeTerms && agreePrivacy && agreeMarketing;

  const handleAgreeAll = (e) => {
    const checked = e.target.checked;
    setAgreeTerms(checked);
    setAgreePrivacy(checked);
    setAgreeMarketing(checked);
  };

  const handleAgree = (name) => (e) => {
    const checked = e.target.checked;
    if (name === 'terms') setAgreeTerms(checked);
    if (name === 'privacy') setAgreePrivacy(checked);
    if (name === 'marketing') setAgreeMarketing(checked);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.name.trim()) {
      setError('이름을 입력해 주세요.');
      return;
    }
    if (!form.email.trim()) {
      setError('이메일을 입력해 주세요.');
      return;
    }
    if (!form.contact.trim()) {
      setError('전화번호를 입력해 주세요.');
      return;
    }
    if (!form.password) {
      setError('비밀번호를 입력해 주세요.');
      return;
    }
    if (form.password.length < 6) {
      setError('비밀번호는 6자 이상이어야 합니다.');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }
    if (!agreeTerms || !agreePrivacy) {
      setError('필수 약관에 동의해 주세요.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await createUser({
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        contact: form.contact.trim(),
        password: form.password,
        address: form.address.trim() || undefined,
      });
      setShowSuccessAlert(true);
      setTimeout(() => {
        setShowSuccessAlert(false);
        navigate('/');
      }, 2000);
    } catch (err) {
      setError(err.message || '회원가입에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="signup-page">
      {showSuccessAlert && (
        <>
          <div className="signup-success-overlay" aria-hidden />
          <div className="signup-success-alert" role="alert">
            <p>회원가입이 완료되었습니다.</p>
          </div>
        </>
      )}
      <div className="signup-card">
        <h1 className="signup-title">회원가입</h1>
        <p className="signup-subtitle">새로운 계정을 만들어 쇼핑을 시작하세요</p>

        <form onSubmit={handleSubmit} className="signup-form">
          <div className="form-group">
            <label htmlFor="name">이름</label>
            <div className="input-wrap">
              <span className="input-icon" aria-hidden>👤</span>
              <input
                id="name"
                name="name"
                type="text"
                placeholder="이름"
                value={form.name}
                onChange={handleChange}
                autoComplete="name"
              />
            </div>
          </div>

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
            <label htmlFor="contact">전화번호</label>
            <div className="input-wrap">
              <span className="input-icon" aria-hidden>📱</span>
              <input
                id="contact"
                name="contact"
                type="tel"
                placeholder="010-1234-5678"
                value={form.contact}
                onChange={handleChange}
                autoComplete="tel"
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
                autoComplete="new-password"
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
            <span className="input-hint">{PASSWORD_HINT}</span>
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">비밀번호 확인</label>
            <div className="input-wrap">
              <span className="input-icon" aria-hidden>🔒</span>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="비밀번호를 다시 입력하세요"
                value={form.confirmPassword}
                onChange={handleChange}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="input-toggle"
                onClick={() => setShowConfirmPassword((v) => !v)}
                aria-label={showConfirmPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
              >
                {showConfirmPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="address">주소 (선택)</label>
            <div className="input-wrap">
              <input
                id="address"
                name="address"
                type="text"
                placeholder="주소를 입력하세요"
                value={form.address}
                onChange={handleChange}
                autoComplete="street-address"
              />
            </div>
          </div>

          <div className="agreement">
            <label className="checkbox-row agree-all">
              <input
                type="checkbox"
                checked={agreeAllChecked}
                onChange={handleAgreeAll}
              />
              <span>전체 동의</span>
            </label>
            <label className="checkbox-row">
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={handleAgree('terms')}
              />
              <span>이용약관 동의 (필수)</span>
              <a href="#terms" className="link-view">보기</a>
            </label>
            <label className="checkbox-row">
              <input
                type="checkbox"
                checked={agreePrivacy}
                onChange={handleAgree('privacy')}
              />
              <span>개인정보처리방침 동의 (필수)</span>
              <a href="#privacy" className="link-view">보기</a>
            </label>
            <label className="checkbox-row">
              <input
                type="checkbox"
                checked={agreeMarketing}
                onChange={handleAgree('marketing')}
              />
              <span>마케팅 정보 수신 동의 (선택)</span>
            </label>
          </div>

          {error && <p className="form-error">{error}</p>}

          <button type="submit" className="btn-submit" disabled={isSubmitting}>
            {isSubmitting ? '처리 중...' : '회원가입'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default SignUpPage;
