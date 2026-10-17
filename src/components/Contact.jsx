import { primaryButton } from '../styles.js';

export default function Contact() {
  return (
    <section id="contact" className="scroll-mt-[14rem] py-(--section-spacing) md:scroll-mt-[7rem]" aria-labelledby="contact-heading">
        <h2 id="contact-heading">Contact / Book a Shoot</h2>
        <p className="max-w-[60ch]">Have a portrait session, a creative project, or a place in mind? Tell me a little about your idea.</p>
        <p id="form-note" className="max-w-[60ch] border-l-2 border-l-accent pl-s text-[0.875rem]">This form is a preview. Booking requests are not sent yet.</p>
        <form onSubmit={(event) => event.preventDefault()} className="mt-l flex w-full max-w-[40rem] flex-col gap-m" aria-describedby="form-note">
            <div className="flex min-w-0 flex-col gap-xs">
                <label className="font-medium" htmlFor="name">Name</label>
                <input className="w-full min-w-0 min-h-target border border-border rounded-none bg-background text-text-primary p-s leading-[1.5]" type="text" id="name" name="name" autoComplete="name" required />
            </div>
            <div className="flex min-w-0 flex-col gap-xs">
                <label className="font-medium" htmlFor="email">Email</label>
                <input className="w-full min-w-0 min-h-target border border-border rounded-none bg-background text-text-primary p-s leading-[1.5]" type="email" id="email" name="email" autoComplete="email" required />
            </div>
            <div className="flex min-w-0 flex-col gap-xs">
                <label className="font-medium" htmlFor="session">Photography / Session type</label>
                <select className="w-full min-w-0 min-h-target border border-border rounded-none bg-background text-text-primary p-s leading-[1.5]" id="session" name="session" required>
                    <option value="">Choose a session type</option>
                    <option value="portrait">Portrait</option>
                    <option value="lifestyle">Lifestyle</option>
                    <option value="travel">Travel</option>
                    <option value="architecture">Architecture</option>
                    <option value="other">Other</option>
                </select>
            </div>
            <div className="flex min-w-0 flex-col gap-xs">
                <label className="font-medium" htmlFor="month">Preferred month (optional)</label>
                <input className="w-full min-w-0 min-h-target border border-border rounded-none bg-background text-text-primary p-s leading-[1.5]" type="month" id="month" name="month" />
            </div>
            <div className="flex min-w-0 flex-col gap-xs">
                <label className="font-medium" htmlFor="message">Tell me about your project</label>
                <textarea className="w-full min-w-0 border border-border rounded-none bg-background text-text-primary p-s leading-[1.5] min-h-[10rem] resize-y" id="message" name="message" rows="5" required></textarea>
            </div>
            <button className={`${primaryButton} self-start`} type="submit" disabled>Send Inquiry</button>
        </form>
    </section>
  );
}
