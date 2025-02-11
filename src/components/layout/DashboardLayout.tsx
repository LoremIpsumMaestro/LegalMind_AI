import { ReactNode } from 'react';
import { useRouter } from 'next/router';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  FileText,
  Settings,
  LogOut,
  User,
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface DashboardLayoutProps {
  children: ReactNode;
  user: any;
  signOut: () => Promise<void>;
}

export function DashboardLayout({ children, user, signOut }: DashboardLayoutProps) {
  const router = useRouter();
  const currentPath = router.pathname;

  const menuItems = [
    {
      title: 'Dashboard',
      icon: <LayoutDashboard className="h-5 w-5" />,
      href: '/dashboard',
    },
    {
      title: 'Cases',
      icon: <FileText className="h-5 w-5" />,
      href: '/cases',
    },
    {
      title: 'Profile',
      icon: <User className="h-5 w-5" />,
      href: '/profile',
    },
    {
      title: 'Settings',
      icon: <Settings className="h-5 w-5" />,
      href: '/settings',
    },
  ];

  const handleSignOut = async () => {
    await signOut();
    router.push('/auth/login');
  };

  const NavContent = () => (
    <div className="space-y-4 py-4">
      <div className="px-3 py-2">
        <h2 className="mb-2 px-4 text-lg font-semibold">Menu</h2>
        <div className="space-y-1">
          {menuItems.map((item) => (
            <Button
              key={item.href}
              variant={currentPath === item.href ? "secondary" : "ghost"}
              className="w-full justify-start"
              onClick={() => router.push(item.href)}
            >
              {item.icon}
              <span className="ml-2">{item.title}</span>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Nav */}
      <div className="md:hidden flex items-center justify-between p-4 border-b">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              <LayoutDashboard className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left">
            <SheetHeader>
              <SheetTitle>LegalMind AI</SheetTitle>
            </SheetHeader>
            <NavContent />
          </SheetContent>
        </Sheet>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">{user.email}</span>
          <Button variant="ghost" size="icon" onClick={handleSignOut}>
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Desktop Nav */}
      <div className="hidden md:flex">
        <div className="flex flex-col w-64 border-r min-h-screen">
          <div className="p-6">
            <h1 className="text-xl font-bold">LegalMind AI</h1>
          </div>
          <NavContent />
          <div className="mt-auto p-4 border-t">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground truncate">
                {user.email}
              </span>
              <Button variant="ghost" size="icon" onClick={handleSignOut}>
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto py-6">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Content */}
      <div className="md:hidden">
        <main className="p-4">
          {children}
        </main>
      </div>
    </div>
  );
}