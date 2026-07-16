import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Bell, Lock, User, Code2 } from "lucide-react"

export default function SettingsPage() {
  return (
    <div className="flex-1 space-y-8 p-8">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your account and service preferences</p>
      </div>

      <div className="max-w-2xl space-y-6">
        <Card className="p-6">
          <div className="mb-4 flex items-center gap-3">
            <User className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Account Settings</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Username</label>
              <input
                type="text"
                className="mt-2 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                value="YourNickname"
                readOnly
              />
            </div>
            <div>
              <label className="text-sm font-medium">Email</label>
              <input
                type="email"
                className="mt-2 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                placeholder="your@email.com"
              />
            </div>
            <Button className="w-full">Save Changes</Button>
          </div>
        </Card>

        <Card className="p-6">
          <div className="mb-4 flex items-center gap-3">
            <Lock className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Security</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border border-input p-4">
              <div>
                <p className="font-medium">Two-Factor Authentication</p>
                <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
              </div>
              <Button variant="outline">Enable</Button>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-input p-4">
              <div>
                <p className="font-medium">Change Password</p>
                <p className="text-sm text-muted-foreground">Update your password regularly</p>
              </div>
              <Button variant="outline">Change</Button>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-input p-4">
              <div>
                <p className="font-medium">Active Sessions</p>
                <p className="text-sm text-muted-foreground">Manage your login sessions</p>
              </div>
              <Button variant="outline">View</Button>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="mb-4 flex items-center gap-3">
            <Bell className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Notifications</h2>
          </div>
          <div className="space-y-4">
            <label className="flex items-center gap-3">
              <input type="checkbox" className="rounded border-input" defaultChecked />
              <div>
                <p className="font-medium">Email Notifications</p>
                <p className="text-sm text-muted-foreground">Receive updates about your scripts</p>
              </div>
            </label>
            <label className="flex items-center gap-3">
              <input type="checkbox" className="rounded border-input" defaultChecked />
              <div>
                <p className="font-medium">Security Alerts</p>
                <p className="text-sm text-muted-foreground">Get notified of suspicious activity</p>
              </div>
            </label>
            <label className="flex items-center gap-3">
              <input type="checkbox" className="rounded border-input" />
              <div>
                <p className="font-medium">Product Updates</p>
                <p className="text-sm text-muted-foreground">Learn about new features</p>
              </div>
            </label>
            <Button className="w-full">Save Preferences</Button>
          </div>
        </Card>

        <Card className="p-6">
          <div className="mb-4 flex items-center gap-3">
            <Code2 className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">API Keys</h2>
          </div>
          <div className="space-y-4">
            <div className="rounded-lg border border-input p-4">
              <p className="text-sm font-medium">Your API Key</p>
              <div className="mt-2 flex gap-2">
                <input
                  type="password"
                  className="flex-1 rounded border border-input bg-background px-3 py-2 text-sm"
                  value="••••••••••••••••••••••••"
                  readOnly
                />
                <Button variant="outline">Show</Button>
              </div>
            </div>
            <Button variant="outline" className="w-full">
              Regenerate API Key
            </Button>
          </div>
        </Card>

        <Card className="border-red-200 p-6">
          <h2 className="mb-4 text-lg font-semibold text-red-600">Danger Zone</h2>
          <div className="space-y-4">
            <Button variant="outline" className="w-full text-red-600 hover:text-red-700">
              Delete Account
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
