import { useState } from "react";
import { AdminSidebar } from "./AdminSidebar";
import { AdminTopbar } from "./AdminTopbar";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen w-full bg-background">
      {/* Sidebar */}
      <AdminSidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />

      {/* Main content */}
      <div className="lg:pl-64 m-0 p-0">
        {/* Topbar */}
        <AdminTopbar onMenuClick={() => setSidebarOpen(true)} />

        {/* Page content */}
        <main className="px-4 py-6 lg:px-6">
          {children}
        </main>
      </div>
    </div>
  );
}