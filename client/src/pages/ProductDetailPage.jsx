import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getProduct } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import './ProductDetailPage.css';

function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cartLoading, setCartLoading] = useState(false);
  const [cartError, setCartError] = useState('');

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError('');
    getProduct(id)
      .then(setProduct)
      .catch((err) => setError(err.message || '상품을 불러오지 못했습니다.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="product-detail">
        <div className="product-detail-loading">로딩 중...</div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="product-detail">
        <div className="product-detail-error">
          <p>{error || '상품을 찾을 수 없습니다.'}</p>
          <Link to="/" className="product-detail-back">
            홈으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="product-detail">
      <Link to="/" className="product-detail-breadcrumb">
        ← 상품 목록
      </Link>

      <article className="product-detail-card">
        <div className="product-detail-image-wrap">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="product-detail-image"
            />
          ) : (
            <div className="product-detail-placeholder">
              <span>이미지 없음</span>
            </div>
          )}
        </div>

        <div className="product-detail-info">
          {product.category && (
            <span className="product-detail-category">{product.category}</span>
          )}
          <h1 className="product-detail-name">{product.name}</h1>
          <p className="product-detail-price">
            {Number(product.price).toLocaleString()}원
          </p>

          <div className="product-detail-desc">
            <h3 className="product-detail-desc-title">상품 상세</h3>
            <p>
              {product.description || (
                <>
                  심플한 디자인과 고급스러운 소재가 만나 일상과 특별한 순간 모두를 아우릅니다.
                  <br /><br />
                  · 고급 원단 사용으로 오래도록 착용 가능
                  · 세탁 시에도 형태 유지
                  · 다양한 스타일링에 활용 가능
                  <br /><br />
                  자세한 안내는 구매 전 상품 페이지를 참고해 주세요.
                </>
              )}
            </p>
          </div>

          <dl className="product-detail-meta">
            {product.sku && (
              <>
                <dt>SKU</dt>
                <dd>{product.sku}</dd>
              </>
            )}
            <dt>재고</dt>
            <dd>{product.stock ?? 0}개</dd>
          </dl>

          <div className="product-detail-actions">
            {!user ? (
              <Link to="/login" className="product-detail-cart-btn">
                로그인 후 장바구니 담기
              </Link>
            ) : (
              <>
                {cartError && (
                  <p className="product-detail-cart-error">{cartError}</p>
                )}
                <button
                  type="button"
                  className="product-detail-cart-btn"
                  disabled={cartLoading}
                  onClick={async () => {
                    setCartError('');
                    setCartLoading(true);
                    try {
                      await addToCart(id, 1);
                      navigate('/cart');
                    } catch (err) {
                      setCartError(err.message || '장바구니 담기에 실패했습니다.');
                    } finally {
                      setCartLoading(false);
                    }
                  }}
                >
                  {cartLoading ? '담는 중...' : '장바구니 담기'}
                </button>
              </>
            )}
          </div>
        </div>
      </article>

      {/* 하단 상품 상세 섹션 */}
      <section className="product-detail-bottom">
        <h2 className="product-detail-bottom-title">상품 상세 설명</h2>
        <div className="product-detail-bottom-content">
          <div className="product-detail-bottom-block">
            <h3>상품 설명</h3>
            <p>{product.description || '심플한 디자인과 고급스러운 소재가 만나 일상과 특별한 순간 모두를 아우릅니다.'}</p>
          </div>
          <div className="product-detail-bottom-block">
            <h3>제품 정보</h3>
            <ul>
              <li>· 고급 원단 사용으로 오래도록 착용 가능합니다.</li>
              <li>· 세탁 시에도 형태가 잘 유지됩니다.</li>
              <li>· 다양한 스타일링에 활용 가능합니다.</li>
            </ul>
          </div>
          <div className="product-detail-bottom-block">
            <h3>배송 및 반품 안내</h3>
            <p>
              주문 후 1~3일 이내 배송됩니다. (주말/공휴일 제외)
              <br />
              상품 하자 시 7일 이내 무료 반품 가능합니다.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default ProductDetailPage;
