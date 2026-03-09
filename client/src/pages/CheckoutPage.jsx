import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { createOrder } from '../utils/api';
import './CheckoutPage.css';

function CheckoutPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { cart, loading, refreshCart } = useCart();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const selectedProductIds = location.state?.selectedProductIds;

  if (!user) {
    return (
      <div className="checkout-page">
        <div className="checkout-empty">
          <p>로그인 후 결제할 수 있습니다.</p>
          <Link to="/login" className="checkout-btn checkout-btn-primary">
            로그인
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="checkout-page">
        <div className="checkout-loading">로딩 중...</div>
      </div>
    );
  }

  const allItems = cart?.items ?? [];
  const items =
    Array.isArray(selectedProductIds) && selectedProductIds.length > 0
      ? allItems.filter(
          (i) => i.product && selectedProductIds.includes(i.product._id)
        )
      : allItems;
  const totalAmount = items.reduce(
    (sum, i) => sum + (i.product?.price ?? 0) * (i.quantity ?? 0),
    0
  );

  if (items.length === 0) {
    return (
      <div className="checkout-page">
        <div className="checkout-empty">
          <p>결제할 상품을 선택해 주세요.</p>
          <Link to="/cart" className="checkout-btn checkout-btn-primary">
            장바구니로 가기
          </Link>
        </div>
      </div>
    );
  }

  async function handlePayment() {
    setError('');
    setSubmitting(true);
    try {
      await createOrder(selectedProductIds);
      await refreshCart();
      navigate('/checkout/success');
    } catch (err) {
      setError(err.message || '결제에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="checkout-page">
      <h1 className="checkout-title">결제</h1>
      <div className="checkout-content">
        <div className="checkout-summary">
          <h2>주문 상품</h2>
          <ul className="checkout-list">
            {items.map((item) => {
              const p = item.product;
              if (!p) return null;
              return (
                <li key={p._id} className="checkout-item">
                  <span className="checkout-item-name">{p.name}</span>
                  <span className="checkout-item-qty">× {item.quantity}</span>
                  <span className="checkout-item-price">
                    {(Number(p.price) * (item.quantity || 0)).toLocaleString()}원
                  </span>
                </li>
              );
            })}
          </ul>
          <div className="checkout-total">
            <span>총 결제금액</span>
            <strong>{totalAmount.toLocaleString()}원</strong>
          </div>
        </div>
        <div className="checkout-actions">
          {error && <p className="checkout-error">{error}</p>}
          <button
            type="button"
            className="checkout-btn checkout-btn-primary"
            disabled={submitting}
            onClick={handlePayment}
          >
            {submitting ? '처리 중...' : '결제하기'}
          </button>
          <Link to="/cart" className="checkout-btn checkout-btn-outline">
            장바구니로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  );
}

export default CheckoutPage;
