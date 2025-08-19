import { Button } from './ui/button'

interface ReasonCodeModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectReason: (reason: string) => void
  status: string
  prompt: string
  options: string[]
}

export function ReasonCodeModal({ isOpen, onClose, onSelectReason, status, prompt, options }: ReasonCodeModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md space-y-4">
        <div>
          <h2 className="text-lg font-medium">{prompt}</h2>
        </div>
        <div className="space-y-2">
          {options.map((option) => (
            <Button 
              key={option}
              variant="outline" 
              className="w-full justify-start text-left"
              onClick={() => onSelectReason(option)}
            >
              {option}
            </Button>
          ))}
        </div>
        <div className="flex justify-end">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  )
}