import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarInset,
  SidebarTrigger,
} from "festi";
import { Map, Users, Calendar, Settings } from "lucide-react";

export function Layout() {
  return (
    <div className="h-80 w-[36rem] overflow-hidden rounded-lg border">
      <SidebarProvider className="min-h-full">
        <Sidebar collapsible="none" className="border-r">
          <SidebarHeader className="px-3 py-2 text-sm font-semibold">
            Festi
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Navigate</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton isActive>
                      <Map /> Rides
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton>
                      <Users /> Groups
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton>
                      <Calendar /> Events
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter className="px-2 py-2">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <Settings /> Settings
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset className="p-4">
          <div className="flex items-center gap-2">
            <SidebarTrigger />
            <span className="text-sm font-medium">Rides</span>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            Your upcoming group rides appear here.
          </p>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
