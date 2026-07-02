import { requireAdmin } from "@/features/auth/actions";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ShieldIcon } from "lucide-react";

export default async function AdminSettingsPage() {
  await requireAdmin();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Settings</h1>
        <p className="text-muted-foreground">
          Platform configuration and administration
        </p>
      </div>

      <Card className="border-red-500/20">
        <CardHeader>
          <CardTitle>Platform Settings</CardTitle>
          <CardDescription>Configure platform-wide settings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <ShieldIcon className="mb-4 size-12 text-muted-foreground/50" />
            <p className="text-muted-foreground">Admin settings coming soon</p>
            <p className="text-sm text-muted-foreground">
              Site configuration, feature flags, and more
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
