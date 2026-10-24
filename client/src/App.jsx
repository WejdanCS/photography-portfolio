import { pageContainer } from './styles.js';
import Header from './components/Header.jsx';
import Hero from './components/Hero.jsx';
import SelectedWork from './components/SelectedWork.jsx';
import About from './components/About.jsx';
import Contact from './components/Contact.jsx';
import Footer from './components/Footer.jsx';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router';
import Login from './components/Login.jsx';
import { authClient } from './lib/auth-client.js';

function LoginPage() {
  const { data: session } = authClient.useSession();
  return session ? <Navigate to="/" replace /> : <Login />;
}

export default function App() {
  return (
    <BrowserRouter>
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
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </BrowserRouter>
  );
}
