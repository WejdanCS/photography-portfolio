import { useId, useState } from 'react';
import { authClient } from '../lib/auth-client.js';
import { primaryButton, secondaryButton } from '../styles.js';

const fieldClass = 'block min-h-target w-full min-w-0 max-w-full border border-border bg-transparent px-s py-s text-base text-text-primary';

export default function Login() {
  const id = useId();
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: session, isPending, error: sessionError, refetch } = authClient.useSession();

  async function handleSubmit(event) {
    event.preventDefault();
    if (isSubmitting) return;
    setError('');
    setIsSubmitting(true);

    try {
      const result = isSignUp
        ? await authClient.signUp.email({ name: name.trim(), email: email.trim(), password })
        : await authClient.signIn.email({ email: email.trim(), password });

      if (result.error) {
        setError(result.error.message || 'Unable to continue. Please try again.');
      } else {
        setPassword('');
      }
    } catch {
      setError('Unable to connect. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSignOut() {
    setError('');
    setIsSubmitting(true);
    try {
      const result = await authClient.signOut();
      if (result.error) setError('Unable to sign out. Please try again.');
    } catch {
      setError('Unable to connect. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  function switchMode() {
    setIsSignUp((current) => !current);
    setPassword('');
    setError('');
  }

  return (
    <section className="mx-auto w-full min-w-0 max-w-auth py-(--section-spacing)" aria-labelledby={`${id}-heading`}>
      <p className="mb-s text-[0.875rem] uppercase tracking-label text-accent">Your account</p>
      <h2 id={`${id}-heading`}>
        {session ? `Welcome, ${session.user.name}` : isSignUp ? 'Create an account' : 'Welcome back'}
      </h2>
      {isPending ? (
        <p className="text-text-secondary" role="status">Checking your session…</p>
      ) : sessionError ? (
        <div className="border-y border-border py-m">
          <p role="alert">Unable to check your session. Please try again.</p>
          <button className={secondaryButton} type="button" onClick={() => refetch()}>Try again</button>
        </div>
      ) : session ? (
        <div className="border-y border-border py-m">
          <p className="text-text-secondary">You are signed in as {session.user.email}.</p>
          <button className={secondaryButton} type="button" disabled={isSubmitting} onClick={handleSignOut}>
            {isSubmitting ? 'Signing out…' : 'Sign out'}
          </button>
        </div>
      ) : (
        <>
          <p className="text-text-secondary">
            {isSignUp ? 'Join the photography collection.' : 'Sign in with your email and password.'}
          </p>
          <form className="mt-m border-t border-border pt-m" onSubmit={handleSubmit} aria-busy={isSubmitting}>
            <fieldset className="m-0 flex min-w-0 flex-col gap-m border-0 p-0" disabled={isSubmitting}>
              <legend className="sr-only">{isSignUp ? 'Create your account' : 'Sign in to your account'}</legend>
              {isSignUp && (
                <div>
                  <label className="mb-xs block" htmlFor={`${id}-name`}>Name</label>
                  <input className={fieldClass} id={`${id}-name`} name="name" autoComplete="name" required maxLength={100} pattern=".*\S.*" value={name} onChange={(event) => setName(event.target.value)} />
                </div>
              )}
              <div>
                <label className="mb-xs block" htmlFor={`${id}-email`}>Email</label>
                <input className={fieldClass} id={`${id}-email`} name="email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} />
              </div>
              <div>
                <label className="mb-xs block" htmlFor={`${id}-password`}>Password</label>
                <input className={fieldClass} id={`${id}-password`} name="password" type="password" autoComplete={isSignUp ? 'new-password' : 'current-password'} required minLength={8} maxLength={128} aria-describedby={isSignUp ? `${id}-password-help` : undefined} value={password} onChange={(event) => setPassword(event.target.value)} />
                {isSignUp && <p className="mb-0 mt-xs text-[0.875rem] text-text-secondary" id={`${id}-password-help`}>Use 8–128 characters.</p>}
              </div>
              <button className={`${primaryButton} w-full`} type="submit">
                {isSubmitting ? 'Please wait…' : isSignUp ? 'Create account' : 'Sign in'}
              </button>
            </fieldset>
          </form>
          <div className="mt-m flex flex-wrap items-center gap-xs text-text-secondary">
            <span>{isSignUp ? 'Already have an account?' : 'New here?'}</span>
            <button className="min-h-target cursor-pointer bg-transparent py-xs text-text-primary underline decoration-accent underline-offset-4 disabled:cursor-not-allowed" type="button" disabled={isSubmitting} onClick={switchMode}>
              {isSignUp ? 'Sign in' : 'Create an account'}
            </button>
          </div>
        </>
      )}
      {error && <p className="mt-m border-l-2 border-accent pl-s text-text-primary" role="alert">{error}</p>}
    </section>
  );
}
