import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Switch } from './ui/switch'
import { Badge } from './ui/badge'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Label } from './ui/label'
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuSub, ContextMenuSubContent, ContextMenuSubTrigger, ContextMenuTrigger } from './ui/context-menu'
import { ReasonCodeModal } from './ReasonCodeModal'
import { requiresReasonCode, getReasonCodeConfig } from './reasonCodes'
import { 
  Clock, 
  AlertTriangle, 
  Calendar, 
  User, 
  Search, 
  Filter,
  ExternalLink,
  Edit,
  Copy,
  AlertCircle,
  CalendarPlus,
  FileText,
  UserCheck,
  Check,
  X
} from 'lucide-react'
import { toast } from 'sonner'

interface Ticket {
  id: string
  title: string
  priority: 'Low' | 'Medium' | 'High' | 'Critical'
  status: 'Open' | 'In Progress' | 'Scheduled' | 'Completed' | 'New' | 'Assigned' | 'Approval/Info Needed' | 'Resolved' | 'Awaiting Response' | 'Closed'
  assignee?: string
  requester: string
  created: string
  dueDate: string
  slaStatus: 'On Track' | 'At Risk' | 'Breached'
  skills: string[]
  company?: string
  site?: string
  reasonHistory?: Array<{
    status: string
    reason: string
    timestamp: string
    user: string
  }>
}

interface TicketsPageProps {
  isAvailable: boolean
  onAvailabilityChange: (available: boolean) => void
  onViewTicket: (ticketId: string) => void
}

const mockTickets: Ticket[] = [
  {
    id: 'TK-001',
    title: 'Password Reset - Acme Corp',
    priority: 'High',
    status: 'Open',
    requester: 'John Smith',
    created: '2024-01-15 10:30 AM',
    dueDate: '2024-01-15T14:00',
    slaStatus: 'At Risk',
    skills: ['Active Directory', 'Windows'],
    company: 'Acme Corporation',
    site: 'Main Office',
    reasonHistory: []
  },
  {
    id: 'TK-002', 
    title: 'Software Installation - TechFlow Industries',
    priority: 'Medium',
    status: 'Scheduled',
    assignee: 'Sarah Johnson',
    requester: 'Mike Wilson',
    created: '2024-01-15 09:45 AM',
    dueDate: '2024-01-15T15:00',
    slaStatus: 'On Track',
    skills: ['Software Deployment', 'Windows'],
    company: 'TechFlow Industries',
    site: 'Downtown Branch',
    reasonHistory: []
  },
  {
    id: 'TK-003',
    title: 'Network Configuration - StartupXYZ',
    priority: 'Low',
    status: 'In Progress',
    assignee: 'David Chen',
    requester: 'Lisa Brown',
    created: '2024-01-14 2:20 PM',
    dueDate: '2024-01-16T17:00',
    slaStatus: 'On Track',
    skills: ['Networking', 'Router Configuration'],
    company: 'StartupXYZ',
    site: 'Tech Hub',
    reasonHistory: []
  }
]

const technicians = [
  'Sarah Johnson', 'David Chen', 'Mike Wilson', 'Lisa Brown', 'John Smith',
  'Emily Davis', 'Robert Taylor', 'Jennifer Martinez', 'William Anderson', 
  'Jessica Thompson', 'Michael Garcia', 'Ashley Rodriguez'
]

const statuses = ['New', 'Assigned', 'In Progress', 'Approval/Info Needed', 'Resolved', 'Awaiting Response', 'Scheduled', 'Closed']
const priorities = ['Emergency', 'High', 'Medium', 'Low']

type EditingCell = {
  ticketId: string
  field: 'title' | 'priority' | 'status' | 'assignee' | 'dueDate'
} | null

export function TicketsPage({ isAvailable, onAvailabilityChange, onViewTicket }: TicketsPageProps) {
  const [tickets, setTickets] = useState(mockTickets)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  const [editingCell, setEditingCell] = useState<EditingCell>(null)
  const [editingValue, setEditingValue] = useState('')
  const [isReasonModalOpen, setIsReasonModalOpen] = useState(false)
  const [pendingStatusChange, setPendingStatusChange] = useState<{
    ticketId: string
    status: string
  } | null>(null)
  const [openSelectCell, setOpenSelectCell] = useState<string | null>(null)
  
  // Modal states
  const [isCloneModalOpen, setIsCloneModalOpen] = useState(false)
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false)
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false)
  
  // Form states
  const [cloneForm, setCloneForm] = useState({
    company: '',
    site: '',
    summary: '',
    description: '',
    priority: 'Medium',
    type: 'Incident'
  })
  
  const [scheduleForm, setScheduleForm] = useState({
    startTime: '',
    endTime: '',
    type: 'Task',
    designation: 'Firm'
  })
  
  const [notesForm, setNotesForm] = useState({
    visibility: 'Public',
    notes: ''
  })

  // Auto-open select dropdown when editing starts for dropdown fields
  useEffect(() => {
    if (editingCell && ['priority', 'status', 'assignee'].includes(editingCell.field)) {
      const cellKey = `${editingCell.ticketId}-${editingCell.field}`
      setOpenSelectCell(cellKey)
    }
  }, [editingCell])

  const filteredTickets = tickets.filter(ticket =>
    ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.id.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical': return 'bg-red-500'
      case 'Emergency': return 'bg-red-500'
      case 'High': return 'bg-orange-500'
      case 'Medium': return 'bg-yellow-500'
      case 'Low': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  const getSlaColor = (status: string) => {
    switch (status) {
      case 'On Track': return 'text-green-600'
      case 'At Risk': return 'text-orange-600'
      case 'Breached': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const startEditing = (ticketId: string, field: EditingCell['field'], currentValue: string) => {
    setEditingCell({ ticketId, field })
    setEditingValue(currentValue)
  }

  const saveEdit = (withReason?: string) => {
    if (!editingCell) return

    setTickets(prev => prev.map(ticket => {
      if (ticket.id === editingCell.ticketId) {
        const updatedTicket = { ...ticket }
        switch (editingCell.field) {
          case 'title':
            updatedTicket.title = editingValue
            break
          case 'priority':
            updatedTicket.priority = editingValue as Ticket['priority']
            break
          case 'status':
            updatedTicket.status = editingValue as Ticket['status']
            if (withReason) {
              updatedTicket.reasonHistory = [
                ...(ticket.reasonHistory || []),
                {
                  status: editingValue,
                  reason: withReason,
                  timestamp: new Date().toISOString(),
                  user: 'Current User'
                }
              ]
            }
            break
          case 'assignee':
            updatedTicket.assignee = editingValue === 'Unassigned' ? undefined : editingValue
            break
          case 'dueDate':
            updatedTicket.dueDate = editingValue
            break
        }
        return updatedTicket
      }
      return ticket
    }))

    const reasonText = withReason ? ` (${withReason})` : ''
    toast.success(`Ticket ${editingCell.ticketId} updated successfully${reasonText}`)
    setEditingCell(null)
    setEditingValue('')
    setOpenSelectCell(null)
  }

  const cancelEdit = () => {
    setEditingCell(null)
    setEditingValue('')
    setOpenSelectCell(null)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      saveEdit()
    } else if (e.key === 'Escape') {
      cancelEdit()
    }
  }

  const handleStatusChange = (ticketId: string, newStatus: string) => {
    if (requiresReasonCode(newStatus)) {
      setPendingStatusChange({ ticketId, status: newStatus })
      setIsReasonModalOpen(true)
    } else {
      setTickets(prev => prev.map(ticket => 
        ticket.id === ticketId 
          ? { ...ticket, status: newStatus as any }
          : ticket
      ))
      toast.success(`Ticket ${ticketId} status changed to ${newStatus}`)
    }
  }

  const handleReasonSelection = (reason: string) => {
    if (pendingStatusChange) {
      setTickets(prev => prev.map(ticket => {
        if (ticket.id === pendingStatusChange.ticketId) {
          return {
            ...ticket,
            status: pendingStatusChange.status as any,
            reasonHistory: [
              ...(ticket.reasonHistory || []),
              {
                status: pendingStatusChange.status,
                reason,
                timestamp: new Date().toISOString(),
                user: 'Current User'
              }
            ]
          }
        }
        return ticket
      }))
      
      toast.success(`Ticket ${pendingStatusChange.ticketId} status changed to ${pendingStatusChange.status} (${reason})`)
      setPendingStatusChange(null)
    }
    setIsReasonModalOpen(false)
  }

  const isEditing = (ticketId: string, field: string) => {
    return editingCell?.ticketId === ticketId && editingCell?.field === field
  }

  const handleOpenInNewTab = (ticketId: string) => {
    window.open(`${window.location.origin}?ticket=${ticketId}`, '_blank')
    toast.success('Ticket opened in new tab')
  }

  const handlePriorityChange = (ticketId: string, newPriority: string) => {
    setTickets(prev => prev.map(ticket => 
      ticket.id === ticketId 
        ? { ...ticket, priority: newPriority as any }
        : ticket
    ))
    toast.success(`Ticket ${ticketId} priority changed to ${newPriority}`)
  }

  const handleAssignTicket = (ticketId: string, assignee: string) => {
    setTickets(prev => prev.map(ticket => 
      ticket.id === ticketId 
        ? { ...ticket, assignee }
        : ticket
    ))
    toast.success(`Ticket ${ticketId} assigned to ${assignee}`)
  }

  const handleCloneTicket = (ticket: Ticket) => {
    setSelectedTicket(ticket)
    setCloneForm({
      company: ticket.company || '',
      site: ticket.site || '',
      summary: ticket.title,
      description: `Cloned from ${ticket.id}`,
      priority: 'Medium',
      type: 'Incident'
    })
    setIsCloneModalOpen(true)
  }

  const handleAddSchedule = (ticket: Ticket) => {
    setSelectedTicket(ticket)
    setScheduleForm({
      startTime: '',
      endTime: '',
      type: 'Task',
      designation: 'Firm'
    })
    setIsScheduleModalOpen(true)
  }

  const handleUpdateNotes = (ticket: Ticket) => {
    setSelectedTicket(ticket)
    setNotesForm({
      visibility: 'Public',
      notes: ''
    })
    setIsNotesModalOpen(true)
  }

  const submitCloneTicket = () => {
    const newTicket: Ticket = {
      id: `TK-${String(tickets.length + 1).padStart(3, '0')}`,
      title: cloneForm.summary,
      priority: cloneForm.priority as any,
      status: 'Open',
      requester: 'Current User',
      created: new Date().toLocaleString(),
      dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      slaStatus: 'On Track',
      skills: selectedTicket?.skills || [],
      company: cloneForm.company,
      site: cloneForm.site,
      reasonHistory: []
    }
    
    setTickets(prev => [newTicket, ...prev])
    setIsCloneModalOpen(false)
    toast.success(`Ticket ${newTicket.id} created successfully`)
  }

  const submitSchedule = () => {
    if (selectedTicket) {
      toast.success(`Schedule added to ticket ${selectedTicket.id}`)
      setIsScheduleModalOpen(false)
    }
  }

  const submitNotes = () => {
    if (selectedTicket) {
      toast.success(`Notes updated for ticket ${selectedTicket.id}`)
      setIsNotesModalOpen(false)
    }
  }

  const renderEditableCell = (ticket: Ticket, field: EditingCell['field'], currentValue: string, displayValue: React.ReactNode) => {
    const cellKey = `${ticket.id}-${field}`
    const isSelectOpen = openSelectCell === cellKey

    if (isEditing(ticket.id, field)) {
      if (field === 'title') {
        return (
          <div className="flex items-center gap-1">
            <Input
              value={editingValue}
              onChange={(e) => setEditingValue(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={() => saveEdit()}
              className="h-7 text-sm"
              autoFocus
            />
            <Button size="sm" variant="ghost" onClick={() => saveEdit()} className="h-7 w-7 p-0">
              <Check className="h-3 w-3" />
            </Button>
            <Button size="sm" variant="ghost" onClick={cancelEdit} className="h-7 w-7 p-0">
              <X className="h-3 w-3" />
            </Button>
          </div>
        )
      } else if (field === 'priority') {
        return (
          <div className="flex items-center gap-1">
            <Select 
              value={editingValue} 
              onValueChange={setEditingValue} 
              open={isSelectOpen}
              onOpenChange={(open) => {
                if (!open) {
                  setOpenSelectCell(null)
                  saveEdit()
                }
              }}
            >
              <SelectTrigger className="h-7 text-sm w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {priorities.map((priority) => (
                  <SelectItem key={priority} value={priority}>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${getPriorityColor(priority)}`}></div>
                      {priority}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button size="sm" variant="ghost" onClick={cancelEdit} className="h-7 w-7 p-0">
              <X className="h-3 w-3" />
            </Button>
          </div>
        )
      } else if (field === 'status') {
        return (
          <div className="flex items-center gap-1">
            <Select 
              value={editingValue} 
              onValueChange={(value) => {
                if (requiresReasonCode(value)) {
                  setPendingStatusChange({ ticketId: ticket.id, status: value })
                  setIsReasonModalOpen(true)
                  setEditingCell(null)
                  setOpenSelectCell(null)
                } else {
                  setEditingValue(value)
                  saveEdit()
                }
              }} 
              open={isSelectOpen}
              onOpenChange={(open) => {
                if (!open && !pendingStatusChange) {
                  setOpenSelectCell(null)
                  saveEdit()
                }
              }}
            >
              <SelectTrigger className="h-7 text-sm w-28">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statuses.map((status) => (
                  <SelectItem key={status} value={status}>{status}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button size="sm" variant="ghost" onClick={cancelEdit} className="h-7 w-7 p-0">
              <X className="h-3 w-3" />
            </Button>
          </div>
        )
      } else if (field === 'assignee') {
        return (
          <div className="flex items-center gap-1">
            <Select 
              value={editingValue} 
              onValueChange={setEditingValue} 
              open={isSelectOpen}
              onOpenChange={(open) => {
                if (!open) {
                  setOpenSelectCell(null)
                  saveEdit()
                }
              }}
            >
              <SelectTrigger className="h-7 text-sm w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Unassigned">Unassigned</SelectItem>
                {technicians.map((tech) => (
                  <SelectItem key={tech} value={tech}>{tech}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button size="sm" variant="ghost" onClick={cancelEdit} className="h-7 w-7 p-0">
              <X className="h-3 w-3" />
            </Button>
          </div>
        )
      } else if (field === 'dueDate') {
        return (
          <div className="flex items-center gap-1">
            <Input
              type="datetime-local"
              value={editingValue}
              onChange={(e) => setEditingValue(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={() => saveEdit()}
              className="h-7 text-sm w-40"
              autoFocus
            />
            <Button size="sm" variant="ghost" onClick={() => saveEdit()} className="h-7 w-7 p-0">
              <Check className="h-3 w-3" />
            </Button>
            <Button size="sm" variant="ghost" onClick={cancelEdit} className="h-7 w-7 p-0">
              <X className="h-3 w-3" />
            </Button>
          </div>
        )
      }
    }

    return (
      <div 
        className="cursor-pointer hover:bg-muted/30 p-1 rounded transition-colors"
        onClick={(e) => {
          e.stopPropagation()
          startEditing(ticket.id, field, currentValue)
        }}
      >
        {displayValue}
      </div>
    )
  }

  const reasonConfig = pendingStatusChange ? getReasonCodeConfig(pendingStatusChange.status) : null

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1>Service Tickets</h1>
          <p className="text-muted-foreground">Track and manage all service tickets and assignments</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label htmlFor="availability" className="text-sm font-medium">
              Available for assignments
            </label>
            <Switch
              id="availability"
              checked={isAvailable}
              onCheckedChange={onAvailabilityChange}
            />
            <Badge variant={isAvailable ? "default" : "secondary"}>
              {isAvailable ? "Available" : "Not Available"}
            </Badge>
          </div>
          <Button>New Ticket</Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Tickets</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">Tickets awaiting assignment</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Past Due</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">Tickets past their due date</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scheduled Today</CardTitle>
            <Calendar className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">Tickets scheduled for today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Tickets</CardTitle>
            <User className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">Tickets assigned to you</p>
          </CardContent>
        </Card>
      </div>

      {/* Tickets Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Tickets</CardTitle>
              <CardDescription>Complete list of service tickets in the system</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tickets..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-64"
                />
              </div>
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Ticket ID</th>
                  <th className="text-left p-2">Title</th>
                  <th className="text-left p-2">Priority</th>
                  <th className="text-left p-2">Status</th>
                  <th className="text-left p-2">Assignee</th>
                  <th className="text-left p-2">Requester</th>
                  <th className="text-left p-2">Due Date</th>
                  <th className="text-left p-2">SLA Status</th>
                  <th className="text-left p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTickets.map((ticket) => (
                  <ContextMenu key={ticket.id}>
                    <ContextMenuTrigger asChild>
                      <tr className="border-b hover:bg-muted/50">
                        <td className="p-2 font-medium">
                          <button 
                            onClick={() => onViewTicket(ticket.id)}
                            className="text-blue-600 hover:text-blue-800 hover:underline"
                          >
                            {ticket.id}
                          </button>
                        </td>
                        <td className="p-2">
                          <div>
                            {renderEditableCell(
                              ticket,
                              'title',
                              ticket.title,
                              <div className="font-medium">{ticket.title}</div>
                            )}
                            <div className="flex gap-1 mt-1">
                              {ticket.skills.map(skill => (
                                <Badge key={skill} variant="outline" className="text-xs">{skill}</Badge>
                              ))}
                            </div>
                          </div>
                        </td>
                        <td className="p-2">
                          {renderEditableCell(
                            ticket,
                            'priority',
                            ticket.priority,
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${getPriorityColor(ticket.priority)}`}></div>
                              {ticket.priority}
                            </div>
                          )}
                        </td>
                        <td className="p-2">
                          {renderEditableCell(
                            ticket,
                            'status',
                            ticket.status,
                            <Badge variant="secondary">{ticket.status}</Badge>
                          )}
                        </td>
                        <td className="p-2">
                          {renderEditableCell(
                            ticket,
                            'assignee',
                            ticket.assignee || 'Unassigned',
                            <span>{ticket.assignee || 'Unassigned'}</span>
                          )}
                        </td>
                        <td className="p-2">{ticket.requester}</td>
                        <td className="p-2">
                          {renderEditableCell(
                            ticket,
                            'dueDate',
                            ticket.dueDate,
                            <span>{formatDate(ticket.dueDate)}</span>
                          )}
                        </td>
                        <td className="p-2">
                          <span className={getSlaColor(ticket.slaStatus)}>{ticket.slaStatus}</span>
                        </td>
                        <td className="p-2">
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm" onClick={() => onViewTicket(ticket.id)}>
                              View
                            </Button>
                            <Button variant="ghost" size="sm">Edit</Button>
                          </div>
                        </td>
                      </tr>
                    </ContextMenuTrigger>
                    <ContextMenuContent className="w-64">
                      <ContextMenuItem onClick={() => handleOpenInNewTab(ticket.id)}>
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Open ticket in New Tab
                      </ContextMenuItem>
                      
                      <ContextMenuSeparator />
                      
                      <ContextMenuSub>
                        <ContextMenuSubTrigger>
                          <Edit className="w-4 h-4 mr-2" />
                          Change Status
                        </ContextMenuSubTrigger>
                        <ContextMenuSubContent className="w-48">
                          {statuses.map((status) => (
                            <ContextMenuItem 
                              key={status}
                              onClick={() => handleStatusChange(ticket.id, status)}
                            >
                              {status}
                            </ContextMenuItem>
                          ))}
                        </ContextMenuSubContent>
                      </ContextMenuSub>

                      <ContextMenuItem onClick={() => handleCloneTicket(ticket)}>
                        <Copy className="w-4 h-4 mr-2" />
                        Clone Ticket
                      </ContextMenuItem>

                      <ContextMenuSub>
                        <ContextMenuSubTrigger>
                          <AlertCircle className="w-4 h-4 mr-2" />
                          Change Priority
                        </ContextMenuSubTrigger>
                        <ContextMenuSubContent className="w-48">
                          {priorities.map((priority) => (
                            <ContextMenuItem 
                              key={priority}
                              onClick={() => handlePriorityChange(ticket.id, priority)}
                            >
                              <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${getPriorityColor(priority)}`}></div>
                                {priority}
                              </div>
                            </ContextMenuItem>
                          ))}
                        </ContextMenuSubContent>
                      </ContextMenuSub>

                      <ContextMenuItem onClick={() => handleAddSchedule(ticket)}>
                        <CalendarPlus className="w-4 h-4 mr-2" />
                        Add Schedule
                      </ContextMenuItem>

                      <ContextMenuItem onClick={() => handleUpdateNotes(ticket)}>
                        <FileText className="w-4 h-4 mr-2" />
                        Update Notes
                      </ContextMenuItem>

                      <ContextMenuSub>
                        <ContextMenuSubTrigger>
                          <UserCheck className="w-4 h-4 mr-2" />
                          Assign Ticket
                        </ContextMenuSubTrigger>
                        <ContextMenuSubContent className="w-48">
                          {technicians.map((tech) => (
                            <ContextMenuItem 
                              key={tech}
                              onClick={() => handleAssignTicket(ticket.id, tech)}
                            >
                              {tech}
                            </ContextMenuItem>
                          ))}
                        </ContextMenuSubContent>
                      </ContextMenuSub>
                    </ContextMenuContent>
                  </ContextMenu>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Reason Code Modal */}
      {reasonConfig && (
        <ReasonCodeModal
          isOpen={isReasonModalOpen}
          onClose={() => {
            setIsReasonModalOpen(false)
            setPendingStatusChange(null)
          }}
          onSelectReason={handleReasonSelection}
          status={pendingStatusChange?.status || ''}
          prompt={reasonConfig.prompt}
          options={reasonConfig.options}
        />
      )}

      {/* Clone Ticket Modal */}
      {isCloneModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md space-y-4">
            <div>
              <h2 className="text-lg font-medium">Clone Ticket</h2>
              <p className="text-sm text-muted-foreground">
                Create a new ticket based on {selectedTicket?.id}
              </p>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="company">Company</Label>
                <Input
                  id="company"
                  value={cloneForm.company}
                  onChange={(e) => setCloneForm(prev => ({ ...prev, company: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="site">Site</Label>
                <Input
                  id="site"
                  value={cloneForm.site}
                  onChange={(e) => setCloneForm(prev => ({ ...prev, site: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="summary">Summary</Label>
                <Input
                  id="summary"
                  value={cloneForm.summary}
                  onChange={(e) => setCloneForm(prev => ({ ...prev, summary: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={cloneForm.description}
                  onChange={(e) => setCloneForm(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select value={cloneForm.priority} onValueChange={(value) => setCloneForm(prev => ({ ...prev, priority: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {priorities.map((priority) => (
                      <SelectItem key={priority} value={priority}>{priority}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setIsCloneModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={submitCloneTicket}>Create Ticket</Button>
            </div>
          </div>
        </div>
      )}

      {/* Add Schedule Modal */}
      {isScheduleModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md space-y-4">
            <div>
              <h2 className="text-lg font-medium">Add Schedule</h2>
              <p className="text-sm text-muted-foreground">
                Schedule work for ticket {selectedTicket?.id}
              </p>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="startTime">Start Time</Label>
                <Input
                  id="startTime"
                  type="datetime-local"
                  value={scheduleForm.startTime}
                  onChange={(e) => setScheduleForm(prev => ({ ...prev, startTime: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="endTime">End Time</Label>
                <Input
                  id="endTime"
                  type="datetime-local"
                  value={scheduleForm.endTime}
                  onChange={(e) => setScheduleForm(prev => ({ ...prev, endTime: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="type">Type</Label>
                <Select value={scheduleForm.type} onValueChange={(value) => setScheduleForm(prev => ({ ...prev, type: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Call">Call</SelectItem>
                    <SelectItem value="Task">Task</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="designation">Designation</Label>
                <Select value={scheduleForm.designation} onValueChange={(value) => setScheduleForm(prev => ({ ...prev, designation: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Firm">Firm</SelectItem>
                    <SelectItem value="Tentative">Tentative</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setIsScheduleModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={submitSchedule}>Add Schedule</Button>
            </div>
          </div>
        </div>
      )}

      {/* Update Notes Modal */}
      {isNotesModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md space-y-4">
            <div>
              <h2 className="text-lg font-medium">Update Notes</h2>
              <p className="text-sm text-muted-foreground">
                Add notes to ticket {selectedTicket?.id}
              </p>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="visibility">Note Visibility</Label>
                <Select value={notesForm.visibility} onValueChange={(value) => setNotesForm(prev => ({ ...prev, visibility: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Public">Public</SelectItem>
                    <SelectItem value="Internal">Internal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Enter your notes here..."
                  value={notesForm.notes}
                  onChange={(e) => setNotesForm(prev => ({ ...prev, notes: e.target.value }))}
                  className="min-h-24"
                />
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setIsNotesModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={submitNotes}>Update Notes</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}