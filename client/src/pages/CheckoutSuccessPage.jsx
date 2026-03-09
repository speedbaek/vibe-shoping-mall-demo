import { Link } from 'react-router-dom';
import './CheckoutSuccessPage.css';

function CheckoutSuccessPage() {
  return (
    <div className="checkout-success">
      <div className="checkout-success-icon">✓</div>
      <h1>주문이 완료되었습니다</h1>
      <p>주문해 주셔서 감사합니다.</p>
      <Link to="/" className="checkout-success-btn">
        홈으로
      </Link>
    </div>
  );
}

export default CheckoutSuccessPage;
