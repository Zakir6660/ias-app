
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BotMessageSquare,
  Clapperboard,
  Image as ImageIcon,
  Palette,
  Sparkles,
  Swords,
  User,
  Volume2,
  BarChart3,
  Star,
  Layers,
  FolderKanban,
  MessageSquare,
  Settings,
  PlusSquare,
  LogOut,
  Wand2,
  FileText,
  Shield,
} from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import {
  Sidebar,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import { useAppData } from '@/app/(main)/_context/app-context';
import { LogoIcon } from '../ui/logo-icon';

const navItems = [
  { href: '/analytics', icon: BarChart3, label: 'Dashboard' },
  { href: '/projects', icon: FolderKanban, label: 'Projects' },
  { href: '/create-ad', icon: PlusSquare, label: 'Create Ad' },
  { href: '/hybrid-ad', icon: Layers, label: 'Hybrid Ads' },
  { href: '/my-creations', icon: Sparkles, label: 'My Creations' },
  { href: '/brand-kits', icon: Palette, label: 'Assets & Quick Ads' },
  { href: '/feedback', icon: MessageSquare, label: 'Client Feedback' },
];

const aiToolsNavItems = [
    { href: '/voice-over', icon: Volume2, label: 'AI Voice Over' },
    { href: '/prompt-ad', icon: Wand2, label: 'One-Prompt Video Builder' },
    { href: '/scripted-ad', icon: FileText, label: 'Scripted Ad Builder' },
    { href: '/image-generation', icon: ImageIcon, label: 'Image Generation' },
    { href: '/video-generation', icon: Clapperboard, label: 'Video Generation' },
    { href: '/face-swap', icon: Swords, label: 'Face Swap' },
];

const bottomNavItems = [
    { href: '/settings', icon: Settings, label: 'Profile & Settings' },
    { href: '/pricing', icon: Star, label: 'Pricing & Upgrade' },
    { href: '/legal', icon: Shield, label: 'Legal & Disclosure' },
]

export function SidebarNav() {
  const pathname = usePathname();
  const { authUser } = useAppData();

  return (
    <Sidebar collapsible="icon" className="group-data-[collapsible=icon]:w-14">
      <SidebarHeader className="h-20 p-2.5 flex items-center">
        <Link href="/" className="flex items-center gap-2">
          <LogoIcon className="w-8 h-8 text-primary" />
          <div className="group-data-[collapsible=icon]:hidden">
            <h1 className="text-xl font-headline font-semibold text-primary">
              IAS
            </h1>
            <p className="text-[11px] text-muted-foreground -mt-1 max-w-[150px] leading-tight">
              Influencer Automation Studio
            </p>
          </div>
        </Link>
      </SidebarHeader>
      <SidebarMenu className="flex-1 p-2.5">
        {navItems.map((item) => (
          <SidebarMenuItem key={item.href}>
            <Link href={item.href}>
              <SidebarMenuButton
                isActive={pathname === item.href || (item.href !== '/analytics' && pathname.startsWith(item.href))}
                tooltip={item.label}
              >
                <item.icon />
                <span>{item.label}</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        ))}
         {authUser?.isAdmin && (
            <SidebarMenuItem>
            <Link href="/admin">
                <SidebarMenuButton
                isActive={pathname.startsWith('/admin')}
                tooltip="Admin Panel"
                >
                <Shield />
                <span>Admin Panel</span>
                </SidebarMenuButton>
            </Link>
            </SidebarMenuItem>
        )}
         <div className="flex-grow" />
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                 <SidebarMenuButton tooltip="AI Tools">
                    <BotMessageSquare />
                    <span>AI Tools</span>
                </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="right" align="start" className="w-56 mb-2">
                 {aiToolsNavItems.map((item) => (
                     <Link href={item.href} key={item.href}>
                        <DropdownMenuItem>
                            <item.icon className="mr-2" />
                            <span>{item.label}</span>
                        </DropdownMenuItem>
                    </Link>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>

        {bottomNavItems.map((item) => (
            <SidebarMenuItem key={item.href}>
                <Link href={item.href}>
                <SidebarMenuButton
                    isActive={pathname.startsWith(item.href)}
                    tooltip={item.label}
                >
                    <item.icon />
                    <span>{item.label}</span>
                </SidebarMenuButton>
                </Link>
            </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </Sidebar>
  );
}

    