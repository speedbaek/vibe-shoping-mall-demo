import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCategories, deleteCategory } from '../../utils/api';
import './AdminCategoriesPage.css';

function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    setLoading(true);
    setError('');
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (err) {
      setError(err.message || '카테고리 목록을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id, label) {
    if (!window.confirm(`"${label}" 카테고리를 삭제하시겠습니까?`)) return;
    setDeletingId(id);
    setError('');
    try {
      await deleteCategory(id);
      setCategories((prev) => prev.filter((c) => c._id !== id));
    } catch (err) {
      setError(err.message || '삭제에 실패했습니다.');
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="admin-categories">
      <div className="admin-products-header">
        <h1 className="admin-products-title">카테고리 관리</h1>
        <Link to="/admin/categories/new" className="admin-btn admin-btn-primary">
          카테고리 추가
        </Link>
      </div>
      <p className="admin-categories-desc">메인 화면에 표시되는 카테고리를 관리합니다.</p>

      {error && <p className="admin-error">{error}</p>}

      {loading ? (
        <p className="admin-loading">로딩 중...</p>
      ) : categories.length === 0 ? (
        <div className="admin-empty">
          <p>등록된 카테고리가 없습니다.</p>
          <Link to="/admin/categories/new" className="admin-btn admin-btn-primary">
            카테고리 추가
          </Link>
        </div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>아이콘</th>
                <th>카테고리명</th>
                <th>순서</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat._id}>
                  <td>{cat.id}</td>
                  <td><span className="admin-category-icon">{cat.icon || '📦'}</span></td>
                  <td>
                    <Link to={`/admin/categories/${cat._id}/edit`} className="admin-product-link">
                      {cat.label}
                    </Link>
                  </td>
                  <td>{cat.order ?? 0}</td>
                  <td>
                    <div className="admin-actions">
                      <Link
                        to={`/admin/categories/${cat._id}/edit`}
                        className="admin-btn admin-btn-sm admin-btn-outline"
                      >
                        수정
                      </Link>
                      <button
                        type="button"
                        className="admin-btn admin-btn-sm admin-btn-danger"
                        onClick={() => handleDelete(cat._id, cat.label)}
                        disabled={deletingId === cat._id}
                      >
                        {deletingId === cat._id ? '삭제 중...' : '삭제'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AdminCategoriesPage;
