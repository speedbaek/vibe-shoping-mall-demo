import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getOrders } from '../utils/api';
import './OrderHistoryPage.css';

const STATUS_LABELS = {
  pending: '결제대기',
  paid: '결제완료',
  preparing: '준비중',
  completed: '완료',
  cancelled: '취소',
  refunded: '환불',
};

function OrderHistoryPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    getOrders({ page, limit: 10 })
      .then((res) => {
        setOrders(res?.orders ?? []);
        setTotalPages(res?.totalPages ?? 1);
      })
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, [user, page]);

  if (!user) {
    return (
      <div className="order-history">
        <div className="order-history-empty">
          <p>로그인 후 주문 내역을 확인할 수 있습니다.</p>
          <Link to="/login" className="order-history-btn">
            로그인
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="order-history">
      <div className="order-history-header">
        <Link to="/my" className="order-history-back">‹ 마이페이지</Link>
        <h1>주문내역</h1>
      </div>

      {loading ? (
        <div className="order-history-loading">로딩 중...</div>
      ) : orders.length === 0 ? (
        <div className="order-history-empty">
          <p>주문 내역이 없습니다.</p>
          <Link to="/" className="order-history-btn">
            강의 둘러보기
          </Link>
        </div>
      ) : (
        <>
          <ul className="order-history-list">
            {orders.map((order) => (
              <li key={order._id} className="order-history-item">
                <Link to={`/checkout/success/${order._id}`} className="order-history-card">
                  <div className="order-history-card-header">
                    <span className="order-history-no">{order.orderNo}</span>
                    <span className={`order-history-status status-${order.status}`}>
                      {STATUS_LABELS[order.status] || order.status}
                    </span>
                  </div>
                  <div className="order-history-card-body">
                    {order.items?.slice(0, 3).map((item, idx) => (
                      <span key={idx} className="order-history-product">
                        {item.name}
                        {item.quantity > 1 && ` × ${item.quantity}`}
                      </span>
                    ))}
                    {order.items?.length > 3 && (
                      <span className="order-history-more">
                        외 {order.items.length - 3}건
                      </span>
                    )}
                  </div>
                  <div className="order-history-card-footer">
                    <span className="order-history-date">
                      {order.createdAt
                        ? new Date(order.createdAt).toLocaleDateString('ko-KR')
                        : '-'}
                    </span>
                    <span className="order-history-amount">
                      {(order.finalAmount ?? order.totalAmount ?? 0).toLocaleString()}원
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>

          {totalPages > 1 && (
            <div className="order-history-pagination">
              <button
                type="button"
                className="order-history-page-btn"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                이전
              </button>
              <span className="order-history-page-info">
                {page} / {totalPages}
              </span>
              <button
                type="button"
                className="order-history-page-btn"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                다음
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default OrderHistoryPage;
