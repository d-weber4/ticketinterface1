import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Badge } from './ui/badge'
import { 
  TrendingUp, 
  Clock, 
  AlertTriangle,
  Download,
  Users,
  CheckCircle
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts'

const availabilityData = [
  { name: 'Sarah Johnson', uptime: 95, total: 40 },
  { name: 'David Chen', uptime: 88, total: 40 },
  { name: 'Mike Wilson', uptime: 72, total: 40 },
  { name: 'Lisa Brown', uptime: 91, total: 40 },
  { name: 'John Smith', uptime: 85, total: 40 }
]

const responseTimeData = [
  { name: 'Sarah Johnson', avgTime: 8.5 },
  { name: 'David Chen', avgTime: 12.2 },
  { name: 'Mike Wilson', avgTime: 15.8 },
  { name: 'Lisa Brown', avgTime: 9.3 },
  { name: 'John Smith', avgTime: 11.7 }
]

const weeklyTrendData = [
  { day: 'Mon', assigned: 45, acknowledged: 42, missed: 3 },
  { day: 'Tue', assigned: 52, acknowledged: 48, missed: 4 },
  { day: 'Wed', assigned: 38, acknowledged: 36, missed: 2 },
  { day: 'Thu', assigned: 61, acknowledged: 57, missed: 4 },
  { day: 'Fri', assigned: 43, acknowledged: 41, missed: 2 },
  { day: 'Sat', assigned: 28, acknowledged: 26, missed: 2 },
  { day: 'Sun', assigned: 19, acknowledged: 18, missed: 1 }
]

const assignmentStatusData = [
  { name: 'On Time', value: 78, color: '#10b981' },
  { name: 'Acknowledged Late', value: 15, color: '#f59e0b' },
  { name: 'Missed/Reassigned', value: 7, color: '#ef4444' }
]

export function ReportsPage() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1>Ticket Assignment Reports</h1>
          <p className="text-muted-foreground">Analytics and metrics for automated ticket assignment performance</p>
        </div>
        <div className="flex items-center gap-2">
          <Select defaultValue="7days">
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 days</SelectItem>
              <SelectItem value="30days">Last 30 days</SelectItem>
              <SelectItem value="90days">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assignment Success Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">92.3%</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline w-3 h-3 mr-1" />
              +2.1% from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">11.5 min</div>
            <p className="text-xs text-muted-foreground">
              Average acknowledgment time
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Technicians</CardTitle>
            <Users className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12/15</div>
            <p className="text-xs text-muted-foreground">
              Currently available for assignment
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Missed Assignments</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">18</div>
            <p className="text-xs text-muted-foreground">
              Assignments not acknowledged
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Technician Availability */}
        <Card>
          <CardHeader>
            <CardTitle>Technician Availability Uptime</CardTitle>
            <CardDescription>Percentage of time technicians were available for assignments</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={availabilityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  fontSize={12}
                  tick={{ fontSize: 12 }}
                  interval={0}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis />
                <Tooltip 
                  formatter={(value) => [`${value}%`, 'Uptime']}
                  labelFormatter={(label) => `Technician: ${label}`}
                />
                <Bar dataKey="uptime" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Assignment Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Assignment Status Distribution</CardTitle>
            <CardDescription>Breakdown of ticket assignment outcomes</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={assignmentStatusData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}%`}
                >
                  {assignmentStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value}%`} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Assignment Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Weekly Assignment Trends</CardTitle>
            <CardDescription>Daily assignment volumes and acknowledgment rates</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={weeklyTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="assigned" stroke="#3b82f6" strokeWidth={2} name="Assigned" />
                <Line type="monotone" dataKey="acknowledged" stroke="#10b981" strokeWidth={2} name="Acknowledged" />
                <Line type="monotone" dataKey="missed" stroke="#ef4444" strokeWidth={2} name="Missed" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Average Response Times */}
        <Card>
          <CardHeader>
            <CardTitle>Average Response Times by Technician</CardTitle>
            <CardDescription>Time to acknowledge ticket assignments (minutes)</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={responseTimeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  fontSize={12}
                  tick={{ fontSize: 12 }}
                  interval={0}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis />
                <Tooltip 
                  formatter={(value) => [`${value} min`, 'Avg Response Time']}
                  labelFormatter={(label) => `Technician: ${label}`}
                />
                <Bar dataKey="avgTime" fill="#f59e0b" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Table */}
      <Card>
        <CardHeader>
          <CardTitle>Technician Performance Summary</CardTitle>
          <CardDescription>Detailed performance metrics for each technician</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Technician</th>
                  <th className="text-left p-2">Total Assigned</th>
                  <th className="text-left p-2">Acknowledged</th>
                  <th className="text-left p-2">Missed</th>
                  <th className="text-left p-2">Success Rate</th>
                  <th className="text-left p-2">Avg Response</th>
                  <th className="text-left p-2">Availability</th>
                  <th className="text-left p-2">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="p-2 font-medium">Sarah Johnson</td>
                  <td className="p-2">42</td>
                  <td className="p-2">39</td>
                  <td className="p-2">3</td>
                  <td className="p-2">92.9%</td>
                  <td className="p-2">8.5 min</td>
                  <td className="p-2">95%</td>
                  <td className="p-2">
                    <Badge className="bg-green-100 text-green-800">Excellent</Badge>
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="p-2 font-medium">David Chen</td>
                  <td className="p-2">38</td>
                  <td className="p-2">35</td>
                  <td className="p-2">3</td>
                  <td className="p-2">92.1%</td>
                  <td className="p-2">12.2 min</td>
                  <td className="p-2">88%</td>
                  <td className="p-2">
                    <Badge className="bg-green-100 text-green-800">Good</Badge>
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="p-2 font-medium">Mike Wilson</td>
                  <td className="p-2">28</td>
                  <td className="p-2">24</td>
                  <td className="p-2">4</td>
                  <td className="p-2">85.7%</td>
                  <td className="p-2">15.8 min</td>
                  <td className="p-2">72%</td>
                  <td className="p-2">
                    <Badge className="bg-yellow-100 text-yellow-800">Needs Improvement</Badge>
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="p-2 font-medium">Lisa Brown</td>
                  <td className="p-2">35</td>
                  <td className="p-2">33</td>
                  <td className="p-2">2</td>
                  <td className="p-2">94.3%</td>
                  <td className="p-2">9.3 min</td>
                  <td className="p-2">91%</td>
                  <td className="p-2">
                    <Badge className="bg-green-100 text-green-800">Excellent</Badge>
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="p-2 font-medium">John Smith</td>
                  <td className="p-2">31</td>
                  <td className="p-2">28</td>
                  <td className="p-2">3</td>
                  <td className="p-2">90.3%</td>
                  <td className="p-2">11.7 min</td>
                  <td className="p-2">85%</td>
                  <td className="p-2">
                    <Badge className="bg-green-100 text-green-800">Good</Badge>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}