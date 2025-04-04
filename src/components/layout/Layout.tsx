
import { Header } from "./Header";
import { Navbar } from "./Navbar";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <Navbar />
      <main className="flex-1 bg-gray-50">
        {children}
      </main>
    </div>
  );
}
