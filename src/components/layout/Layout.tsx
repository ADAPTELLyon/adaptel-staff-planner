
import { Header } from "./Header";
import { Navbar } from "./Navbar";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="sticky top-0 z-50 flex flex-col border-b bg-white">
        <div className="flex h-14 items-center justify-between px-4 lg:px-8">
          <div className="flex items-center">
            <h1 className="text-xl font-semibold text-[#840404]">ADAPTEL LYON</h1>
          </div>
          <Navbar />
        </div>
      </div>
      <main className="flex-1 bg-gray-50">
        {children}
      </main>
    </div>
  );
}
