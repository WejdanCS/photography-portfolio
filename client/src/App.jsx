import { useEffect } from 'react';
import { pageContainer } from './styles.js';
import Header from './components/Header.jsx';
import Hero from './components/Hero.jsx';
import SelectedWork from './components/SelectedWork.jsx';
import About from './components/About.jsx';
import Contact from './components/Contact.jsx';
import Footer from './components/Footer.jsx';
import { BrowserRouter, Navigate, Route, Routes, useLocation, useSearchParams } from 'react-router';
import Login from './components/Login.jsx';
import CheckoutSuccess from './components/CheckoutSuccess.jsx';
import OrdersDashboard from './components/OrdersDashboard.jsx';
import AdminOrders from './components/AdminOrders.jsx';
import { authClient } from './lib/auth-client.js';
import { resolveAuthReturnTo } from './lib/auth-redirect.js';

function ScrollToHash() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    let frameId;
    const timeoutIds = [];

    function scrollToTarget() {
      const currentHash = window.location.hash;
      if (!currentHash) return;

      const targetId = decodeURIComponent(currentHash.slice(1));
      const target = document.getElementById(targetId);

      if (target) {
        target.scrollIntoView({ block: 'start' });
      }
    }

    function scheduleScroll() {
      frameId = window.requestAnimationFrame(scrollToTarget);
      timeoutIds.push(window.setTimeout(scrollToTarget, 100));
      timeoutIds.push(window.setTimeout(scrollToTarget, 500));
    }

    scheduleScroll();
    window.addEventListener('hashchange', scheduleScroll);

    return () => {
      window.removeEventListener('hashchange', scheduleScroll);
      window.cancelAnimationFrame(frameId);
      timeoutIds.forEach((timeoutId) => window.clearTimeout(timeoutId));
    };
  }, [pathname, hash]);

  return null;
}

function LoginPage() {
  const { data: session } = authClient.useSession();
  const [searchParams] = useSearchParams();
  const requestedReturn = searchParams.get('returnTo');
  const returnTo = resolveAuthReturnTo(requestedReturn, session?.user.role);

  return session ? <Navigate to={returnTo} replace /> : <Login />;
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToHash />
      <Header />
      <main className={pageContainer}>
        <Routes>
          <Route path="/" element={
            <>
              <Hero />
              <SelectedWork />
              <About />
              <Contact />
            </>
          } />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/checkout/success" element={<CheckoutSuccess />} />
          <Route path="/dashboard/orders" element={<OrdersDashboard />} />
          <Route path="/admin/orders" element={<AdminOrders />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </BrowserRouter>
  );
}
