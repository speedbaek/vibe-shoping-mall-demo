import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import './Navbar.css';

function Navbar() {
  const { user, loading, logout } = useAuth();
  const { cartCount } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <button
          type="button"
          className="navbar-hamburger"
          aria-label="메뉴"
          onClick={() => setMenuOpen((o) => !o)}
          aria-expanded={menuOpen}
        >
          <span /><span /><span />
        </button>
        <Link to="/" className="navbar-brand" onClick={closeMenu}>
          Vibe AI Academy
        </Link>
        <Link to="/cart" className="navbar-cart-icon navbar-cart-mobile" title="장바구니" onClick={closeMenu}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="21" r="1"/>
            <circle cx="20" cy="21" r="1"/>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
          </svg>
          {cartCount > 0 && (
            <span className="navbar-cart-badge">{cartCount}</span>
          )}
        </Link>
        <nav className={`navbar-actions ${menuOpen ? 'is-open' : ''}`}>
          {loading ? (
            <span className="navbar-loading">로딩 중...</span>
          ) : user ? (
            <>
              <Link to="/my" className="navbar-user" onClick={closeMenu}>
                <span className="navbar-user-full">안녕하세요, {user.name}님</span>
                <span className="navbar-user-short">{user.name}님</span>
              </Link>
              {user.userType === 'admin' && (
                <Link to="/admin/products" className="navbar-btn navbar-btn-outline" onClick={closeMenu}>
                  관리자
                </Link>
              )}
              <button type="button" className="navbar-btn navbar-btn-outline" onClick={() => { logout(); closeMenu(); }}>
                로그아웃
              </button>
              <Link to="/cart" className="navbar-cart-icon navbar-cart-desktop" title="장바구니" onClick={closeMenu}>
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
              <Link to="/login" className="navbar-btn navbar-btn-primary" onClick={closeMenu}>
                로그인
              </Link>
              <Link to="/signup" className="navbar-btn navbar-btn-outline" onClick={closeMenu}>
                회원가입
              </Link>
            </>
          )}
        </nav>
      </div>
      {menuOpen && (
        <div className="navbar-backdrop" onClick={closeMenu} aria-hidden />
      )}
    </header>
  );
}

export default Navbar;
