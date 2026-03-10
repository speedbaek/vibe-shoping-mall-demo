import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { createOrder, getImageUrl } from '../utils/api';
import './CheckoutPage.css';

const PORTONE_STORE_ID = 'imp67137525';
const IAMPORT_SCRIPT_URL = 'https://cdn.iamport.kr/v1/iamport.js';
// pg: 포트원 콘솔에서 설정한 PG 채널. 예: html5_inicis.INIpayTest(테스트), html5_inicis.{실제MID}
const PORTONE_PG =
  import.meta.env.VITE_PORTONE_PG || 'html5_inicis.INIpayTest';

const PAYMENT_METHODS = [
  { value: 'card', label: '신용/체크카드', icon: '💳', payMethod: 'card' },
  { value: 'bank', label: '계좌이체', icon: '🏦', payMethod: 'trans' },
  { value: 'kakao', label: '카카오페이', icon: '🟡', payMethod: 'kakaopay' },
  { value: 'naver', label: '네이버페이', icon: '🟢', payMethod: 'naverpay' },
  { value: 'toss', label: '토스페이', icon: '🔵', payMethod: 'tosspay' },
  { value: 'virtual', label: '가상계좌', icon: '📋', payMethod: 'vbank' },
];

function generateMerchantUid() {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  const timeStr = now.getTime().toString(36).toUpperCase();
  const random = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `ORD_${dateStr}_${timeStr}_${random}`;
}

function CheckoutPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { cart, loading, refreshCart } = useCart();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [paymentReady, setPaymentReady] = useState(false);
  const [form, setForm] = useState({
    buyerName: user?.name ?? '',
    buyerEmail: user?.email ?? '',
    buyerContact: user?.contact ?? '',
    buyerAddress: user?.address ?? '',
    paymentMethod: 'card',
    memo: '',
    couponCode: '',
    discountAmount: 0,
  });

  const selectedProductIds = location.state?.selectedProductIds;

  useEffect(() => {
    if (user) {
      setForm((prev) => ({
        ...prev,
        buyerName: prev.buyerName || user.name || '',
        buyerEmail: prev.buyerEmail || user.email || '',
        buyerContact: prev.buyerContact || user.contact || '',
        buyerAddress: prev.buyerAddress || user.address || '',
      }));
    }
  }, [user]);

  useEffect(() => {
    const initPortOne = () => {
      if (typeof window !== 'undefined' && window.IMP) {
        window.IMP.init(PORTONE_STORE_ID);
        setPaymentReady(true);
        return true;
      }
      return false;
    };

    const existingScript = document.querySelector('script[src*="iamport"]');
    if (existingScript) {
      if (window.IMP) {
        initPortOne();
        return;
      }
      existingScript.addEventListener('load', initPortOne);
      return () => existingScript.removeEventListener('load', initPortOne);
    }

    const script = document.createElement('script');
    script.src = IAMPORT_SCRIPT_URL;
    script.async = true;
    script.onload = initPortOne;
    document.body.appendChild(script);
  }, []);

  const updateForm = (key, value) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  if (!user) {
    return (
      <div className="checkout-page">
        <div className="checkout-empty">
          <div className="checkout-empty-icon">🔒</div>
          <p>로그인 후 주문할 수 있습니다.</p>
          <Link to="/login" className="checkout-btn checkout-btn-primary">
            로그인하기
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="checkout-page">
        <div className="checkout-loading">
          <div className="checkout-loading-spinner" />
          <p>로딩 중...</p>
        </div>
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
          <div className="checkout-empty-icon">🛒</div>
          <p>결제할 상품을 선택해 주세요.</p>
          <Link to="/cart" className="checkout-btn checkout-btn-primary">
            장바구니로 가기
          </Link>
        </div>
      </div>
    );
  }

  function handlePayment() {
    if (!form.buyerName?.trim() || !form.buyerEmail?.trim() || !form.buyerContact?.trim()) {
      setError('이름, 이메일, 연락처를 모두 입력해 주세요.');
      return;
    }
    if (!paymentReady || typeof window === 'undefined' || !window.IMP) {
      setError('결제 모듈을 불러오는 중입니다. 잠시 후 다시 시도해 주세요.');
      return;
    }

    setError('');
    setSubmitting(true);

    const discountAmount = Number(form.discountAmount) || 0;
    const finalAmount = Math.max(0, totalAmount - discountAmount);
    const merchantUid = generateMerchantUid();
    const selectedPayMethod = PAYMENT_METHODS.find((m) => m.value === form.paymentMethod);
    const payMethod = selectedPayMethod?.payMethod ?? 'card';

    const orderName = items.length === 1
      ? items[0].product?.name ?? '주문'
      : `${items[0]?.product?.name ?? '상품'} 외 ${items.length - 1}건`;

    window.IMP.request_pay(
      {
        pg: PORTONE_PG,
        pay_method: payMethod,
        merchant_uid: merchantUid,
        name: orderName,
        amount: finalAmount,
        buyer_email: form.buyerEmail.trim(),
        buyer_name: form.buyerName.trim(),
        buyer_tel: form.buyerContact.trim(),
        buyer_addr: form.buyerAddress?.trim() || undefined,
        m_redirect_url: `${window.location.origin}/checkout/success`,
        notice_url: undefined,
      },
      async (rsp) => {
        try {
          if (rsp.success) {
            const order = await createOrder({
              productIds: selectedProductIds,
              paymentMethod: form.paymentMethod,
              buyerName: form.buyerName.trim(),
              buyerEmail: form.buyerEmail.trim(),
              buyerContact: form.buyerContact.trim(),
              buyerAddress: form.buyerAddress?.trim() || undefined,
              memo: form.memo?.trim() || undefined,
              couponCode: form.couponCode?.trim() || undefined,
              discountAmount,
              pgProvider: 'portone',
              pgOrderId: rsp.merchant_uid,
              pgTransactionId: rsp.imp_uid,
            });
            await refreshCart();
            navigate(`/checkout/success/${order._id}`, {
              replace: true,
            });
          } else {
            if (rsp.error_msg) {
              setError(rsp.error_msg);
            } else if (rsp.error_code) {
              setError(`결제 실패 (${rsp.error_code})`);
            } else {
              setError('결제가 취소되었습니다.');
            }
          }
        } catch (err) {
          setError(err.message || '주문 처리에 실패했습니다.');
        } finally {
          setSubmitting(false);
        }
      }
    );
  }

  const discountAmount = Number(form.discountAmount) || 0;
  const finalAmount = Math.max(0, totalAmount - discountAmount);

  return (
    <div className="checkout-page">
      <div className="checkout-header">
        <h1>주문/결제</h1>
        <nav className="checkout-breadcrumb">
          <Link to="/cart">장바구니</Link>
          <span className="checkout-breadcrumb-sep">›</span>
          <span className="checkout-breadcrumb-current">주문결제</span>
        </nav>
      </div>

      <div className="checkout-body">
        <div className="checkout-main">
          {/* 주문 상품 */}
          <section className="checkout-block checkout-products">
            <h2 className="checkout-block-title">주문 상품</h2>
            <ul className="checkout-product-list">
              {items.map((item) => {
                const p = item.product;
                if (!p) return null;
                const price = Number(p.price) * (item.quantity || 0);
                return (
                  <li key={p._id} className="checkout-product-item">
                    <Link to={`/products/${p._id}`} className="checkout-product-thumb">
                      {p.imageUrl ? (
                        <img src={getImageUrl(p.imageUrl)} alt={p.name} />
                      ) : (
                        <span className="checkout-product-placeholder">이미지</span>
                      )}
                    </Link>
                    <div className="checkout-product-info">
                      <Link to={`/products/${p._id}`} className="checkout-product-name">
                        {p.name}
                      </Link>
                      <span className="checkout-product-meta">
                        {Number(p.price).toLocaleString()}원 × {item.quantity}
                      </span>
                    </div>
                    <div className="checkout-product-total">
                      {price.toLocaleString()}원
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>

          {/* 주문자 정보 */}
          <section className="checkout-block">
            <h2 className="checkout-block-title">주문자 정보</h2>
            <div className="checkout-form-grid">
              <label className="checkout-field">
                <span className="checkout-field-label">이름 <em>*</em></span>
                <input
                  type="text"
                  value={form.buyerName}
                  onChange={(e) => updateForm('buyerName', e.target.value)}
                  placeholder="이름을 입력하세요"
                />
              </label>
              <label className="checkout-field">
                <span className="checkout-field-label">이메일 <em>*</em></span>
                <input
                  type="email"
                  value={form.buyerEmail}
                  onChange={(e) => updateForm('buyerEmail', e.target.value)}
                  placeholder="example@email.com"
                />
              </label>
              <label className="checkout-field">
                <span className="checkout-field-label">연락처 <em>*</em></span>
                <input
                  type="tel"
                  value={form.buyerContact}
                  onChange={(e) => updateForm('buyerContact', e.target.value)}
                  placeholder="010-0000-0000"
                />
              </label>
              <label className="checkout-field checkout-field-full">
                <span className="checkout-field-label">주소</span>
                <input
                  type="text"
                  value={form.buyerAddress}
                  onChange={(e) => updateForm('buyerAddress', e.target.value)}
                  placeholder="선택 입력"
                />
              </label>
            </div>
          </section>

          {/* 결제 수단 */}
          <section className="checkout-block">
            <h2 className="checkout-block-title">결제 수단</h2>
            <div className="checkout-payment-grid">
              {PAYMENT_METHODS.map((m) => (
                <label
                  key={m.value}
                  className={`checkout-payment-option ${form.paymentMethod === m.value ? 'is-selected' : ''}`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={m.value}
                    checked={form.paymentMethod === m.value}
                    onChange={() => updateForm('paymentMethod', m.value)}
                  />
                  <span className="checkout-payment-icon">{m.icon}</span>
                  <span className="checkout-payment-label">{m.label}</span>
                </label>
              ))}
            </div>
          </section>

          {/* 주문 메모 */}
          <section className="checkout-block">
            <h2 className="checkout-block-title">주문 메모</h2>
            <input
              type="text"
              className="checkout-memo-input"
              value={form.memo}
              onChange={(e) => updateForm('memo', e.target.value)}
              placeholder="배송 시 요청사항이나 문의사항을 입력하세요 (선택)"
            />
          </section>
        </div>

        {/* 주문 요약 (사이드바) */}
        <aside className="checkout-sidebar">
          <div className="checkout-summary-card">
            <h3>결제 금액</h3>
            <dl className="checkout-summary-list">
              <div>
                <dt>상품 금액</dt>
                <dd>{totalAmount.toLocaleString()}원</dd>
              </div>
              {discountAmount > 0 && (
                <div className="checkout-summary-discount">
                  <dt>할인</dt>
                  <dd>-{discountAmount.toLocaleString()}원</dd>
                </div>
              )}
            </dl>
            <div className="checkout-summary-total">
              <span>총 결제금액</span>
              <strong>{finalAmount.toLocaleString()}원</strong>
            </div>
            {error && <p className="checkout-summary-error">{error}</p>}
            <button
              type="button"
              className="checkout-submit-btn"
              disabled={submitting || !paymentReady}
              onClick={handlePayment}
            >
              {!paymentReady
                ? '결제 모듈 로딩 중...'
                : submitting
                  ? '처리 중...'
                  : `${finalAmount.toLocaleString()}원 결제하기`}
            </button>
            <Link to="/cart" className="checkout-back-link">‹ 장바구니로 돌아가기</Link>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default CheckoutPage;
