import { SettingsIcon } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your account preferences</p>
      </div>

      <Card className="border-red-500/20">
        <CardHeader>
          <CardTitle>Account Settings</CardTitle>
          <CardDescription>Update your profile and preferences</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <SettingsIcon className="mb-4 size-12 text-muted-foreground/50" />
            <p className="text-muted-foreground">Settings coming soon</p>
            <p className="text-sm text-muted-foreground">
              Profile customization and preferences
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
