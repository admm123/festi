import { requireAdmin } from "@/features/auth/actions";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { UserCogIcon } from "lucide-react";

export default async function UsersPage() {
  await requireAdmin();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
        <p className="text-muted-foreground">
          Manage platform users and permissions
        </p>
      </div>

      <Card className="border-red-500/20">
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>View and manage user accounts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <UserCogIcon className="mb-4 size-12 text-muted-foreground/50" />
            <p className="text-muted-foreground">User management coming soon</p>
            <p className="text-sm text-muted-foreground">
              View, edit, and manage user accounts
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
