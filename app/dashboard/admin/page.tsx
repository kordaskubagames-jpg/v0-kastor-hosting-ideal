import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Shield, Users, AlertCircle, Activity } from "lucide-react"

export default function AdminPage() {
  return (
    <div className="flex-1 space-y-8 p-8">
      <div>
        <h1 className="text-3xl font-bold">Admin Panel</h1>
        <p className="text-muted-foreground">Manage your Lua protection service and monitor system health</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Users</p>
              <p className="text-2xl font-bold">1,247</p>
            </div>
            <Users className="h-8 w-8 text-blue-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Active Scripts</p>
              <p className="text-2xl font-bold">3,892</p>
            </div>
            <Shield className="h-8 w-8 text-green-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">System Health</p>
              <p className="text-2xl font-bold">99.8%</p>
            </div>
            <Activity className="h-8 w-8 text-emerald-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Warnings</p>
              <p className="text-2xl font-bold">3</p>
            </div>
            <AlertCircle className="h-8 w-8 text-yellow-500" />
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h2 className="mb-4 text-lg font-semibold">System Status</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">API Server</span>
              <span className="inline-flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <span className="text-sm text-green-600">Operational</span>
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Database</span>
              <span className="inline-flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <span className="text-sm text-green-600">Operational</span>
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Cache Service</span>
              <span className="inline-flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-yellow-500" />
                <span className="text-sm text-yellow-600">Degraded</span>
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Security Scanner</span>
              <span className="inline-flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <span className="text-sm text-green-600">Operational</span>
              </span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="mb-4 text-lg font-semibold">Recent Activity</h2>
          <div className="space-y-3">
            <div className="border-l-2 border-blue-500 pl-3 py-1">
              <p className="text-sm font-medium">New user registered</p>
              <p className="text-xs text-muted-foreground">2 minutes ago</p>
            </div>
            <div className="border-l-2 border-green-500 pl-3 py-1">
              <p className="text-sm font-medium">Script protected successfully</p>
              <p className="text-xs text-muted-foreground">5 minutes ago</p>
            </div>
            <div className="border-l-2 border-yellow-500 pl-3 py-1">
              <p className="text-sm font-medium">Cache warning detected</p>
              <p className="text-xs text-muted-foreground">12 minutes ago</p>
            </div>
            <div className="border-l-2 border-blue-500 pl-3 py-1">
              <p className="text-sm font-medium">API rate limit triggered</p>
              <p className="text-xs text-muted-foreground">18 minutes ago</p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="mb-4 text-lg font-semibold">Quick Actions</h2>
        <div className="flex gap-3">
          <Button variant="outline">Clear Cache</Button>
          <Button variant="outline">Restart Services</Button>
          <Button variant="outline">Download Logs</Button>
          <Button variant="outline">System Report</Button>
        </div>
      </Card>
    </div>
  )
}
