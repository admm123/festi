import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BellIcon } from "lucide-react";

export default function NotificationsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
        <p className="text-muted-foreground">
          Manage your notification preferences
        </p>
      </div>

      <Card className="border-red-500/20">
        <CardHeader>
          <CardTitle>Notification Settings</CardTitle>
          <CardDescription>
            Choose what you want to be notified about
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <BellIcon className="mb-4 size-12 text-muted-foreground/50" />
            <p className="text-muted-foreground">
              Notification settings coming soon
            </p>
            <p className="text-sm text-muted-foreground">
              Email, push, and in-app notification controls
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
