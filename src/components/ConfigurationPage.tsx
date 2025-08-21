import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Switch } from './ui/switch'
import { Input } from './ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Badge } from './ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import { DndProvider, useDrag, useDrop } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { 
  Settings, 
  Users, 
  Clock, 
  Zap,
  Plus,
  X,
  Edit,
  Save,
  AlertCircle,
  GripVertical,
  Trash2
} from 'lucide-react'
import { toast } from 'sonner'

interface Technician {
  id: string
  name: string
  email: string
  status: 'Online' | 'Offline'
  available: boolean
  skills: string[]
  roles: string[]
  specialties: string[]
}

interface AssignmentPriorityItem {
  id: string
  label: string
  enabled: boolean
}

interface OverrideRule {
  id: string
  name: string
  enabled: boolean
  conditions: Array<{
    field: string
    operator: string
    value: string
    logicalOperator?: 'AND' | 'OR'
  }>
  actions: Array<{
    type: string
    parameter: string
    value: string
  }>
}

const mockTechnicians: Technician[] = [
  {
    id: 'tech-1',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@company.com',
    status: 'Online',
    available: true,
    skills: ['Windows', 'Active Directory', 'Software Deployment'],
    roles: ['Senior Technician'],
    specialties: ['Identity Management', 'System Administration']
  },
  {
    id: 'tech-2',
    name: 'David Chen',
    email: 'david.chen@company.com',
    status: 'Online',
    available: true,
    skills: ['Networking', 'Router Configuration', 'Cisco', 'Firewall'],
    roles: ['Network Specialist'],
    specialties: ['Network Infrastructure', 'Security']
  },
  {
    id: 'tech-3',
    name: 'Mike Wilson',
    email: 'mike.wilson@company.com',
    status: 'Offline',
    available: false,
    skills: ['Hardware', 'Desktop Support', 'Printer'],
    roles: ['Field Technician'],
    specialties: ['Hardware Repair', 'On-site Support']
  }
]

const initialPriorityItems: AssignmentPriorityItem[] = [
  { id: 'firm-scheduled', label: 'Firm Scheduled Tickets', enabled: true },
  { id: 'tentative-scheduled', label: 'Tentative Scheduled Tickets', enabled: true },
  { id: 'emergency', label: 'Emergency Priority', enabled: true },
  { id: 'high', label: 'High Priority', enabled: true },
  { id: 'medium', label: 'Medium Priority', enabled: true },
  { id: 'low', label: 'Low Priority', enabled: true },
  { id: 'sla-breach', label: 'SLA Breach', enabled: true },
  { id: 'sla-hour', label: 'SLA <1 hour', enabled: true }
]

const conditionFields = [
  'Ticket Schedule Time',
  'Current Date/Time',
  'Priority Level',
  'SLA Status',
  'Due Date',
  'Technician Availability',
  'Skill Match',
  'Workload'
]

const operators = [
  { value: '>', label: 'Greater than' },
  { value: '<', label: 'Less than' },
  { value: '=', label: 'Equals' },
  { value: '!=', label: 'Not equals' },
  { value: '>=', label: 'Greater than or equal' },
  { value: '<=', label: 'Less than or equal' },
  { value: 'contains', label: 'Contains' },
  { value: 'not_contains', label: 'Does not contain' }
]

const actionTypes = [
  'Assign Ticket',
  'Set Status',
  'Set Priority',
  'Send Notification',
  'Escalate',
  'Add Note'
]

function DragDropAssignmentPriority({ 
  items, 
  setItems 
}: { 
  items: AssignmentPriorityItem[]
  setItems: (items: AssignmentPriorityItem[]) => void 
}) {
  const moveItem = (dragIndex: number, hoverIndex: number) => {
    const draggedItem = items[dragIndex]
    const newItems = [...items]
    newItems.splice(dragIndex, 1)
    newItems.splice(hoverIndex, 0, draggedItem)
    setItems(newItems)
  }

  const toggleItem = (id: string) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, enabled: !item.enabled } : item
    ))
  }

  return (
    <div className="space-y-2">
      {items.map((item, index) => (
        <DraggableItem
          key={item.id}
          item={item}
          index={index}
          moveItem={moveItem}
          toggleItem={toggleItem}
        />
      ))}
    </div>
  )
}

function DraggableItem({ 
  item, 
  index, 
  moveItem, 
  toggleItem 
}: {
  item: AssignmentPriorityItem
  index: number
  moveItem: (dragIndex: number, hoverIndex: number) => void
  toggleItem: (id: string) => void
}) {
  const [{ isDragging }, drag] = useDrag({
    type: 'assignment-priority',
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  })

  const [, drop] = useDrop({
    accept: 'assignment-priority',
    hover: (draggedItem: { index: number }) => {
      if (draggedItem.index !== index) {
        moveItem(draggedItem.index, index)
        draggedItem.index = index
      }
    },
  })

  return (
    <div
      ref={(node) => drag(drop(node))}
      className={`flex items-center gap-3 p-3 border rounded-lg cursor-move transition-all ${
        isDragging ? 'opacity-50' : ''
      } ${item.enabled ? 'bg-white' : 'bg-muted/30'}`}
    >
      <GripVertical className="w-4 h-4 text-muted-foreground" />
      <div className="flex-1 flex items-center justify-between">
        <span className={item.enabled ? '' : 'text-muted-foreground'}>{item.label}</span>
        <Switch checked={item.enabled} onCheckedChange={() => toggleItem(item.id)} />
      </div>
    </div>
  )
}

function OverrideRuleBuilder({ 
  rules, 
  setRules 
}: { 
  rules: OverrideRule[]
  setRules: (rules: OverrideRule[]) => void 
}) {
  const [editingRule, setEditingRule] = useState<OverrideRule | null>(null)

  const addNewRule = () => {
    const newRule: OverrideRule = {
      id: `rule-${Date.now()}`,
      name: 'New Rule',
      enabled: true,
      conditions: [{
        field: '',
        operator: '',
        value: '',
      }],
      actions: [{
        type: '',
        parameter: '',
        value: ''
      }]
    }
    setEditingRule(newRule)
  }

  const saveRule = () => {
    if (editingRule) {
      const existingRuleIndex = rules.findIndex(r => r.id === editingRule.id)
      if (existingRuleIndex >= 0) {
        setRules(rules.map(r => r.id === editingRule.id ? editingRule : r))
      } else {
        setRules([...rules, editingRule])
      }
      setEditingRule(null)
      toast.success('Rule saved successfully')
    }
  }

  const deleteRule = (ruleId: string) => {
    setRules(rules.filter(r => r.id !== ruleId))
    toast.success('Rule deleted')
  }

  const addCondition = () => {
    if (editingRule) {
      setEditingRule({
        ...editingRule,
        conditions: [
          ...editingRule.conditions,
          { field: '', operator: '', value: '', logicalOperator: 'AND' }
        ]
      })
    }
  }

  const updateCondition = (index: number, field: string, value: string) => {
    if (editingRule) {
      const newConditions = [...editingRule.conditions]
      newConditions[index] = { ...newConditions[index], [field]: value }
      setEditingRule({ ...editingRule, conditions: newConditions })
    }
  }

  const addAction = () => {
    if (editingRule) {
      setEditingRule({
        ...editingRule,
        actions: [
          ...editingRule.actions,
          { type: '', parameter: '', value: '' }
        ]
      })
    }
  }

  const updateAction = (index: number, field: string, value: string) => {
    if (editingRule) {
      const newActions = [...editingRule.actions]
      newActions[index] = { ...newActions[index], [field]: value }
      setEditingRule({ ...editingRule, actions: newActions })
    }
  }

  if (editingRule) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Rule Builder</h3>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setEditingRule(null)}>Cancel</Button>
            <Button onClick={saveRule}>Save Rule</Button>
          </div>
        </div>

        <div>
          <Label>Rule Name</Label>
          <Input 
            value={editingRule.name}
            onChange={(e) => setEditingRule({ ...editingRule, name: e.target.value })}
            className="mt-1"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <Label>Conditions</Label>
            <Button variant="outline" size="sm" onClick={addCondition}>
              <Plus className="w-4 h-4 mr-1" />
              Add Condition
            </Button>
          </div>
          
          <div className="space-y-3">
            {editingRule.conditions.map((condition, index) => (
              <div key={index} className="flex items-center gap-2 p-3 border rounded-lg">
                {index > 0 && (
                  <Select 
                    value={condition.logicalOperator || 'AND'} 
                    onValueChange={(value) => updateCondition(index, 'logicalOperator', value)}
                  >
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AND">AND</SelectItem>
                      <SelectItem value="OR">OR</SelectItem>
                    </SelectContent>
                  </Select>
                )}
                
                <Select value={condition.field} onValueChange={(value) => updateCondition(index, 'field', value)}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Select field" />
                  </SelectTrigger>
                  <SelectContent>
                    {conditionFields.map(field => (
                      <SelectItem key={field} value={field}>{field}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={condition.operator} onValueChange={(value) => updateCondition(index, 'operator', value)}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Operator" />
                  </SelectTrigger>
                  <SelectContent>
                    {operators.map(op => (
                      <SelectItem key={op.value} value={op.value}>{op.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Input
                  placeholder="Value"
                  value={condition.value}
                  onChange={(e) => updateCondition(index, 'value', e.target.value)}
                  className="flex-1"
                />

                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => {
                    const newConditions = editingRule.conditions.filter((_, i) => i !== index)
                    setEditingRule({ ...editingRule, conditions: newConditions })
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <Label>Actions</Label>
            <Button variant="outline" size="sm" onClick={addAction}>
              <Plus className="w-4 h-4 mr-1" />
              Add Action
            </Button>
          </div>
          
          <div className="space-y-3">
            {editingRule.actions.map((action, index) => (
              <div key={index} className="flex items-center gap-2 p-3 border rounded-lg">
                <Select value={action.type} onValueChange={(value) => updateAction(index, 'type', value)}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Select action" />
                  </SelectTrigger>
                  <SelectContent>
                    {actionTypes.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Input
                  placeholder="Parameter"
                  value={action.parameter}
                  onChange={(e) => updateAction(index, 'parameter', e.target.value)}
                  className="flex-1"
                />

                <Input
                  placeholder="Value"
                  value={action.value}
                  onChange={(e) => updateAction(index, 'value', e.target.value)}
                  className="flex-1"
                />

                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => {
                    const newActions = editingRule.actions.filter((_, i) => i !== index)
                    setEditingRule({ ...editingRule, actions: newActions })
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Override Rules</h3>
        <Button onClick={addNewRule}>
          <Plus className="w-4 h-4 mr-2" />
          Create Rule
        </Button>
      </div>
      
      {rules.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Settings className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>No override rules configured</p>
        </div>
      ) : (
        <div className="space-y-2">
          {rules.map((rule) => (
            <div key={rule.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <Switch checked={rule.enabled} onCheckedChange={() => {
                  setRules(rules.map(r => r.id === rule.id ? { ...r, enabled: !r.enabled } : r))
                }} />
                <div>
                  <p className="font-medium">{rule.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {rule.conditions.length} condition{rule.conditions.length !== 1 ? 's' : ''}, 
                    {rule.actions.length} action{rule.actions.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setEditingRule(rule)}>
                  <Edit className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => deleteRule(rule.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export function ConfigurationPage() {
  const [technicians, setTechnicians] = useState(mockTechnicians)
  const [autoAssignEnabled, setAutoAssignEnabled] = useState(true)
  const [acknowledgmentTimeout, setAcknowledgmentTimeout] = useState('15')
  const [idleTimeout, setIdleTimeout] = useState('30')
  const [newSkill, setNewSkill] = useState('')
  const [assignmentPriority, setAssignmentPriority] = useState(initialPriorityItems)
  const [overrideRules, setOverrideRules] = useState<OverrideRule[]>([
    {
      id: 'rule-1',
      name: 'Auto-assign scheduled tickets',
      enabled: true,
      conditions: [
        { field: 'Ticket Schedule Time', operator: '>', value: 'Current Date/Time + 5 Minutes' }
      ],
      actions: [
        { type: 'Assign Ticket', parameter: 'next available resource', value: '' },
        { type: 'Set Status', parameter: 'Status', value: 'Reopened' }
      ]
    }
  ])

  const handleSaveSettings = () => {
    toast.success('Settings saved successfully')
  }

  const handleAddSkill = (techId: string) => {
    if (newSkill.trim()) {
      setTechnicians(prev => prev.map(tech => 
        tech.id === techId 
          ? { ...tech, skills: [...tech.skills, newSkill.trim()] }
          : tech
      ))
      setNewSkill('')
      toast.success('Skill added')
    }
  }

  const handleRemoveSkill = (techId: string, skillToRemove: string) => {
    setTechnicians(prev => prev.map(tech => 
      tech.id === techId 
        ? { ...tech, skills: tech.skills.filter(skill => skill !== skillToRemove) }
        : tech
    ))
    toast.success('Skill removed')
  }

  const toggleTechnicianAvailability = (techId: string) => {
    setTechnicians(prev => prev.map(tech => 
      tech.id === techId 
        ? { ...tech, available: !tech.available }
        : tech
    ))
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1>Ticket Routing Configuration</h1>
            <p className="text-muted-foreground">Configure automated ticket assignment settings and technician profiles</p>
          </div>
          <Button onClick={handleSaveSettings}>
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </div>

        <Tabs defaultValue="assignment" className="space-y-6">
          <TabsList>
            <TabsTrigger value="assignment">Assignment Rules</TabsTrigger>
            <TabsTrigger value="technicians">Technicians</TabsTrigger>
            <TabsTrigger value="timeouts">Timeouts & Limits</TabsTrigger>
          </TabsList>

          {/* Assignment Rules Tab */}
          <TabsContent value="assignment" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-blue-500" />
                  <CardTitle>Automated Assignment</CardTitle>
                </div>
                <CardDescription>
                  Configure how tickets are automatically assigned to technicians
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Enable Automated Assignment</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically assign tickets to available technicians based on skills and availability
                    </p>
                  </div>
                  <Switch 
                    checked={autoAssignEnabled} 
                    onCheckedChange={setAutoAssignEnabled}
                  />
                </div>

                {autoAssignEnabled && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pl-4 border-l-2 border-blue-200">
                    {/* Left Column - Assignment Priority */}
                    <div>
                      <Label className="text-base font-medium">Assignment Priority</Label>
                      <p className="text-sm text-muted-foreground mb-4">
                        Drag to reorder assignment priorities. Higher items have precedence.
                      </p>
                      <DragDropAssignmentPriority 
                        items={assignmentPriority} 
                        setItems={setAssignmentPriority}
                      />
                    </div>

                    {/* Right Column - Skill Matching & Load Balancing */}
                    <div className="space-y-6">
                      <div>
                        <Label>Skill Matching</Label>
                        <Select defaultValue="exact">
                          <SelectTrigger className="w-full mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="exact">Exact skill match required</SelectItem>
                            <SelectItem value="partial">Partial skill match acceptable</SelectItem>
                            <SelectItem value="any">Any available technician</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Load Balancing</Label>
                        <Select defaultValue="even">
                          <SelectTrigger className="w-full mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="even">Distribute evenly</SelectItem>
                            <SelectItem value="workload">Based on current workload</SelectItem>
                            <SelectItem value="experience">Based on experience level</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Override Engine</CardTitle>
                <CardDescription>
                  Create custom workflow rules to override default assignment behavior
                </CardDescription>
              </CardHeader>
              <CardContent>
                <OverrideRuleBuilder rules={overrideRules} setRules={setOverrideRules} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Technicians Tab */}
          <TabsContent value="technicians" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-500" />
                    <CardTitle>Technician Management</CardTitle>
                  </div>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Technician
                  </Button>
                </div>
                <CardDescription>
                  Manage technician skills, roles, and specialties for automated assignment
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {technicians.map((tech) => (
                    <Card key={tech.id} className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="flex items-center gap-2">
                              <div className={`w-3 h-3 rounded-full ${
                                tech.status === 'Online' ? 'bg-green-500' : 'bg-gray-400'
                              }`}></div>
                              <h4 className="font-medium">{tech.name}</h4>
                            </div>
                            <Badge variant={tech.available ? "default" : "secondary"}>
                              {tech.available ? "Available" : "Not Available"}
                            </Badge>
                          </div>
                          
                          <p className="text-sm text-muted-foreground mb-3">{tech.email}</p>
                          
                          <div className="space-y-3">
                            <div>
                              <Label className="text-sm">Skills</Label>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {tech.skills.map((skill) => (
                                  <Badge key={skill} variant="outline" className="text-xs">
                                    {skill}
                                    <button
                                      onClick={() => handleRemoveSkill(tech.id, skill)}
                                      className="ml-1 hover:text-red-500"
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  </Badge>
                                ))}
                                <div className="flex gap-1">
                                  <Input
                                    value={newSkill}
                                    onChange={(e) => setNewSkill(e.target.value)}
                                    placeholder="Add skill"
                                    className="w-24 h-6 text-xs"
                                    onKeyPress={(e) => {
                                      if (e.key === 'Enter') {
                                        handleAddSkill(tech.id)
                                      }
                                    }}
                                  />
                                  <Button 
                                    size="sm" 
                                    variant="outline" 
                                    className="h-6 px-2"
                                    onClick={() => handleAddSkill(tech.id)}
                                  >
                                    <Plus className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                            
                            <div>
                              <Label className="text-sm">Roles</Label>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {tech.roles.map((role) => (
                                  <Badge key={role} className="text-xs">{role}</Badge>
                                ))}
                              </div>
                            </div>
                            
                            <div>
                              <Label className="text-sm">Specialties</Label>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {tech.specialties.map((specialty) => (
                                  <Badge key={specialty} variant="secondary" className="text-xs">{specialty}</Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => toggleTechnicianAvailability(tech.id)}
                          >
                            {tech.available ? 'Set Unavailable' : 'Set Available'}
                          </Button>
                          <Button variant="outline" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Timeouts Tab */}
          <TabsContent value="timeouts" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-500" />
                  <CardTitle>Timeout Configuration</CardTitle>
                </div>
                <CardDescription>
                  Configure timeout settings for ticket assignments and technician availability
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label>Acknowledgment Timeout</Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    Time in minutes before reassigning an unacknowledged ticket to another technician
                  </p>
                  <div className="flex items-center gap-2">
                    <Input 
                      type="number" 
                      value={acknowledgmentTimeout}
                      onChange={(e) => setAcknowledgmentTimeout(e.target.value)}
                      className="w-24"
                    />
                    <span className="text-sm text-muted-foreground">minutes</span>
                  </div>
                </div>

                <div>
                  <Label>Idle Timeout</Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    Time in minutes of inactivity before marking a technician as unavailable
                  </p>
                  <div className="flex items-center gap-2">
                    <Input 
                      type="number" 
                      value={idleTimeout}
                      onChange={(e) => setIdleTimeout(e.target.value)}
                      className="w-24"
                    />
                    <span className="text-sm text-muted-foreground">minutes</span>
                  </div>
                </div>

                <div>
                  <Label>Reassignment Attempts</Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    Maximum number of reassignment attempts before escalation
                  </p>
                  <Input type="number" defaultValue="3" className="w-24" />
                </div>

                <div className="flex items-start gap-2 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-yellow-800">Configuration Warning</p>
                    <p className="text-sm text-yellow-700">
                      Short timeout values may result in frequent reassignments. Consider your team's typical response patterns.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Escalation Rules</CardTitle>
                <CardDescription>Define what happens when automatic assignment fails</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Escalation Method</Label>
                  <Select defaultValue="supervisor">
                    <SelectTrigger className="w-full mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="supervisor">Notify supervisor</SelectItem>
                      <SelectItem value="broadcast">Broadcast to all technicians</SelectItem>
                      <SelectItem value="queue">Add to manual assignment queue</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Escalation Delay</Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    Time to wait before escalating after final reassignment attempt
                  </p>
                  <div className="flex items-center gap-2">
                    <Input type="number" defaultValue="5" className="w-24" />
                    <span className="text-sm text-muted-foreground">minutes</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DndProvider>
  )
}