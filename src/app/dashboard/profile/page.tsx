import { UserIcon } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function ProfilePage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground">Manage your public profile</p>
      </div>

      <Card className="border-red-500/20">
        <CardHeader>
          <CardTitle>Your Profile</CardTitle>
          <CardDescription>Customize how others see you</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <UserIcon className="mb-4 size-12 text-muted-foreground/50" />
            <p className="text-muted-foreground">Profile editor coming soon</p>
            <p className="text-sm text-muted-foreground">
              Update your avatar, bio, and social links
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
