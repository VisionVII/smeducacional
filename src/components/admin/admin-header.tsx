'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X, Bell, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { UserNav } from '@/components/user-nav';
import { Badge } from '@/components/ui/badge';

export function AdminHeader() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        {/* Logo e Mobile Menu */}
        <div className="flex items-center gap-4">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Abrir menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              {/* Mobile Sidebar Content */}
              <div className="py-4">
                <div className="px-4 mb-4">
                  <Link href="/admin" onClick={() => setIsOpen(false)}>
                    <h2 className="text-xl font-bold">SM Educa</h2>
                    <p className="text-xs text-muted-foreground">Admin</p>
                  </Link>
                </div>
                {/* Navigation items will be rendered here via AdminSidebar component */}
              </div>
            </SheetContent>
          </Sheet>

          <Link href="/admin" className="hidden md:block">
            <h1 className="text-xl font-bold">SM Educa Admin</h1>
          </Link>
        </div>

        {/* Search Bar - Desktop */}
        <div className="hidden md:flex flex-1 max-w-md mx-4">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Pesquisar usuários, cursos, etc..."
              className="pl-10"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="md:hidden">
            <Search className="h-5 w-5" />
          </Button>

          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
            >
              3
            </Badge>
          </Button>

          <UserNav />
        </div>
      </div>
    </header>
  );
}
