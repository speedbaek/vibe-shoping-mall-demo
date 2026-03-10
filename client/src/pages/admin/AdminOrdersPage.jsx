import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getOrdersAdmin, getImageUrl } from '../../utils/api';
import './AdminOrdersPage.css';

const STATUS_LABELS = {
  pending: '결제대기',
  paid: '결제완료',
  preparing: '준비중',
  completed: '완료',
  cancelled: '취소',
  refunded: '환불',
};

const LIMIT_OPTIONS = [10, 20, 50];

function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    loadOrders();
  }, [page, limit, statusFilter]);

  async function loadOrders() {
    setLoading(true);
    setError('');
    try {
      const params = { page, limit };
      if (statusFilter) params.status = statusFilter;
      const data = await getOrdersAdmin(params);
      setOrders(data.orders ?? []);
      setTotalCount(data.totalCount ?? 0);
      setTotalPages(data.totalPages ?? 1);
    } catch (err) {
      setError(err.message || '주문 목록을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }

  const startItem = totalCount === 0 ? 0 : (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, totalCount);

  return (
    <div className="admin-orders">
      <div className="admin-orders-header">
        <h1 className="admin-orders-title">주문 관리</h1>
      </div>

      {error && <p className="admin-error">{error}</p>}

      {loading ? (
        <p className="admin-loading">로딩 중...</p>
      ) : orders.length === 0 ? (
        <div className="admin-empty">
          <p>등록된 주문이 없습니다.</p>
        </div>
      ) : (
        <>
          <div className="admin-orders-toolbar">
            <p className="admin-orders-info">
              총 {totalCount.toLocaleString()}개 중 {startItem}-{endItem}번째
            </p>
            <div className="admin-orders-filters">
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="admin-orders-status-select"
              >
                <option value="">전체 상태</option>
                {Object.entries(STATUS_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
              <select
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setPage(1);
                }}
                className="admin-orders-limit-select"
              >
                {LIMIT_OPTIONS.map((n) => (
                  <option key={n} value={n}>
                    {n}개씩
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="admin-orders-table-wrap">
            <table className="admin-orders-table">
              <thead>
                <tr>
                  <th>주문번호</th>
                  <th>상품</th>
                  <th>주문자</th>
                  <th>결제금액</th>
                  <th>상태</th>
                  <th>주문일시</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id}>
                    <td className="admin-orders-no">{order.orderNo || '-'}</td>
                    <td>
                      <div className="admin-orders-items">
                        {order.items?.map((item, idx) => (
                          <div key={idx} className="admin-orders-item-row">
                            {item.product?.imageUrl ? (
                              <img
                                src={getImageUrl(item.product.imageUrl)}
                                alt={item.name}
                                className="admin-orders-item-img"
                              />
                            ) : (
                              <span className="admin-orders-item-placeholder">이미지 없음</span>
                            )}
                            <div className="admin-orders-item-info">
                              <span className="admin-orders-item-name">{item.name}</span>
                              <span className="admin-orders-item-qty">
                                × {item.quantity}
                              </span>
                            </div>
                          </div>
                        ))}
                        {(!order.items || order.items.length === 0) && '-'}
                      </div>
                    </td>
                    <td>
                      <div className="admin-orders-buyer">
                        <span>{order.user?.name || '-'}</span>
                        <span className="admin-orders-buyer-email">
                          {order.user?.email || ''}
                        </span>
                      </div>
                    </td>
                    <td>
                      {(order.finalAmount ?? order.totalAmount ?? 0).toLocaleString()}원
                    </td>
                    <td>
                      <span className={`admin-orders-status-badge status-${order.status}`}>
                        {STATUS_LABELS[order.status] || order.status}
                      </span>
                    </td>
                    <td>
                      {order.createdAt
                        ? new Date(order.createdAt).toLocaleString('ko-KR')
                        : '-'}
                    </td>
                    <td>
                      <Link
                        to={`/admin/orders/${order._id}`}
                        className="admin-btn admin-btn-sm admin-btn-outline"
                      >
                        상세
                      </Link>
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
              >
                이전
              </button>
              <span className="admin-pagination-info">
                {page} / {totalPages}
              </span>
              <button
                type="button"
                className="admin-pagination-btn"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
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

export default AdminOrdersPage;
