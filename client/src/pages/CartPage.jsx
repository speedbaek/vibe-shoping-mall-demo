import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import './CartPage.css';

function CartPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cart, loading, updateQuantity, removeFromCart } = useCart();
  const [selectedIds, setSelectedIds] = useState(new Set());

  useEffect(() => {
    const items = cart?.items ?? [];
    const ids = items.filter((i) => i.product).map((i) => i.product._id);
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.forEach((id) => {
        if (!ids.includes(id)) next.delete(id);
      });
      if (next.size === 0 && ids.length > 0) ids.forEach((id) => next.add(id));
      return next;
    });
  }, [cart?.items]);

  if (!user) {
    return (
      <div className="cart-page">
        <div className="cart-empty-state">
          <p>장바구니를 이용하려면 로그인해 주세요.</p>
          <Link to="/login" className="cart-btn cart-btn-primary">
            로그인
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="cart-page">
        <div className="cart-loading">로딩 중...</div>
      </div>
    );
  }

  const items = cart?.items ?? [];
  const selectedItems = items.filter(
    (i) => i.product && selectedIds.has(i.product._id)
  );
  const totalAmount = selectedItems.reduce(
    (sum, i) => sum + (i.product?.price ?? 0) * (i.quantity ?? 0),
    0
  );
  const allSelected =
    items.length > 0 && selectedIds.size === items.filter((i) => i.product).length;

  const toggleSelect = (productId) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(productId)) next.delete(productId);
      else next.add(productId);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(
        new Set(items.filter((i) => i.product).map((i) => i.product._id))
      );
    }
  };

  const goToCheckout = () => {
    if (selectedItems.length === 0) return;
    navigate('/checkout', {
      state: { selectedProductIds: Array.from(selectedIds) },
    });
  };

  if (items.length === 0) {
    return (
      <div className="cart-page">
        <h1 className="cart-title">장바구니</h1>
        <div className="cart-empty-state">
          <p>장바구니가 비어 있습니다.</p>
          <Link to="/" className="cart-btn cart-btn-primary">
            쇼핑 계속하기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <h1 className="cart-title">장바구니</h1>
      <div className="cart-content">
        <div className="cart-list">
          {items.length > 1 && (
            <div className="cart-select-all">
              <label className="cart-checkbox-label">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleSelectAll}
                />
                <span>전체 선택</span>
              </label>
            </div>
          )}
          {items.map((item) => {
            const p = item.product;
            if (!p) return null;
            const price = Number(p.price) * (item.quantity || 0);
            const isSelected = selectedIds.has(p._id);
            return (
              <div key={item.product._id} className={`cart-item ${!isSelected ? 'cart-item-unselected' : ''}`}>
                <label className="cart-item-check">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleSelect(p._id)}
                  />
                </label>
                <Link to={`/products/${p._id}`} className="cart-item-image">
                  {p.imageUrl ? (
                    <img src={p.imageUrl} alt={p.name} />
                  ) : (
                    <span>이미지 없음</span>
                  )}
                </Link>
                <div className="cart-item-info">
                  <Link to={`/products/${p._id}`} className="cart-item-name">
                    {p.name}
                  </Link>
                  <p className="cart-item-price">
                    {Number(p.price).toLocaleString()}원
                  </p>
                  <div className="cart-item-actions">
                    <select
                      value={item.quantity}
                      onChange={(e) =>
                        updateQuantity(p._id, Number(e.target.value))
                      }
                    >
                      {Array.from(
                        {
                          length: Math.min(
                            20,
                            (p.stock != null && p.stock > 0 ? p.stock : 20)
                          ),
                        },
                        (_, i) => i + 1
                      ).map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      className="cart-item-remove"
                      onClick={() => removeFromCart(p._id)}
                    >
                      삭제
                    </button>
                  </div>
                </div>
                <p className="cart-item-total">
                  {price.toLocaleString()}원
                </p>
              </div>
            );
          })}
        </div>
        <div className="cart-summary">
          {items.length > 1 && (
            <p className="cart-summary-selected">
              선택 상품 {selectedItems.length}개
            </p>
          )}
          <div className="cart-summary-row">
            <span>총 결제금액</span>
            <strong>{totalAmount.toLocaleString()}원</strong>
          </div>
          <button
            type="button"
            className="cart-btn cart-btn-primary cart-btn-checkout"
            disabled={selectedItems.length === 0}
            onClick={goToCheckout}
          >
            결제하기
          </button>
        </div>
      </div>
    </div>
  );
}

export default CartPage;
