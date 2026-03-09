import { Outlet } from 'react-router-dom';
import Navbar from '../Navbar';

function Layout() {
  return (
    <div className="layout">
      <Navbar />
      <main className="layout-main">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
