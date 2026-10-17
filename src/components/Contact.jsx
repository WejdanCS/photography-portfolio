export default function Contact() {
  return (
    <section id="contact" className="contact" aria-labelledby="contact-heading">
        <h2 id="contact-heading">Contact / Book a Shoot</h2>
        <p>Have a portrait session, a creative project, or a place in mind? Tell me a little about your idea.</p>
        <p id="form-note" className="contact-note">This form is a preview. Booking requests are not sent yet.</p>
        <form onSubmit={(event) => event.preventDefault()} className="contact-form" aria-describedby="form-note">
            <div className="form-field">
                <label htmlFor="name">Name</label>
                <input type="text" id="name" name="name" autoComplete="name" required />
            </div>
            <div className="form-field">
                <label htmlFor="email">Email</label>
                <input type="email" id="email" name="email" autoComplete="email" required />
            </div>
            <div className="form-field">
                <label htmlFor="session">Photography / Session type</label>
                <select id="session" name="session" required>
                    <option value="">Choose a session type</option>
                    <option value="portrait">Portrait</option>
                    <option value="lifestyle">Lifestyle</option>
                    <option value="travel">Travel</option>
                    <option value="architecture">Architecture</option>
                    <option value="other">Other</option>
                </select>
            </div>
            <div className="form-field">
                <label htmlFor="month">Preferred month (optional)</label>
                <input type="month" id="month" name="month" />
            </div>
            <div className="form-field">
                <label htmlFor="message">Tell me about your project</label>
                <textarea id="message" name="message" rows="5" required></textarea>
            </div>
            <button className="button button--primary" type="submit" disabled>Send Inquiry</button>
        </form>
    </section>
  );
}
