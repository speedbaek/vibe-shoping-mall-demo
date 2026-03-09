import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import './Navbar.css';

function Navbar() {
  const { user, loading, logout } = useAuth();
  const { cartCount } = useCart();

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <div className="navbar-spacer" />
        <Link to="/" className="navbar-brand">
          Vibe AI Academy
        </Link>
        <div className="navbar-actions">
          {loading ? (
            <span className="navbar-loading">로딩 중...</span>
          ) : user ? (
            <>
              <span className="navbar-user">안녕하세요, {user.name}님</span>
              {user.userType === 'admin' && (
                <Link to="/admin/products" className="navbar-btn navbar-btn-outline">
                  관리자
                </Link>
              )}
              <button type="button" className="navbar-btn navbar-btn-outline" onClick={logout}>
                로그아웃
              </button>
              <Link to="/cart" className="navbar-cart-icon" title="장바구니">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="9" cy="21" r="1"/>
                  <circle cx="20" cy="21" r="1"/>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                </svg>
                {cartCount > 0 && (
                  <span className="navbar-cart-badge">{cartCount}</span>
                )}
              </Link>
            </>
          ) : (
            <>
              <Link to="/login" className="navbar-btn navbar-btn-primary">
                로그인
              </Link>
              <Link to="/signup" className="navbar-btn navbar-btn-outline">
                회원가입
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;
