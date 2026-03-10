import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getOrder } from '../utils/api';
import './CheckoutSuccessPage.css';

const PAYMENT_LABELS = {
  card: '신용/체크카드',
  bank: '계좌이체',
  kakao: '카카오페이',
  naver: '네이버페이',
  toss: '토스페이',
  virtual: '가상계좌',
};

function CheckoutSuccessPage() {
  const { orderId } = useParams();
  const { user } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!orderId || !user) {
      setLoading(false);
      return;
    }
    getOrder(orderId)
      .then(setOrder)
      .catch((err) => setError(err.message || '주문 정보를 불러오지 못했습니다.'))
      .finally(() => setLoading(false));
  }, [orderId, user]);

  if (!user) {
    return (
      <div className="order-complete">
        <div className="order-complete-empty">
          <p>로그인 후 주문 내역을 확인할 수 있습니다.</p>
          <Link to="/login" className="order-complete-btn">
            로그인
          </Link>
        </div>
      </div>
    );
  }

  if (!orderId) {
    return (
      <div className="order-complete">
        <div className="order-complete-header order-complete-header-simple">
          <div className="order-complete-icon">✓</div>
          <h1>결제가 완료되었습니다</h1>
          <p className="order-complete-sub">
            결제가 정상적으로 처리되었습니다.
            <br />
            주문내역에서 상세 정보를 확인해 주세요.
          </p>
        </div>
        <div className="order-complete-actions order-complete-actions-stack">
          <Link to="/my/orders" className="order-complete-btn order-complete-btn-primary">
            주문내역 보기
          </Link>
          <Link to="/" className="order-complete-btn order-complete-btn-outline">
            홈으로
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="order-complete">
        <div className="order-complete-loading">로딩 중...</div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="order-complete">
        <div className="order-complete-empty">
          <p>{error || '주문 정보를 찾을 수 없습니다.'}</p>
          <Link to="/" className="order-complete-btn">
            홈으로
          </Link>
        </div>
      </div>
    );
  }

  const finalAmount = order.finalAmount ?? order.totalAmount ?? 0;
  const paidAt = order.paidAt
    ? new Date(order.paidAt).toLocaleString('ko-KR')
    : order.createdAt
      ? new Date(order.createdAt).toLocaleString('ko-KR')
      : '-';

  return (
    <div className="order-complete">
      <div className="order-complete-header">
        <div className="order-complete-icon">✓</div>
        <h1>주문이 완료되었습니다</h1>
        <p className="order-complete-sub">
          결제가 정상적으로 완료되었습니다.
          <br />
          주문해 주셔서 감사합니다.
        </p>
      </div>

      <div className="order-complete-card">
        <h2 className="order-complete-card-title">결제 정보</h2>
        <dl className="order-complete-dl">
          <div>
            <dt>주문번호</dt>
            <dd>{order.orderNo || '-'}</dd>
          </div>
          <div>
            <dt>결제일시</dt>
            <dd>{paidAt}</dd>
          </div>
          <div>
            <dt>결제수단</dt>
            <dd>{PAYMENT_LABELS[order.paymentMethod] || order.paymentMethod || '-'}</dd>
          </div>
          <div>
            <dt>결제금액</dt>
            <dd className="order-complete-amount">
              {(order.finalAmount ?? order.totalAmount ?? 0).toLocaleString()}원
            </dd>
          </div>
        </dl>
      </div>

      <div className="order-complete-card">
        <h2 className="order-complete-card-title">주문 상품</h2>
        <ul className="order-complete-product-list">
          {order.items?.map((item, idx) => (
            <li key={idx} className="order-complete-product-item">
              <Link
                to={item.product?._id ? `/products/${item.product._id}` : '#'}
                className="order-complete-product-thumb"
              >
                {item.product?.imageUrl ? (
                  <img src={item.product.imageUrl} alt={item.name} />
                ) : (
                  <span>이미지</span>
                )}
              </Link>
              <div className="order-complete-product-info">
                <Link
                  to={item.product?._id ? `/products/${item.product._id}` : '#'}
                  className="order-complete-product-name"
                >
                  {item.name}
                </Link>
                <span className="order-complete-product-meta">
                  {Number(item.price).toLocaleString()}원 × {item.quantity}
                </span>
              </div>
              <div className="order-complete-product-total">
                {(Number(item.price) * (item.quantity || 0)).toLocaleString()}원
              </div>
            </li>
          ))}
        </ul>
        {order.discountAmount > 0 && (
          <div className="order-complete-discount">
            <span>할인</span>
            <span>-{Number(order.discountAmount).toLocaleString()}원</span>
          </div>
        )}
        <div className="order-complete-total-row">
          <span>총 결제금액</span>
          <strong>{finalAmount.toLocaleString()}원</strong>
        </div>
      </div>

      <div className="order-complete-card">
        <h2 className="order-complete-card-title">배송/수령 정보</h2>
        <dl className="order-complete-dl">
          <div>
            <dt>수령인</dt>
            <dd>{order.buyerName || '-'}</dd>
          </div>
          <div>
            <dt>연락처</dt>
            <dd>{order.buyerContact || '-'}</dd>
          </div>
          <div>
            <dt>이메일</dt>
            <dd>{order.buyerEmail || '-'}</dd>
          </div>
          {order.buyerAddress && (
            <div>
              <dt>주소</dt>
              <dd>{order.buyerAddress}</dd>
            </div>
          )}
        </dl>
      </div>

      <div className="order-complete-actions">
        <Link to="/my/orders" className="order-complete-btn order-complete-btn-primary">
          주문내역 보기
        </Link>
        <Link to="/" className="order-complete-btn order-complete-btn-outline">
          홈으로
        </Link>
      </div>
    </div>
  );
}

export default CheckoutSuccessPage;
