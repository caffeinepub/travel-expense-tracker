import { Outlet, Link, useNavigate } from '@tanstack/react-router';
import { Plane, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Layout() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-amber-50 via-stone-50 to-emerald-50 dark:from-stone-900 dark:via-stone-800 dark:to-emerald-950">
      <header className="sticky top-0 z-50 w-full border-b border-stone-200/80 bg-white/80 backdrop-blur-md dark:border-stone-800/80 dark:bg-stone-900/80">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="rounded-lg bg-gradient-to-br from-emerald-600 to-teal-700 p-2 shadow-md transition-transform group-hover:scale-105">
              <Plane className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-emerald-700 to-teal-700 bg-clip-text text-transparent dark:from-emerald-400 dark:to-teal-400">
              Travel Expense Tracker
            </span>
          </Link>
          <nav className="flex items-center gap-2">
            <Button
              variant="ghost"
              onClick={() => navigate({ to: '/trips' })}
              className="text-stone-700 hover:text-emerald-700 dark:text-stone-300 dark:hover:text-emerald-400"
            >
              My Trips
            </Button>
          </nav>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8">
        <Outlet />
      </main>

      <footer className="border-t border-stone-200 bg-white/50 backdrop-blur-sm dark:border-stone-800 dark:bg-stone-900/50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col items-center justify-center gap-2 text-sm text-stone-600 dark:text-stone-400">
            <p className="flex items-center gap-1">
              Built with <Heart className="h-4 w-4 text-rose-500 fill-rose-500" /> using{' '}
              <a
                href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
                  typeof window !== 'undefined' ? window.location.hostname : 'travel-expense-tracker'
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-emerald-700 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300"
              >
                caffeine.ai
              </a>
            </p>
            <p className="text-xs">© {new Date().getFullYear()} Travel Expense Tracker. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
