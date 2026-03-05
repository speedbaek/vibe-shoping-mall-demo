import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function HomePage() {
  const { user, loading, logout } = useAuth();

  if (loading) {
    return (
      <div className="home">
        <p>로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="home">
      <h1>Vibe Shopping Mall</h1>
      <p>쇼핑을 시작해 보세요.</p>
      <div className="home-actions">
        {user ? (
          <>
            <span className="home-user">안녕하세요, {user.name}님</span>
            <button type="button" className="btn-secondary" onClick={logout}>
              로그아웃
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="btn-primary">
              로그인
            </Link>
            <Link to="/signup" className="btn-primary btn-outline">
              회원가입
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

export default HomePage;
