import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getOrder, updateOrder } from '../../utils/api';
import './AdminOrderDetailPage.css';

const STATUS_OPTIONS = [
  { value: 'pending', label: '결제대기' },
  { value: 'paid', label: '결제완료' },
  { value: 'preparing', label: '준비중' },
  { value: 'completed', label: '완료' },
  { value: 'cancelled', label: '취소' },
  { value: 'refunded', label: '환불' },
];

const PAYMENT_STATUS_OPTIONS = [
  { value: 'pending', label: '결제대기' },
  { value: 'paid', label: '결제완료' },
  { value: 'failed', label: '결제실패' },
  { value: 'refunded', label: '환불' },
];

const PAYMENT_LABELS = {
  card: '신용/체크카드',
  bank: '계좌이체',
  kakao: '카카오페이',
  naver: '네이버페이',
  toss: '토스페이',
  virtual: '가상계좌',
};

function AdminOrderDetailPage() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    status: 'pending',
    paymentStatus: 'pending',
    memo: '',
  });

  useEffect(() => {
    loadOrder();
  }, [orderId]);

  async function loadOrder() {
    if (!orderId) return;
    setLoading(true);
    setError('');
    try {
      const data = await getOrder(orderId);
      setOrder(data);
      setForm({
        status: data.status || 'pending',
        paymentStatus: data.paymentStatus || 'pending',
        memo: data.memo || '',
      });
    } catch (err) {
      setError(err.message || '주문 정보를 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await updateOrder(orderId, {
        status: form.status,
        paymentStatus: form.paymentStatus,
        memo: form.memo.trim() || undefined,
      });
      setOrder((prev) => ({ ...prev, ...form }));
      setSubmitting(false);
    } catch (err) {
      setError(err.message || '저장에 실패했습니다.');
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="admin-order-detail">
        <p className="admin-loading">로딩 중...</p>
      </div>
    );
  }

  if (error && !order) {
    return (
      <div className="admin-order-detail">
        <p className="admin-error">{error}</p>
        <Link to="/admin/orders" className="admin-btn admin-btn-outline">
          목록으로
        </Link>
      </div>
    );
  }

  const finalAmount = order?.finalAmount ?? order?.totalAmount ?? 0;

  return (
    <div className="admin-order-detail">
      <div className="admin-order-detail-header">
        <Link to="/admin/orders" className="admin-order-detail-back">
          ‹ 주문 목록
        </Link>
        <h1>주문 상세 · {order?.orderNo || '-'}</h1>
      </div>

      {error && <p className="admin-error">{error}</p>}

      <div className="admin-order-detail-grid">
        <section className="admin-order-detail-card">
          <h2>주문 정보</h2>
          <dl className="admin-order-dl">
            <div>
              <dt>주문번호</dt>
              <dd>{order?.orderNo || '-'}</dd>
            </div>
            <div>
              <dt>주문일시</dt>
              <dd>
                {order?.createdAt
                  ? new Date(order.createdAt).toLocaleString('ko-KR')
                  : '-'}
              </dd>
            </div>
            <div>
              <dt>결제수단</dt>
              <dd>{PAYMENT_LABELS[order?.paymentMethod] || order?.paymentMethod || '-'}</dd>
            </div>
            <div>
              <dt>상품금액</dt>
              <dd>{(order?.totalAmount ?? 0).toLocaleString()}원</dd>
            </div>
            {order?.discountAmount > 0 && (
              <div>
                <dt>할인</dt>
                <dd>-{(order?.discountAmount ?? 0).toLocaleString()}원</dd>
              </div>
            )}
            <div>
              <dt>결제금액</dt>
              <dd className="admin-order-amount">{finalAmount.toLocaleString()}원</dd>
            </div>
          </dl>
        </section>

        <section className="admin-order-detail-card">
          <h2>주문 상품</h2>
          <ul className="admin-order-items-list">
            {order?.items?.map((item, idx) => (
              <li key={idx} className="admin-order-item">
                {item.product?.imageUrl ? (
                  <img
                    src={item.product.imageUrl}
                    alt={item.name}
                    className="admin-order-item-img"
                  />
                ) : (
                  <span className="admin-order-item-placeholder">이미지 없음</span>
                )}
                <div className="admin-order-item-info">
                  <span className="admin-order-item-name">{item.name}</span>
                  <span className="admin-order-item-meta">
                    {Number(item.price).toLocaleString()}원 × {item.quantity}
                  </span>
                </div>
                <span className="admin-order-item-total">
                  {(Number(item.price) * (item.quantity || 0)).toLocaleString()}원
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className="admin-order-detail-card">
          <h2>주문자 정보</h2>
          <dl className="admin-order-dl">
            <div>
              <dt>이름</dt>
              <dd>{order?.buyerName || order?.user?.name || '-'}</dd>
            </div>
            <div>
              <dt>이메일</dt>
              <dd>{order?.buyerEmail || order?.user?.email || '-'}</dd>
            </div>
            <div>
              <dt>연락처</dt>
              <dd>{order?.buyerContact || '-'}</dd>
            </div>
            {order?.buyerAddress && (
              <div>
                <dt>주소</dt>
                <dd>{order.buyerAddress}</dd>
              </div>
            )}
          </dl>
        </section>

        <section className="admin-order-detail-card admin-order-status-card">
          <h2>상태 관리</h2>
          <form onSubmit={handleSubmit} className="admin-order-status-form">
            <div className="admin-order-form-group">
              <label>주문 상태</label>
              <select
                value={form.status}
                onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}
              >
                {STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="admin-order-form-group">
              <label>결제 상태</label>
              <select
                value={form.paymentStatus}
                onChange={(e) =>
                  setForm((p) => ({ ...p, paymentStatus: e.target.value }))
                }
              >
                {PAYMENT_STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="admin-order-form-group">
              <label>메모</label>
              <textarea
                value={form.memo}
                onChange={(e) => setForm((p) => ({ ...p, memo: e.target.value }))}
                rows={3}
                placeholder="관리자 메모 (선택)"
              />
            </div>
            <button
              type="submit"
              className="admin-btn admin-btn-primary"
              disabled={submitting}
            >
              {submitting ? '저장 중...' : '상태 저장'}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}

export default AdminOrderDetailPage;
