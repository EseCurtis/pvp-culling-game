import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-black/40 px-4 py-8 mt-32">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-white">
              The Culling Game
            </h3>
            <p className="mt-2 text-xs text-white/60">
              AI-powered Jujutsu Kaisen battle simulator. Create your sorcerer,
              engage in epic battles, and climb the leaderboard.
            </p>
          </div>
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.3em] text-white/80">
              Quick Links
            </h4>
            <nav className="mt-3 space-y-2">
              <Link
                href="/leaderboard"
                className="block text-xs text-white/60 transition hover:text-white"
              >
                Leaderboard
              </Link>
              <Link
                href="/dashboard"
                className="block text-xs text-white/60 transition hover:text-white"
              >
                Dashboard
              </Link>
            </nav>
          </div>
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.3em] text-white/80">
              Creator
            </h4>
            <nav className="mt-3 space-y-2">
              <a
                href="https://esecurtis.cv"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-xs text-white/60 transition hover:text-white"
              >
                Portfolio
              </a>
              <a
                href="https://github.com/esecurtis"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-xs text-white/60 transition hover:text-white"
              >
                GitHub
              </a>
              <a
                href="https://twitter.com/curtisese"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-xs text-white/60 transition hover:text-white"
              >
                Twitter
              </a>
            </nav>
          </div>
        </div>
        <div className="mt-8 border-t border-white/10 pt-6 text-center text-xs text-white/40">
          <p>
            © {new Date().getFullYear()} The Culling Game. Created by{" "}
            <a
              href="https://esecurtis.cv"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/60 hover:text-white transition"
            >
              Ese Curtis
            </a>
            . All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

