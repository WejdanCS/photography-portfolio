export default function About() {
  return (
    <section id="about" className="scroll-mt-[14rem] grid grid-cols-[1fr] items-center gap-m py-(--section-spacing) md:scroll-mt-[7rem] md:grid-cols-[1fr_1fr] md:gap-l" aria-labelledby="about-heading">
        <img className="w-full min-w-0 h-auto aspect-landscape object-cover" src="https://images.unsplash.com/photo-1452587925148-ce544e77e70d?auto=format&amp;fit=crop&amp;w=600&amp;h=400&amp;q=85" alt="A camera held ready to capture a photograph" width="600" height="400" loading="lazy" />
        <div className="min-w-0 max-w-[48ch]">
            <h2 id="about-heading">About</h2>
            <p>I'm Alex, a photographer drawn to natural light and the stories in ordinary moments. My approach is relaxed and thoughtful, making room for people and places to feel like themselves.</p>
            <a className="inline-block py-xs decoration-accent underline-offset-[0.3em] hover:decoration-2" href="#contact">Let's create something together</a>
        </div>
    </section>
  );
}
