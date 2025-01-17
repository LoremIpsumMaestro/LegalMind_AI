import React from 'react';
import { useRouter } from 'next/router';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 w-full border-b bg-background">
        <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
          <div className="flex gap-6 md:gap-10">
            <h1 className="text-xl font-bold">LegalMind AI</h1>
          </div>
          <nav className="flex gap-6">
            {/* Add navigation items here */}
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <div className="container">
          {children}
        </div>
      </main>

      <footer className="border-t">
        <div className="container flex flex-col items-center justify-between gap-4 py-10 md:h-24 md:flex-row md:py-0">
          <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
            <p className="text-center text-sm leading-loose md:text-left">
              © 2024 LegalMind AI. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
