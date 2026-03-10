import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { getOrders } from '../utils/api';
import { useState, useEffect } from 'react';
import './MyPage.css';

const STATUS_LABELS = {
  pending: '결제대기',
  paid: '결제완료',
  preparing: '준비중',
  completed: '완료',
  cancelled: '취소',
  refunded: '환불',
};

function MyPage() {
  const { user } = useAuth();
  const { cartCount } = useCart();
  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    if (user) {
      getOrders({ limit: 5 })
        .then((res) => setRecentOrders(res?.orders ?? []))
        .catch(() => setRecentOrders([]));
    }
  }, [user]);

  if (!user) {
    return (
      <div className="mypage">
        <div className="mypage-empty">
          <p>로그인 후 이용해 주세요.</p>
          <Link to="/login" className="mypage-btn">
            로그인
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mypage">
      <h1 className="mypage-title">마이페이지</h1>

      <section className="mypage-section">
        <h2>내 정보</h2>
        <div className="mypage-info">
          <p><strong>{user.name}</strong>님</p>
          <p className="mypage-email">{user.email}</p>
          {user.contact && <p>{user.contact}</p>}
        </div>
      </section>

      <section className="mypage-section">
        <h2>바로가기</h2>
        <div className="mypage-quick-links">
          <Link to="/my/orders" className="mypage-link-card">
            <span className="mypage-link-icon">📋</span>
            <span>주문내역</span>
          </Link>
          <Link to="/cart" className="mypage-link-card">
            <span className="mypage-link-icon">🛒</span>
            <span>장바구니 {cartCount > 0 && <em>({cartCount})</em>}</span>
          </Link>
        </div>
      </section>

      <section className="mypage-section">
        <div className="mypage-section-header">
          <h2>최근 주문</h2>
          <Link to="/my/orders" className="mypage-more">전체보기 ›</Link>
        </div>
        {recentOrders.length === 0 ? (
          <p className="mypage-empty-orders">최근 주문 내역이 없습니다.</p>
        ) : (
          <ul className="mypage-order-list">
            {recentOrders.map((order) => {
              const productNames = order.items
                ?.map((i) => i.name)
                .filter(Boolean) ?? [];
              const productSummary =
                productNames.length === 0
                  ? '-'
                  : productNames.length === 1
                    ? productNames[0]
                    : `${productNames[0]} 외 ${productNames.length - 1}건`;
              return (
                <li key={order._id}>
                  <Link to={`/checkout/success/${order._id}`} className="mypage-order-item">
                    <div className="mypage-order-main">
                      <span className="mypage-order-no">{order.orderNo}</span>
                      <span className="mypage-order-status">
                        {STATUS_LABELS[order.status] || order.status}
                      </span>
                    </div>
                    <span className="mypage-order-products">{productSummary}</span>
                    <div className="mypage-order-meta">
                      <span className="mypage-order-date">
                        {order.createdAt
                          ? new Date(order.createdAt).toLocaleDateString('ko-KR')
                          : '-'}
                      </span>
                      <span className="mypage-order-amount">
                        {(order.finalAmount ?? order.totalAmount ?? 0).toLocaleString()}원
                      </span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}

export default MyPage;
