interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 flex justify-center">
        <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-8">{children}</div>
      </main>
    </div>
  );
}
