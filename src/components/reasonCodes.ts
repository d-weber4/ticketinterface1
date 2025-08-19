export interface ReasonCodeConfig {
  prompt: string
  options: string[]
}

export const REASON_CODE_CONFIGS: Record<string, ReasonCodeConfig> = {
  'Approval/Info Needed': {
    prompt: 'Why is this ticket being moved to Approval/Info Needed?',
    options: [
      'Approval Needed',
      'Could not complete in provided schedule',
      'Credentials not available',
      'Credentials not working',
      'Further Information Needed',
      'Machine Not Accessible',
      'No Agent Installed'
    ]
  },
  'Assigned': {
    prompt: 'Assigned Reason:',
    options: [
      'Escalated to L2',
      'Escalated to L3', 
      'Escalated to L4',
      'Escalated to Manager',
      'Escalation Requested by T4',
      'Needs On-Site Support',
      'Out of Scope'
    ]
  },
  'Closed': {
    prompt: 'Select Close Reason:',
    options: [
      'Out of Scope',
      'Fixed/Completed',
      'Withdrawn',
      'Duplicate',
      'Inactivity',
      'Not Reproducible',
      'Workaround Provided'
    ]
  },
  'Resolved': {
    prompt: 'Select Resolve Reason:',
    options: [
      'Out of Scope',
      'Fixed/Completed',
      'Withdrawn',
      'Duplicate',
      'Inactivity',
      'Not Reproducible',
      'Workaround Provided'
    ]
  },
  'Scheduled': {
    prompt: 'Select Scheduled Reason:',
    options: [
      'Escalated to L2',
      'Escalated to L3',
      'Escalated to L4',
      'Escalated to Manager',
      'Call/Task Scheduled',
      'Outside of Support Hours'
    ]
  },
  'Awaiting Response': {
    prompt: 'Who needs to respond to this?',
    options: [
      'Customer',
      'Vendor',
      'Partner',
      'Expert Services'
    ]
  }
}

export const STATUSES_REQUIRING_REASON = Object.keys(REASON_CODE_CONFIGS)

export function requiresReasonCode(status: string): boolean {
  return STATUSES_REQUIRING_REASON.includes(status)
}

export function getReasonCodeConfig(status: string): ReasonCodeConfig | null {
  return REASON_CODE_CONFIGS[status] || null
}