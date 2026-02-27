import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8">
      <div className="glass-card w-full max-w-lg rounded-2xl p-8 text-center">
        <h1 className="font-display text-4xl font-semibold">404</h1>
        <p className="mt-2 muted">Page not found.</p>
        <Link
          className="mt-6 inline-flex rounded-full bg-sky-500 px-5 py-2.5 font-semibold text-white transition hover:bg-sky-600"
          to="/"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
