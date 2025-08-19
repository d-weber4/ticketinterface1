import { Button } from './ui/button'
import { 
  LayoutDashboard, 
  FileText, 
  Settings, 
  BarChart3,
  Ticket,
  Route,
  ChevronRight
} from 'lucide-react'

interface SidebarProps {
  currentPage: string
  onPageChange: (page: string) => void
}

export function Sidebar({ currentPage, onPageChange }: SidebarProps) {
  const menuItems = [
    {
      title: 'NAVIGATION',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      ]
    },
    {
      title: 'SERVICE DELIVERY',
      items: [
        { id: 'tickets', label: 'Tickets', icon: Ticket },
        { id: 'routing', label: 'Ticket Routing', icon: Route },
        { id: 'reports', label: 'Ticket Reports', icon: BarChart3 },
      ]
    }
  ]

  return (
    <div className="w-64 bg-[#4A5CB8] text-white flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white rounded flex items-center justify-center">
            <span className="text-[#4A5CB8] font-bold">TM</span>
          </div>
          <div>
            <h2 className="font-medium">Ticket Management</h2>
            <p className="text-xs text-white/70">Platform</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-6">
        {menuItems.map((section) => (
          <div key={section.title}>
            <h3 className="text-xs font-medium text-white/60 uppercase tracking-wider mb-3">
              {section.title}
            </h3>
            <div className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon
                const isActive = currentPage === item.id
                
                return (
                  <Button
                    key={item.id}
                    variant="ghost"
                    className={`w-full justify-start text-white hover:bg-white/10 ${
                      isActive ? 'bg-white/10' : ''
                    }`}
                    onClick={() => onPageChange(item.id)}
                  >
                    <Icon className="w-4 h-4 mr-3" />
                    {item.label}
                    {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
                  </Button>
                )
              })}
            </div>
          </div>
        ))}
      </nav>
    </div>
  )
}