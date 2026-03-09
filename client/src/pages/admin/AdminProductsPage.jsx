import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getProducts, deleteProduct } from '../../utils/api';
import './AdminProductsPage.css';

const LIMIT_OPTIONS = [2, 10, 20, 50];

function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadProducts();
  }, [page, limit]);

  async function loadProducts() {
    setLoading(true);
    setError('');
    try {
      const data = await getProducts({ page, limit });
      setProducts(data.products ?? []);
      setTotalCount(data.totalCount ?? 0);
      setTotalPages(data.totalPages ?? 1);
    } catch (err) {
      setError(err.message || '상품 목록을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id, name) {
    if (!window.confirm(`"${name}" 상품을 삭제하시겠습니까?`)) return;
    setDeletingId(id);
    setError('');
    try {
      await deleteProduct(id);
      const remaining = products.filter((p) => p._id !== id);
      if (remaining.length === 0 && page > 1) {
        setPage(page - 1);
      } else {
        loadProducts();
      }
    } catch (err) {
      setError(err.message || '삭제에 실패했습니다.');
    } finally {
      setDeletingId(null);
    }
  }

  function getPageNumbers() {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];
    let l;

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= page - delta && i <= page + delta)) {
        range.push(i);
      }
    }

    for (const i of range) {
      if (l && i - l !== 1) {
        rangeWithDots.push('...');
      }
      rangeWithDots.push(i);
      l = i;
    }
    return rangeWithDots;
  }

  const startItem = totalCount === 0 ? 0 : (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, totalCount);

  return (
    <div className="admin-products">
      <div className="admin-products-header">
        <h1 className="admin-products-title">상품 목록</h1>
        <Link to="/admin/products/new" className="admin-btn admin-btn-primary">
          상품 등록
        </Link>
      </div>

      {error && <p className="admin-error">{error}</p>}

      {loading ? (
        <p className="admin-loading">로딩 중...</p>
      ) : products.length === 0 ? (
        <div className="admin-empty">
          <p>등록된 상품이 없습니다.</p>
          <Link to="/admin/products/new" className="admin-btn admin-btn-primary">
            상품 등록
          </Link>
        </div>
      ) : (
        <>
          <div className="admin-products-toolbar">
            <p className="admin-products-info">
              총 {totalCount.toLocaleString()}개 중 {startItem}-{endItem}번째
            </p>
            <div className="admin-products-limit">
              <label htmlFor="limit">페이지당</label>
              <select
                id="limit"
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setPage(1);
                }}
              >
                {LIMIT_OPTIONS.map((n) => (
                  <option key={n} value={n}>
                    {n}개
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>SKU</th>
                  <th>상품명</th>
                  <th>가격</th>
                  <th>재고</th>
                  <th>카테고리</th>
                  <th>등록일</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p._id}>
                    <td>{p.sku || '-'}</td>
                    <td>
                      <Link to={`/admin/products/${p._id}/edit`} className="admin-product-link">
                        {p.name}
                      </Link>
                    </td>
                    <td>{Number(p.price).toLocaleString()}원</td>
                    <td>{p.stock ?? 0}</td>
                    <td>{p.category || '-'}</td>
                    <td>{new Date(p.createdAt).toLocaleDateString('ko-KR')}</td>
                    <td>
                      <div className="admin-actions">
                        <Link
                          to={`/admin/products/${p._id}/edit`}
                          className="admin-btn admin-btn-sm admin-btn-outline"
                        >
                          수정
                        </Link>
                        <button
                          type="button"
                          className="admin-btn admin-btn-sm admin-btn-danger"
                          onClick={() => handleDelete(p._id, p.name)}
                          disabled={deletingId === p._id}
                        >
                          {deletingId === p._id ? '삭제 중...' : '삭제'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <nav className="admin-pagination" aria-label="페이지 네비게이션">
              <button
                type="button"
                className="admin-pagination-btn"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                aria-label="이전 페이지"
              >
                이전
              </button>
              <div className="admin-pagination-pages">
                {getPageNumbers().map((n, i) =>
                  n === '...' ? (
                    <span key={`dot-${i}`} className="admin-pagination-ellipsis">
                      ...
                    </span>
                  ) : (
                    <button
                      key={n}
                      type="button"
                      className={`admin-pagination-btn admin-pagination-num ${
                        page === n ? 'active' : ''
                      }`}
                      onClick={() => setPage(n)}
                    >
                      {n}
                    </button>
                  )
                )}
              </div>
              <button
                type="button"
                className="admin-pagination-btn"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                aria-label="다음 페이지"
              >
                다음
              </button>
            </nav>
          )}
        </>
      )}
    </div>
  );
}

export default AdminProductsPage;
