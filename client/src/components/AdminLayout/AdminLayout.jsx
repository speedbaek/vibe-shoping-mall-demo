import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './AdminLayout.css';

function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <Link to="/" className="admin-sidebar-brand">
          Vibe Mall
        </Link>
        <nav className="admin-nav">
          <Link to="/admin/products" className="admin-nav-link">
            상품 관리
          </Link>
          <Link to="/admin/products/new" className="admin-nav-link">
            상품 등록
          </Link>
          <Link to="/admin/categories" className="admin-nav-link">
            카테고리 관리
          </Link>
        </nav>
        <div className="admin-sidebar-footer">
          <span className="admin-user">{user?.name}님</span>
          <button type="button" className="admin-logout" onClick={handleLogout}>
            로그아웃
          </button>
        </div>
      </aside>
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;
