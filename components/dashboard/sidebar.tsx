'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Package, Grid, Settings, LogOut } from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const isActive = (path: string) => pathname === path;

  return (
    <aside className="w-64 border-r border-border bg-background h-screen flex flex-col">
      <div className="p-6 border-b border-border">
        <h1 className="text-xl font-bold text-foreground">Admin Portal</h1>
        <p className="text-xs text-muted-foreground mt-1">{user?.username}</p>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        <Link href="/dashboard">
          <Button
            variant={isActive('/dashboard') ? 'default' : 'ghost'}
            className="w-full justify-start"
            asChild
          >
            <span className="flex items-center gap-2">
              <Grid className="w-4 h-4" />
              Dashboard
            </span>
          </Button>
        </Link>

        <Link href="/dashboard/products">
          <Button
            variant={isActive('/dashboard/products') ? 'default' : 'ghost'}
            className="w-full justify-start"
            asChild
          >
            <span className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              Products
            </span>
          </Button>
        </Link>

        <Link href="/dashboard/categories">
          <Button
            variant={isActive('/dashboard/categories') ? 'default' : 'ghost'}
            className="w-full justify-start"
            asChild
          >
            <span className="flex items-center gap-2">
              <Grid className="w-4 h-4" />
              Categories
            </span>
          </Button>
        </Link>
      </nav>

      <div className="p-4 border-t border-border">
        <Button
          onClick={handleLogout}
          variant="outline"
          className="w-full justify-start text-foreground hover:text-foreground"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </div>
    </aside>
  );
}
