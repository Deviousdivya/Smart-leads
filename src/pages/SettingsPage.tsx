import React from "react";
import DashboardLayout from "../components/DashboardLayout";
import { useAuthStore } from "../hooks/useAuthStore";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../components/ui/card";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { toast } from "sonner";

export default function SettingsPage() {
  const { user } = useAuthStore();

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    toast.info("Profile update is not implemented in this demo.");
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <h2 className="text-2xl font-bold dark:text-white">Account Settings</h2>
        
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Update your account details and role</CardDescription>
          </CardHeader>
          <form onSubmit={handleUpdate}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="account-name">Name</Label>
                <Input id="account-name" defaultValue={user?.name} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="account-email">Email</Label>
                <Input id="account-email" defaultValue={user?.email} disabled />
                <p className="text-xs text-gray-400">Email cannot be changed.</p>
              </div>
              <div className="space-y-2">
                <Label>Account Role</Label>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{user?.role}</Badge>
                  <span className="text-xs text-gray-500">Contact admin to change role.</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit">Save Changes</Button>
            </CardFooter>
          </form>
        </Card>

        <Card className="border-destructive/20 bg-destructive/5">
          <CardHeader>
            <CardTitle className="text-destructive">Danger Zone</CardTitle>
            <CardDescription aria-level={3}>Permanently delete your account</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Once you delete your account, there is no going back. Please be certain.
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="destructive">Delete Account</Button>
          </CardFooter>
        </Card>
      </div>
    </DashboardLayout>
  );
}
