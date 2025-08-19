import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { SchedulingWidget } from './SchedulingWidget'
import { ReasonCodeModal } from './ReasonCodeModal'
import { requiresReasonCode, getReasonCodeConfig } from './reasonCodes'
import { 
  ArrowLeft, 
  Clock, 
  User, 
  Calendar,
  AlertTriangle,
  Phone,
  Mail,
  Building,
  Edit,
  Send,
  Paperclip,
  MoreVertical
} from 'lucide-react'
import { toast } from 'sonner@2.0.3'

interface TicketDetailPageProps {
  ticketId: string | null
  onBack: () => void
}

interface Comment {
  id: string
  author: string
  role: string
  content: string
  timestamp: string
  avatar?: string
}

interface TicketDetail {
  id: string
  title: string
  status: 'New' | 'Open' | 'In Progress' | 'Assigned' | 'Approval/Info Needed' | 'Resolved' | 'Awaiting Response' | 'Scheduled' | 'Closed'
  priority: 'Low' | 'Medium' | 'High' | 'Critical'
  impact: string
  urgency: string
  dueDate: string
  slaStatus: 'On Track' | 'At Risk' | 'Breached'
  requester: {
    name: string
    email: string
    phone: string
    company: string
  }
  assignee: {
    name: string
    role: string
  }
  skills: string[]
  description: string
  category: string
  subcategory: string
  comments: Comment[]
  reasonHistory: Array<{
    status: string
    reason: string
    timestamp: string
    user: string
  }>
}

const mockTicketData: TicketDetail = {
  id: 'TK-001',
  title: 'Workstation Updates - Returning Employee',
  status: 'New',
  priority: 'High',
  impact: 'Medium',
  urgency: 'Medium',
  dueDate: '2024-01-15T14:00',
  slaStatus: 'At Risk',
  requester: {
    name: 'Alfreda Hojelse',
    email: 'alfreda.hojelse@company.com',
    phone: '+1 (555) 123-4567',
    company: 'Acme Corporation'
  },
  assignee: {
    name: 'Sarah Johnson',
    role: 'Senior Technician'
  },
  skills: ['Active Directory', 'Windows', 'Software Deployment'],
  description: 'Employee returning from extended leave requires workstation updates and access restoration.',
  category: 'Hardware',
  subcategory: 'Desktop Support',
  reasonHistory: [],
  comments: [
    {
      id: 'comment-1',
      author: 'Dustin Valdez',
      role: 'Technician',
      content: 'Work in progress on this onboarding\n- Reached out to Demandium\n- Was not available to work with us, but allowed us access to work on the machine\n- Attempting to remote software for onboarding',
      timestamp: '7/23/2025 15:21 PM'
    },
    {
      id: 'comment-2',
      author: 'Dustin Valdez',
      role: 'Technician',
      content: 'Work in progress on this onboarding\n- Reached out to Demandium\n- Was not available to work with us, but allowed us access to work on the machine\n- Attempting to remote software for onboarding',
      timestamp: '7/23/2025 15:21 PM'
    },
    {
      id: 'comment-3',
      author: 'Will D',
      role: 'Technician',
      content: 'Hello,\n\nWe\'ve recently assisted a returning employee, and need to get her set back up in the system.\nCan you create a new workstation, and reactivate the licenses for Demandium Plus? Did some basic set up to run\nafter doing a trial run with another company, and we\'re limited to have her back.',
      timestamp: '7/23/2025 3:18 PM'
    }
  ]
}

const statuses = ['New', 'In Progress', 'Assigned', 'Approval/Info Needed', 'Resolved', 'Awaiting Response', 'Scheduled', 'Closed']
const priorities = ['Low', 'Medium', 'High', 'Critical']

export function TicketDetailPage({ ticketId, onBack }: TicketDetailPageProps) {
  const [ticket, setTicket] = useState(mockTicketData)
  const [newComment, setNewComment] = useState('')
  const [editingField, setEditingField] = useState<string | null>(null)
  const [tempValue, setTempValue] = useState('')
  const [isReasonModalOpen, setIsReasonModalOpen] = useState(false)
  const [pendingStatusChange, setPendingStatusChange] = useState<string | null>(null)

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical': return 'bg-red-500'
      case 'High': return 'bg-orange-500'
      case 'Medium': return 'bg-yellow-500'
      case 'Low': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'New': return 'bg-blue-100 text-blue-800'
      case 'Open': return 'bg-gray-100 text-gray-800'
      case 'In Progress': return 'bg-yellow-100 text-yellow-800'
      case 'Assigned': return 'bg-purple-100 text-purple-800'
      case 'Approval/Info Needed': return 'bg-orange-100 text-orange-800'
      case 'Resolved': return 'bg-green-100 text-green-800'
      case 'Awaiting Response': return 'bg-red-100 text-red-800'
      case 'Scheduled': return 'bg-indigo-100 text-indigo-800'
      case 'Closed': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getSlaColor = (status: string) => {
    switch (status) {
      case 'On Track': return 'bg-green-100 text-green-800'
      case 'At Risk': return 'bg-orange-100 text-orange-800'
      case 'Breached': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleStatusChange = (newStatus: string, reason?: string) => {
    setTicket(prev => {
      const updatedTicket = { ...prev, status: newStatus as any }
      
      if (reason) {
        updatedTicket.reasonHistory = [
          ...prev.reasonHistory,
          {
            status: newStatus,
            reason,
            timestamp: new Date().toISOString(),
            user: 'Current User'
          }
        ]
      }
      
      return updatedTicket
    })

    const reasonText = reason ? ` (${reason})` : ''
    toast.success(`Ticket status changed to ${newStatus}${reasonText}`)
  }

  const handleFieldChange = (field: string, value: string) => {
    if (field === 'status' && requiresReasonCode(value)) {
      setPendingStatusChange(value)
      setIsReasonModalOpen(true)
      return
    }

    setTicket(prev => ({ ...prev, [field]: value }))
    setEditingField(null)
    toast.success(`Ticket ${field} updated successfully`)
  }

  const handleReasonSelection = (reason: string) => {
    if (pendingStatusChange) {
      handleStatusChange(pendingStatusChange, reason)
      setPendingStatusChange(null)
    }
    setIsReasonModalOpen(false)
  }

  const startEditing = (field: string, currentValue: string) => {
    setEditingField(field)
    setTempValue(currentValue)
  }

  const saveEdit = (field: string) => {
    handleFieldChange(field, tempValue)
  }

  const cancelEdit = () => {
    setEditingField(null)
    setTempValue('')
  }

  const handleAddComment = () => {
    if (newComment.trim()) {
      // Add comment logic here
      setNewComment('')
    }
  }

  const renderEditableField = (field: string, currentValue: string, displayValue: React.ReactNode, options?: string[]) => {
    if (editingField === field) {
      if (options) {
        return (
          <Select 
            value={tempValue} 
            onValueChange={(value) => {
              setTempValue(value)
              if (field === 'status' && requiresReasonCode(value)) {
                setPendingStatusChange(value)
                setIsReasonModalOpen(true)
                setEditingField(null)
              } else {
                handleFieldChange(field, value)
              }
            }}
            open={true}
            onOpenChange={(open) => {
              if (!open && !pendingStatusChange) {
                setEditingField(null)
              }
            }}
          >
            <SelectTrigger className="h-7 text-sm w-auto min-w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option} value={option}>{option}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )
      } else if (field === 'dueDate') {
        return (
          <Input
            type="datetime-local"
            value={tempValue}
            onChange={(e) => setTempValue(e.target.value)}
            onBlur={() => saveEdit(field)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') saveEdit(field)
              if (e.key === 'Escape') cancelEdit()
            }}
            className="h-7 text-sm w-40"
            autoFocus
          />
        )
      }
    }

    return (
      <button
        onClick={() => startEditing(field, currentValue)}
        className="hover:bg-muted/50 px-2 py-1 rounded transition-colors"
      >
        {displayValue}
      </button>
    )
  }

  const reasonConfig = pendingStatusChange ? getReasonCodeConfig(pendingStatusChange) : null

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Tickets
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h1>Ticket #{ticket.id} - {ticket.title}</h1>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>Tickets / #{ticket.id}</span>
          </div>
        </div>
        <Button variant="outline" size="sm">
          <Edit className="w-4 h-4 mr-2" />
          Edit View
        </Button>
      </div>

      {/* Editable Status Bar */}
      <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Resources</span>
          <Badge className="bg-blue-100 text-blue-800">Help Desk</Badge>
          <Badge className="bg-green-100 text-green-800">IT</Badge>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Contact</span>
          <Badge className="bg-blue-100 text-blue-800">Not Assigned</Badge>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Status</span>
          {renderEditableField(
            'status',
            ticket.status,
            <Badge className={getStatusColor(ticket.status)}>{ticket.status}</Badge>,
            statuses
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Priority</span>
          {renderEditableField(
            'priority',
            ticket.priority,
            <div className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${getPriorityColor(ticket.priority)}`}></div>
              <span className="text-sm">{ticket.priority}</span>
            </div>,
            priorities
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Due Date</span>
          {renderEditableField(
            'dueDate',
            ticket.dueDate,
            <span className="text-sm">{formatDateTime(ticket.dueDate)}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">SLA Status</span>
          <Badge className={getSlaColor(ticket.slaStatus)}>{ticket.slaStatus}</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Responses Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <span>Responses</span>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-normal text-muted-foreground">Customer Updated</span>
                  </div>
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Reason History */}
              {ticket.reasonHistory.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium mb-2">Status History</h4>
                  <div className="space-y-2">
                    {ticket.reasonHistory.map((entry, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm p-2 bg-muted/30 rounded">
                        <Badge variant="outline">{entry.status}</Badge>
                        <span>-</span>
                        <span>{entry.reason}</span>
                        <span className="text-muted-foreground">by {entry.user}</span>
                        <span className="text-muted-foreground">{new Date(entry.timestamp).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {ticket.comments.map((comment, index) => (
                <div key={comment.id} className="flex gap-3 p-4 border rounded-lg">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={comment.avatar} />
                    <AvatarFallback>{comment.author.slice(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium">{comment.author}</span>
                      <Badge variant="secondary" className="text-xs">{comment.role}</Badge>
                      <span className="text-sm text-muted-foreground">{comment.timestamp}</span>
                    </div>
                    <div className="text-sm whitespace-pre-line">
                      {comment.content}
                    </div>
                  </div>
                </div>
              ))}

              {/* Add Comment */}
              <div className="border-t pt-4">
                <div className="space-y-3">
                  <Textarea
                    placeholder="Add a response..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="min-h-24"
                  />
                  <div className="flex items-center justify-between">
                    <Button variant="outline" size="sm">
                      <Paperclip className="w-4 h-4 mr-2" />
                      Attach File
                    </Button>
                    <Button onClick={handleAddComment}>
                      <Send className="w-4 h-4 mr-2" />
                      Send Response
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Scheduling Widget */}
          <SchedulingWidget ticketId={ticket.id} />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Ticket Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Ticket Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Summary</label>
                <p className="text-sm mt-1">{ticket.title}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">Ticket Owner</label>
                <p className="text-sm mt-1">{ticket.requester.name}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Agreement</label>
                <p className="text-sm mt-1">Standard SLA</p>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Billable Hours</label>
                <p className="text-sm mt-1">2.5 hours</p>
              </div>
            </CardContent>
          </Card>

          {/* Ticket Details */}
          <Card>
            <CardHeader>
              <CardTitle>Ticket #{ticket.id}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Service Board</label>
                <Select defaultValue="helpdesk">
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="helpdesk">Help Desk</SelectItem>
                    <SelectItem value="infrastructure">Infrastructure</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Priority</label>
                <Select value={ticket.priority} onValueChange={(value) => handleFieldChange('priority', value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Type</label>
                <Select defaultValue="incident">
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="incident">Incident</SelectItem>
                    <SelectItem value="request">Service Request</SelectItem>
                    <SelectItem value="change">Change</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Status</label>
                <Select value={ticket.status} onValueChange={(value) => handleFieldChange('status', value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statuses.map(status => (
                      <SelectItem key={status} value={status}>{status}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Assigned Technician</label>
                <Select defaultValue="sarah">
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sarah">Sarah Johnson</SelectItem>
                    <SelectItem value="david">David Chen</SelectItem>
                    <SelectItem value="mike">Mike Wilson</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Contact</label>
                <p className="text-sm mt-1">{ticket.requester.name}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Phone</label>
                <div className="flex items-center gap-2 mt-1">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{ticket.requester.phone}</span>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Email</label>
                <div className="flex items-center gap-2 mt-1">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{ticket.requester.email}</span>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Company</label>
                <div className="flex items-center gap-2 mt-1">
                  <Building className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{ticket.requester.company}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Access */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Access</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start">
                Details
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                Audit Trail
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                Attachments (0)
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                Expenses (0)
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Reason Code Modal */}
      {reasonConfig && (
        <ReasonCodeModal
          isOpen={isReasonModalOpen}
          onClose={() => {
            setIsReasonModalOpen(false)
            setPendingStatusChange(null)
          }}
          onSelectReason={handleReasonSelection}
          status={pendingStatusChange || ''}
          prompt={reasonConfig.prompt}
          options={reasonConfig.options}
        />
      )}
    </div>
  )
}