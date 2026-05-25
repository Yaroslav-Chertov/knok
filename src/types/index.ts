export type LeadStatus = 'new' | 'sent' | 'replied' | 'no_reply' | 'skip'

export interface Lead {
  id: string
  company: string
  website?: string
  contact?: string
  position?: string
  email?: string
  note?: string
  status: LeadStatus
  createdAt: string
  sentAt?: string
  aiGenerated?: boolean
}

export type AIProvider = 'claude' | 'gemini' | 'deepseek' | 'groq'

export interface Settings {
  companyName: string
  about: string
  targetAudience: string
  examples: string
  aiProvider: AIProvider
  apiKey: string
  emailSubject: string
  emailTemplate: string
  senderEmail: string
  startDate: string
  emailjsService: string
  emailjsTemplate: string
  emailjsKey: string
  dailyLimit: number
  sendDelay: number
}

export type CampaignStatus = 'idle' | 'running' | 'paused' | 'scheduled' | 'done'
