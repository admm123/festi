"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ZapIcon,
  HomeIcon,
  BikeIcon,
  UsersIcon,
  SettingsIcon,
  ShieldIcon,
  BarChart3Icon,
  UserCogIcon,
  UserIcon,
  BellIcon,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const contentItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: HomeIcon },

  { label: "Community", href: "/dashboard/community", icon: UsersIcon },
  {
    label: "Community Rides",
    href: "/dashboard/community-rides",
    icon: BikeIcon,
  },
];

const settingsItems: NavItem[] = [
  { label: "Profile", href: "/dashboard/profile", icon: UserIcon },
  { label: "Notifications", href: "/dashboard/notifications", icon: BellIcon },
  { label: "Settings", href: "/dashboard/settings", icon: SettingsIcon },
];

const adminItems: NavItem[] = [
  {
    label: "Analytics",
    href: "/dashboard/admin/analytics",
    icon: BarChart3Icon,
  },
  {
    label: "User Management",
    href: "/dashboard/admin/users",
    icon: UserCogIcon,
  },
  {
    label: "Admin Settings",
    href: "/dashboard/admin/settings",
    icon: ShieldIcon,
  },
];

interface AppSidebarProps {
  userRole: string;
}

export function AppSidebar({ userRole }: AppSidebarProps) {
  const pathname = usePathname();
  const isAdmin = userRole === "admin";

  const renderNavItems = (items: NavItem[]) => (
    <SidebarMenu>
      {items.map((item) => {
        const isActive = pathname === item.href;
        return (
          <SidebarMenuItem key={item.href}>
            <SidebarMenuButton
              asChild
              isActive={isActive}
              className={
                isActive
                  ? "bg-red-500/20 text-red-500 hover:bg-red-500/30 hover:text-red-500"
                  : "hover:bg-red-500/10"
              }
            >
              <Link href={item.href}>
                <item.icon className="size-4" />
                <span>{item.label}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );

  return (
    <Sidebar className="border-r border-red-500/20">
      {/* Header */}
      <SidebarHeader className="border-b border-red-500/20 px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-red-500 to-red-700">
            <ZapIcon className="size-4 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">FESTI</span>
          {isAdmin && (
            <span className="ml-auto rounded-full bg-red-500/20 px-2 py-0.5 text-xs font-medium text-red-500">
              Admin
            </span>
          )}
        </div>
      </SidebarHeader>

      {/* Main Content */}
      <SidebarContent>
        {/* Content Section */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-muted-foreground/70">
            Content
          </SidebarGroupLabel>
          <SidebarGroupContent>
            {renderNavItems(contentItems)}
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Settings Section */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-muted-foreground/70">
            Account
          </SidebarGroupLabel>
          <SidebarGroupContent>
            {renderNavItems(settingsItems)}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer - Admin section at bottom */}
      {isAdmin && (
        <SidebarFooter className="mt-auto">
          <SidebarGroup className="border-t border-red-500/20 pt-2">
            <SidebarGroupLabel className="text-red-500/70">
              Administration
            </SidebarGroupLabel>
            <SidebarGroupContent>
              {renderNavItems(adminItems)}
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarFooter>
      )}
    </Sidebar>
  );
}
