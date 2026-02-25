
'use client';
import { SidebarTrigger } from '@/components/ui/sidebar';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Fragment } from 'react';
import { useAppData } from '@/app/(main)/_context/app-context';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from '@/components/ui/button';
import { Bell, CheckCheck } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

function toTitleCase(str: string) {
  return str.replace(/-/g, ' ').replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase());
}

export function Header() {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);
  const { notifications, markNotificationAsRead, markAllNotificationsAsRead } = useAppData();
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="sticky top-0 z-10 flex h-14 items-center justify-between gap-4 border-b bg-background/80 backdrop-blur-sm px-4 lg:h-[60px] lg:px-6">
      <div className="flex items-center gap-4">
        <SidebarTrigger className="md:hidden" />
        <Breadcrumb>
          <BreadcrumbList>
            {segments.map((segment, index) => {
               const href = `/${segments.slice(0, index + 1).join('/')}`;
               const isLast = index === segments.length - 1;
              return (
                <Fragment key={href}>
                  <BreadcrumbItem>
                    {isLast ? (
                       <BreadcrumbPage>{toTitleCase(segment)}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink asChild>
                        <Link href={href}>{toTitleCase(segment)}</Link>
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                  {!isLast && <BreadcrumbSeparator />}
                </Fragment>
              )
            })}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      
      <div className="flex items-center gap-2">
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute top-0 right-0 flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                        </span>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-80 md:w-96" align="end">
                <DropdownMenuLabel className="flex justify-between items-center">
                    Notifications
                    {unreadCount > 0 && <Button variant="link" size="sm" className="h-auto p-0" onClick={(e) => { e.stopPropagation(); markAllNotificationsAsRead(); }}><CheckCheck className="mr-1" /> Mark all as read</Button>}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {notifications.length > 0 ? (
                    <div className="max-h-96 overflow-y-auto">
                        {notifications.map(notification => (
                            <DropdownMenuItem key={notification.id} onSelect={(e) => { e.preventDefault(); markNotificationAsRead(notification.id); }} className={`flex-col items-start gap-1 p-3 cursor-pointer ${!notification.read ? 'bg-secondary/50' : ''}`}>
                                <p className="font-semibold text-sm">{notification.title}</p>
                                <p className="text-xs text-muted-foreground w-full whitespace-normal">{notification.description}</p>
                                <p className="text-xs text-muted-foreground/80 mt-1">{formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}</p>
                            </DropdownMenuItem>
                        ))}
                    </div>
                ) : (
                    <p className="p-4 text-sm text-muted-foreground text-center">No new notifications.</p>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
        {/* User avatar dropdown removed for public demo */}
      </div>
    </header>
  );
}
