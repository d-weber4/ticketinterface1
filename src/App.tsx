import { useState, useEffect } from 'react'
import { Sidebar } from './components/Sidebar'
import { TopToolbar } from './components/TopToolbar'
import { TicketsPage } from './components/TicketsPage'
import { TicketDetailPage } from './components/TicketDetailPage'
import { ConfigurationPage } from './components/ConfigurationPage'
import { ReportsPage } from './components/ReportsPage'
import { Toaster } from './components/ui/sonner'

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

export default function App() {
  const [currentPage, setCurrentPage] = useState('tickets')
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null)
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 'notif-1',
      type: 'system',
      title: 'System Maintenance',
      message: 'Scheduled maintenance will begin at 2:00 AM tonight',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      read: false
    }
  ])
  const [isAvailable, setIsAvailable] = useState(true)

  // Simulate receiving ticket assignment notifications
  useEffect(() => {
    if (isAvailable) {
      const timer = setTimeout(() => {
        const newNotification: Notification = {
          id: `notif-${Date.now()}`,
          type: 'ticket_assignment',
          title: 'New Ticket Assignment',
          message: 'A ticket has been automatically assigned to you',
          timestamp: new Date().toISOString(),
          ticketId: 'TK-001',
          ticketTitle: 'Password Reset - Acme Corp',
          dueDate: '2024-01-15 2:00 PM',
          skills: ['Active Directory', 'Windows'],
          read: false
        }
        
        setNotifications(prev => [newNotification, ...prev])
      }, 5000)
      
      return () => clearTimeout(timer)
    }
  }, [isAvailable])

  const handleAcceptAssignment = (notificationId: string) => {
    const notification = notifications.find(n => n.id === notificationId)
    if (notification && notification.ticketId) {
      setSelectedTicketId(notification.ticketId)
      setCurrentPage('ticket-detail')
    }
    
    setNotifications(prev => prev.map(notif => 
      notif.id === notificationId 
        ? { ...notif, read: true }
        : notif
    ))
  }

  const handleDeclineAssignment = (notificationId: string) => {
    setNotifications(prev => prev.map(notif => 
      notif.id === notificationId 
        ? { ...notif, read: true }
        : notif
    ))
  }

  const handleMarkAsRead = (notificationId: string) => {
    setNotifications(prev => prev.map(notif => 
      notif.id === notificationId 
        ? { ...notif, read: true }
        : notif
    ))
  }

  const handleViewTicket = (ticketId: string) => {
    setSelectedTicketId(ticketId)
    setCurrentPage('ticket-detail')
  }

  const handleBackToTickets = () => {
    setCurrentPage('tickets')
    setSelectedTicketId(null)
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'tickets':
        return <TicketsPage 
          isAvailable={isAvailable} 
          onAvailabilityChange={setIsAvailable}
          onViewTicket={handleViewTicket}
        />
      case 'ticket-detail':
        return <TicketDetailPage 
          ticketId={selectedTicketId} 
          onBack={handleBackToTickets}
        />
      case 'routing':
        return <ConfigurationPage />
      case 'reports':
        return <ReportsPage />
      default:
        return <TicketsPage 
          isAvailable={isAvailable} 
          onAvailabilityChange={setIsAvailable}
          onViewTicket={handleViewTicket}
        />
    }
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar currentPage={currentPage === 'ticket-detail' ? 'tickets' : currentPage} onPageChange={setCurrentPage} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopToolbar 
          notifications={notifications}
          onAcceptAssignment={handleAcceptAssignment}
          onDeclineAssignment={handleDeclineAssignment}
          onMarkAsRead={handleMarkAsRead}
        />
        <main className="flex-1 overflow-auto">
          {renderPage()}
        </main>
      </div>
      <Toaster />
    </div>
  )
}