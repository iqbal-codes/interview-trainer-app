import React from 'react';
import { Toaster } from '@/components/ui/sonner';
import Link from 'next/link';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 w-full border-b bg-background">
        <div className="container flex h-16 items-center">
          <div className="mr-4 hidden md:flex">
            <Link href="/" className="mr-6 flex items-center space-x-2">
              <span className="font-bold">Interview Trainer</span>
            </Link>
            <nav className="flex items-center space-x-6 text-sm font-medium">
              <Link href="/dashboard" className="transition-colors hover:text-foreground/80">
                Dashboard
              </Link>
              <Link href="/interview/new" className="transition-colors hover:text-foreground/80">
                New Interview
              </Link>
            </nav>
          </div>
          <div className="flex flex-1 items-center justify-end space-x-4">
            <nav className="flex items-center">
              <Link href="/auth/login" className="text-sm font-medium transition-colors hover:text-foreground/80">
                Login
              </Link>
            </nav>
          </div>
        </div>
      </header>
      <main className="container py-6">
        {children}
      </main>
      <footer className="border-t">
        <div className="container flex h-16 items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Interview Trainer App. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
      <Toaster />
    </div>
  );
} 