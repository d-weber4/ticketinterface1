import { useState } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Badge } from './ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import { 
  Search, 
  Settings, 
  Bell, 
  CheckCircle, 
  X,
} from 'lucide-react'
import { toast } from 'sonner'

interface Notification {
  id: string
  type: 'ticket_assignment' | 'system' | 'reminder'
  title: string
  message: string
  timestamp: string
  ticketId?: string
  ticketTitle?: string
  dueDate?: string
  skills?: string[]
  read: boolean
}

interface TopToolbarProps {
  notifications: Notification[]
  onAcceptAssignment: (notificationId: string) => void
  onDeclineAssignment: (notificationId: string) => void
  onMarkAsRead: (notificationId: string) => void
}

export function TopToolbar({ 
  notifications, 
  onAcceptAssignment, 
  onDeclineAssignment, 
}: TopToolbarProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)

  const unreadCount = notifications.filter(n => !n.read).length

  const handleAccept = (notificationId: string) => {
    onAcceptAssignment(notificationId)
    setIsNotificationsOpen(false)
    toast.success('Ticket assignment accepted')
  }

  const handleDecline = (notificationId: string) => {
    onDeclineAssignment(notificationId)
    setIsNotificationsOpen(false)
    toast.warning('Ticket assignment declined and reassigned')
  }

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours}h ago`
    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays}d ago`
  }

  return (
    <div className="h-16 bg-white border-b border-border flex items-center justify-between px-6">
      {/* Left Side - Search */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search tickets, technicians, or anything..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-input-background border-0 focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      {/* Right Side - Actions and Profile */}
      <div className="flex items-center gap-3">
        {/* Notifications */}
        <Popover open={isNotificationsOpen} onOpenChange={setIsNotificationsOpen}>
          <PopoverTrigger>
            <div className="relative inline-flex items-center justify-center h-9 w-9 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer">
              <Bell className={`w-5 h-5 ${unreadCount > 0 ? 'text-red-500' : 'text-muted-foreground'}`} />
              {unreadCount > 0 && (
                <Badge 
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-white text-xs"
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Badge>
              )}
            </div>
          </PopoverTrigger>
          <PopoverContent className="w-96 p-0" align="end">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Notifications</h3>
                {unreadCount > 0 && (
                  <Badge variant="secondary">{unreadCount} new</Badge>
                )}
              </div>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No notifications</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {notifications.map((notification) => (
                    <div 
                      key={notification.id}
                      className={`p-4 hover:bg-muted/50 ${!notification.read ? 'bg-blue-50' : ''}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-sm">{notification.title}</h4>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {notification.message}
                          </p>
                          
                          {notification.type === 'ticket_assignment' && (
                            <div className="space-y-2">
                              <div className="text-xs text-muted-foreground">
                                <p>Ticket: {notification.ticketId}</p>
                                <p>Due: {notification.dueDate}</p>
                                {notification.skills && (
                                  <div className="flex gap-1 mt-1">
                                    {notification.skills.map(skill => (
                                      <Badge key={skill} variant="outline" className="text-xs">
                                        {skill}
                                      </Badge>
                                    ))}
                                  </div>
                                )}
                              </div>
                              <div className="flex gap-2">
                                <Button 
                                  size="sm" 
                                  className="h-7 text-xs"
                                  onClick={() => handleAccept(notification.id)}
                                >
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Accept
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="h-7 text-xs"
                                  onClick={() => handleDecline(notification.id)}
                                >
                                  <X className="w-3 h-3 mr-1" />
                                  Decline
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground whitespace-nowrap">
                          {formatTimeAgo(notification.timestamp)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {notifications.length > 0 && (
              <div className="p-4 border-t">
                <Button variant="ghost" size="sm" className="w-full">
                  View all notifications
                </Button>
              </div>
            )}
          </PopoverContent>
        </Popover>

        {/* Settings */}
        <Button variant="ghost" size="sm">
          <Settings className="w-5 h-5 text-muted-foreground" />
        </Button>

        {/* Profile */}
        <div className="flex items-center gap-3">
          <div className="text-right text-sm">
            <p className="font-medium">Sarah Johnson</p>
            <p className="text-muted-foreground text-xs">Senior Technician</p>
          </div>
          <Avatar className="h-8 w-8">
            <AvatarImage src="https://images.unsplash.com/photo-1494790108755-2616b612b188?w=32&h=32&fit=crop&crop=face" />
            <AvatarFallback>SJ</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </div>
  )
}