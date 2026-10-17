import Header from './components/Header.jsx';
import Hero from './components/Hero.jsx';
import SelectedWork from './components/SelectedWork.jsx';
import About from './components/About.jsx';
import Contact from './components/Contact.jsx';
import Footer from './components/Footer.jsx';

export default function App() {
  return (
    <>
      <Header />
      <main className="container">
        <Hero />
        <SelectedWork />
        <About />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
