import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getProducts, getCategories } from '../utils/api';
import './HomePage.css';

function HomePage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    getProducts({ limit: 100 })
      .then((res) => setProducts(res?.products ?? []))
      .catch(() => setProducts([]));
    getCategories()
      .then(setCategories)
      .catch(() => setCategories([]));
  }, []);
  return (
    <div className="home-page">
      {/* Hero Banner */}
      <section className="hero">
        <div className="hero-banner" />
        <div className="hero-inner">
          <h1 className="hero-title">Vibe AI Academy</h1>
          <p className="hero-desc">AI 강의 · AI 컨설팅으로 비즈니스 성장을 이끌어 드립니다</p>
          <Link to="/" className="hero-cta">
            둘러보기
          </Link>
        </div>
      </section>

      {/* Categories */}
      <section className="section">
        <div className="section-inner">
          <h2 className="section-title">카테고리</h2>
          <div className="category-grid">
            {categories.length === 0 ? (
              <p className="category-empty">등록된 분류가 없습니다.</p>
            ) : (
              categories.map((cat) => (
                <Link key={cat.id} to="/" className="category-card">
                  <span className="category-icon">{cat.icon || '📦'}</span>
                  <span className="category-label">{cat.label}</span>
                </Link>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="section section-alt">
        <div className="section-inner">
          <h2 className="section-title">추천 강의 · 컨설팅</h2>
          <div className="product-grid">
            {products.length === 0 ? (
              <p className="product-empty">등록된 강의/서비스가 없습니다.</p>
            ) : (
              products.map((product) => (
                <Link key={product._id} to={`/products/${product._id}`} className="product-card">
                  <div className="product-image">
                    {product.imageUrl ? (
                      <img src={product.imageUrl} alt={product.name} />
                    ) : (
                      <span className="product-placeholder">상품 이미지</span>
                    )}
                  </div>
                  <div className="product-info">
                    <p className="product-name">{product.name}</p>
                    <p className="product-price">
                      {Number(product.price).toLocaleString()}원
                    </p>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-inner">
          <p className="footer-brand">Vibe AI Academy</p>
          <div className="footer-links">
            <Link to="/">이용약관</Link>
            <Link to="/">개인정보처리방침</Link>
          </div>
          <p className="footer-copy">© 2025 Vibe AI Academy</p>
        </div>
      </footer>
    </div>
  );
}

export default HomePage;
