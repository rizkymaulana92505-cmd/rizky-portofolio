import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('Application render error', error, info);
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <main className="flex min-h-screen items-center justify-center bg-paper px-gutter py-16 text-ink">
        <div role="alert" className="w-full max-w-md border border-ink p-8">
          <p className="label">Galat aplikasi</p>
          <h1 className="mt-3 font-display text-2xl font-extrabold uppercase tracking-tight">
            Halaman tidak dapat ditampilkan
          </h1>
          <p className="mt-4 text-small text-ink-soft">
            Terjadi kesalahan saat menyiapkan halaman. Coba muat ulang; jika masih berlanjut, hubungi pemilik situs.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-7 inline-flex h-11 items-center border border-ink bg-ink px-5 font-mono text-[11px] uppercase tracking-[0.12em] text-paper transition-colors hover:bg-ink-soft"
          >
            Muat ulang
          </button>
        </div>
      </main>
    );
  }
}
