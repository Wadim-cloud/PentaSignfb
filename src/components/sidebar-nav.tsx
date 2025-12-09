'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FileJson, FileSignature, Github, ShieldCheck, LogOut } from 'lucide-react';
import {
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PentaSignLogo } from './pentasign-logo';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const navItems = [
  { href: '/', label: 'Sign Document', icon: FileSignature },
  { href: '/verify', label: 'Verify Signature', icon: ShieldCheck },
  { href: '/manifest', label: 'Generate Manifest', icon: FileJson },
  { href: '/github', label: 'Push to GitHub', icon: Github },
];

const userAvatar = PlaceHolderImages.find(p => p.id === 'user-avatar')!;

export default function SidebarNav() {
  const pathname = usePathname();

  return (
    <>
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <PentaSignLogo className="size-8" />
          <div className="flex flex-col">
            <h1 className="font-semibold text-lg tracking-tight">PentaSign</h1>
            <p className="text-xs text-muted-foreground">Plugin</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {navItems.map(item => (
            <SidebarMenuItem key={item.label}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.href}
                tooltip={item.label}
              >
                <Link href={item.href}>
                  <item.icon />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-2">
        <Separator className="my-2" />
        <div className="flex items-center gap-3 p-2 rounded-md transition-colors hover:bg-sidebar-accent">
          <Avatar className='size-9'>
            <AvatarImage
              src={userAvatar.imageUrl}
              alt={userAvatar.description}
              data-ai-hint={userAvatar.imageHint}
            />
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
          <div className="flex flex-col overflow-hidden">
            <span className="font-semibold text-sm truncate">User</span>
            <span className="text-xs text-muted-foreground truncate">
              user@example.com
            </span>
          </div>
          <Button variant="ghost" size="icon" className="ml-auto shrink-0">
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      </SidebarFooter>
    </>
  );
}
