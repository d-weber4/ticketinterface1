import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Input } from './ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Label } from './ui/label'
import { 
  Calendar,
  Phone,
  FileText,
  Edit,
  Check,
  X,
  Plus,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import { toast } from 'sonner'

interface Schedule {
  id: string
  name: string
  type: 'Call' | 'Task'
  status: 'Pending' | 'Past-Due' | 'Done' | 'Cancelled'
  startDate: string
  endDate: string
  startTime: string
  endTime: string
  allocation: 'Firm' | 'Tentative'
  duration: string
  siteTimeZone: string
}

const mockSchedules: Schedule[] = [
  {
    id: 'schedule-1',
    name: 'Run Performance Scans on PC',
    type: 'Task',
    status: 'Pending',
    startDate: '08/20/2025',
    endDate: '08/20/2025',
    startTime: '12:15 AM',
    endTime: '12:25 AM',
    allocation: 'Firm',
    duration: '10mins',
    siteTimeZone: '(UTC-05:00) Eastern Time (US & Canada)'
  },
  {
    id: 'schedule-2',
    name: 'Call Dustin',
    type: 'Call',
    status: 'Done',
    startDate: '08/19/2025',
    endDate: '08/19/2025',
    startTime: '2:00 PM',
    endTime: '2:15 PM',
    allocation: 'Firm',
    duration: '15mins',
    siteTimeZone: '(UTC-05:00) Eastern Time (US & Canada)'
  }
]

interface SchedulingWidgetProps {
  ticketId: string
}

export function SchedulingWidget({ ticketId }: SchedulingWidgetProps) {
  const [schedules, setSchedules] = useState(mockSchedules)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isDoneModalOpen, setIsDoneModalOpen] = useState(false)
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null)
  const [expandedSchedule, setExpandedSchedule] = useState<string | null>(null)

  const [createForm, setCreateForm] = useState({
    name: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    allocation: 'Firm',
    type: 'Task'
  })

  const [editForm, setEditForm] = useState({
    name: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    allocation: 'Firm',
    type: 'Task'
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800'
      case 'Past-Due': return 'bg-red-100 text-red-800'
      case 'Done': return 'bg-green-100 text-green-800'
      case 'Cancelled': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeIcon = (type: string) => {
    return type === 'Call' ? <Phone className="w-4 h-4" /> : <FileText className="w-4 h-4" />
  }

  const handleCreateSchedule = () => {
    const newSchedule: Schedule = {
      id: `schedule-${Date.now()}`,
      name: createForm.name,
      type: createForm.type as 'Call' | 'Task',
      status: 'Pending',
      startDate: new Date(createForm.startDate).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }),
      endDate: new Date(createForm.endDate).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }),
      startTime: createForm.startTime,
      endTime: createForm.endTime,
      allocation: createForm.allocation as 'Firm' | 'Tentative',
      duration: '15mins', // Calculate based on start/end time
      siteTimeZone: '(UTC-05:00) Eastern Time (US & Canada)'
    }

    setSchedules(prev => [...prev, newSchedule])
    setIsCreateModalOpen(false)
    setCreateForm({
      name: '',
      startDate: '',
      startTime: '',
      endDate: '',
      endTime: '',
      allocation: 'Firm',
      type: 'Task'
    })
    toast.success('Schedule created successfully')
  }

  const handleEditSchedule = () => {
    if (!selectedSchedule) return

    setSchedules(prev => prev.map(schedule => 
      schedule.id === selectedSchedule.id 
        ? {
            ...schedule,
            name: editForm.name,
            type: editForm.type as 'Call' | 'Task',
            startDate: new Date(editForm.startDate).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }),
            endDate: new Date(editForm.endDate).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }),
            startTime: editForm.startTime,
            endTime: editForm.endTime,
            allocation: editForm.allocation as 'Firm' | 'Tentative'
          }
        : schedule
    ))
    
    setIsEditModalOpen(false)
    setSelectedSchedule(null)
    toast.success('Schedule updated successfully')
  }

  const handleMarkDone = (reason: string) => {
    if (!selectedSchedule) return

    setSchedules(prev => prev.map(schedule => 
      schedule.id === selectedSchedule.id 
        ? { ...schedule, status: 'Done' as const }
        : schedule
    ))

    setIsDoneModalOpen(false)
    setSelectedSchedule(null)
    toast.success(`Schedule marked as done: ${reason}`)
  }

  const handleCancelSchedule = (reason: string) => {
    if (!selectedSchedule) return

    setSchedules(prev => prev.map(schedule => 
      schedule.id === selectedSchedule.id 
        ? { ...schedule, status: 'Cancelled' as const }
        : schedule
    ))

    setIsCancelModalOpen(false)
    setSelectedSchedule(null)
    toast.success(`Schedule cancelled: ${reason}`)
  }

  const openEditModal = (schedule: Schedule) => {
    setSelectedSchedule(schedule)
    setEditForm({
      name: schedule.name,
      startDate: '', // Would need to convert from display format
      startTime: schedule.startTime,
      endDate: '',
      endTime: schedule.endTime,
      allocation: schedule.allocation,
      type: schedule.type
    })
    setIsEditModalOpen(true)
  }

  const openDoneModal = (schedule: Schedule) => {
    setSelectedSchedule(schedule)
    setIsDoneModalOpen(true)
  }

  const openCancelModal = (schedule: Schedule) => {
    setSelectedSchedule(schedule)
    setIsCancelModalOpen(true)
  }

  const toggleExpanded = (scheduleId: string) => {
    setExpandedSchedule(expandedSchedule === scheduleId ? null : scheduleId)
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Scheduling</CardTitle>
            <Button size="sm" onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Schedule
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {schedules.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No schedules created yet</p>
              </div>
            ) : (
              schedules.map((schedule) => (
                <div key={schedule.id} className="border rounded-lg">
                  <div className="p-3">
                    <div className="grid grid-cols-12 gap-4 items-center">
                      <div className="col-span-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleExpanded(schedule.id)}
                            className="p-1 hover:bg-muted rounded"
                          >
                            {expandedSchedule === schedule.id ? (
                              <ChevronUp className="w-3 h-3" />
                            ) : (
                              <ChevronDown className="w-3 h-3" />
                            )}
                          </button>
                          <span className="font-medium text-sm">{schedule.name}</span>
                        </div>
                      </div>
                      <div className="col-span-2 flex items-center gap-2">
                        {getTypeIcon(schedule.type)}
                        <span className="text-sm">{schedule.type}</span>
                      </div>
                      <div className="col-span-2">
                        <Badge className={getStatusColor(schedule.status)}>
                          {schedule.status}
                        </Badge>
                      </div>
                      <div className="col-span-4 flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditModal(schedule)}
                          className="h-7 w-7 p-0"
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        {schedule.status !== 'Done' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openDoneModal(schedule)}
                            className="h-7 w-7 p-0 text-green-600 hover:text-green-700"
                          >
                            <Check className="w-3 h-3" />
                          </Button>
                        )}
                        {schedule.status !== 'Cancelled' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openCancelModal(schedule)}
                            className="h-7 w-7 p-0 text-red-600 hover:text-red-700"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  {expandedSchedule === schedule.id && (
                    <div className="border-t bg-muted/20 p-3">
                      <h4 className="font-medium text-sm mb-3">Details</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Start Time</span>
                          <div>{schedule.startDate} {schedule.startTime}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">End Time</span>
                          <div>{schedule.endDate} {schedule.endTime}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Duration</span>
                          <div>{schedule.duration}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Allocation</span>
                          <div>{schedule.allocation}</div>
                        </div>
                        <div className="col-span-2">
                          <span className="text-muted-foreground">Site Time Zone</span>
                          <div>{schedule.siteTimeZone}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {schedules.length > 0 && (
            <div className="flex justify-center mt-4 text-sm text-muted-foreground">
              1-{schedules.length} of {schedules.length}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Schedule Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md space-y-4">
            <div>
              <h2 className="text-lg font-medium">Create Schedule</h2>
              <p className="text-sm text-muted-foreground">
                Add a new schedule for ticket {ticketId}
              </p>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="scheduleName">Schedule Name</Label>
                <Input
                  id="scheduleName"
                  value={createForm.name}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter schedule summary..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={createForm.startDate}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, startDate: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="startTime">Start Time</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={createForm.startTime}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, startTime: e.target.value }))}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={createForm.endDate}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, endDate: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="endTime">End Time</Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={createForm.endTime}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, endTime: e.target.value }))}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="allocation">Allocation</Label>
                <Select value={createForm.allocation} onValueChange={(value) => setCreateForm(prev => ({ ...prev, allocation: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Firm">Firm</SelectItem>
                    <SelectItem value="Tentative">Tentative</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="scheduleType">Schedule Type</Label>
                <Select value={createForm.type} onValueChange={(value) => setCreateForm(prev => ({ ...prev, type: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Call">Call</SelectItem>
                    <SelectItem value="Task">Task</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateSchedule}>Add Schedule</Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Schedule Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md space-y-4">
            <div>
              <h2 className="text-lg font-medium">Edit Schedule</h2>
              <p className="text-sm text-muted-foreground">
                Modify schedule details
              </p>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="editScheduleName">Schedule Name</Label>
                <Input
                  id="editScheduleName"
                  value={editForm.name}
                  onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="editStartDate">Start Date</Label>
                  <Input
                    id="editStartDate"
                    type="date"
                    value={editForm.startDate}
                    onChange={(e) => setEditForm(prev => ({ ...prev, startDate: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="editStartTime">Start Time</Label>
                  <Input
                    id="editStartTime"
                    type="time"
                    value={editForm.startTime}
                    onChange={(e) => setEditForm(prev => ({ ...prev, startTime: e.target.value }))}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="editEndDate">End Date</Label>
                  <Input
                    id="editEndDate"
                    type="date"
                    value={editForm.endDate}
                    onChange={(e) => setEditForm(prev => ({ ...prev, endDate: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="editEndTime">End Time</Label>
                  <Input
                    id="editEndTime"
                    type="time"
                    value={editForm.endTime}
                    onChange={(e) => setEditForm(prev => ({ ...prev, endTime: e.target.value }))}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="editAllocation">Allocation</Label>
                <Select value={editForm.allocation} onValueChange={(value) => setEditForm(prev => ({ ...prev, allocation: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Firm">Firm</SelectItem>
                    <SelectItem value="Tentative">Tentative</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="editScheduleType">Schedule Type</Label>
                <Select value={editForm.type} onValueChange={(value) => setEditForm(prev => ({ ...prev, type: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Call">Call</SelectItem>
                    <SelectItem value="Task">Task</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleEditSchedule}>Update Schedule</Button>
            </div>
          </div>
        </div>
      )}

      {/* Done Reason Modal */}
      {isDoneModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm space-y-4">
            <div>
              <h2 className="text-lg font-medium">Why are you closing the schedule?</h2>
            </div>
            <div className="space-y-2">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => handleMarkDone('Work Completed')}
              >
                Work Completed
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => handleMarkDone('No Contact')}
              >
                No Contact
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => handleMarkDone('Left Message')}
              >
                Left Message
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => handleMarkDone('Rescheduled')}
              >
                Rescheduled
              </Button>
            </div>
            <div className="flex justify-end">
              <Button variant="ghost" onClick={() => setIsDoneModalOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Reason Modal */}
      {isCancelModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm space-y-4">
            <div>
              <h2 className="text-lg font-medium">Why are you cancelling the schedule?</h2>
            </div>
            <div className="space-y-2">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => handleCancelSchedule('No longer needed')}
              >
                No longer needed
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => handleCancelSchedule('Requested Cancellation')}
              >
                Requested Cancellation
              </Button>
            </div>
            <div className="flex justify-end">
              <Button variant="ghost" onClick={() => setIsCancelModalOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}