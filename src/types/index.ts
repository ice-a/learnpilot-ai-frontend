export type GradeStage = 'primary' | 'junior' | 'senior'
export type LearningTrackType = 'k12' | 'career'

export type Subject =
  | 'math'
  | 'chinese'
  | 'english'
  | 'physics'
  | 'chemistry'
  | 'biology'
  | 'history'
  | 'geography'
  | 'politics'

export type TTSFormat = 'mp3' | 'wav' | 'pcm' | 'opus' | 'flac'

export interface AIProvider {
  _id?: string
  name: string
  baseUrl: string
  modelId: string
  isActive: boolean
  timeoutMs: number
  ttsEnabled?: boolean
  ttsModelId?: string
  ttsVoice?: string
  ttsFormat?: TTSFormat
  ttsSpeed?: number
  createdAt?: string
  updatedAt?: string
}

export interface CreateProviderRequest {
  name: string
  baseUrl: string
  modelId: string
  apiKey: string
  timeoutMs?: number
  ttsEnabled?: boolean
  ttsModelId?: string
  ttsVoice?: string
  ttsFormat?: TTSFormat
  ttsSpeed?: number
}

export interface KnowledgePoint {
  _id?: string
  trackType: LearningTrackType
  gradeStage?: GradeStage
  gradeLevel?: number
  subject?: Subject
  careerRole?: string
  careerGoal?: string
  chapter: string
  title: string
  description: string
  difficulty: 1 | 2 | 3 | 4 | 5
  source: 'ai_generated' | 'manual'
  version: number
  createdAt?: string
  updatedAt?: string
}

export interface GenerateKnowledgeParams {
  trackType: LearningTrackType
  gradeStage?: GradeStage
  gradeLevel?: number
  subject?: Subject
  careerRole?: string
  careerGoal?: string
  providerConfigId?: string
}

export interface FetchKnowledgeParams {
  trackType?: LearningTrackType
  gradeStage?: GradeStage
  gradeLevel?: number
  subject?: Subject
  careerRole?: string
  page?: number
  limit?: number
}

export interface TutorSession {
  _id?: string
  userId: string
  trackType: LearningTrackType
  gradeStage?: GradeStage
  gradeLevel?: number
  subject?: Subject
  careerRole?: string
  careerGoal?: string
  providerConfigId: string
  status: 'active' | 'closed'
  createdAt?: string
  updatedAt?: string
}

export interface TutorMessage {
  _id?: string
  sessionId: string
  role: 'user' | 'assistant' | 'system'
  content: string
  tokenUsage?: {
    prompt: number
    completion: number
    total: number
  }
  createdAt?: string
  updatedAt?: string
}

export interface CreateSessionParams {
  userId: string
  trackType: LearningTrackType
  gradeStage?: GradeStage
  gradeLevel?: number
  subject?: Subject
  careerRole?: string
  careerGoal?: string
  providerConfigId: string
  forceNew?: boolean
}

export interface InterviewTranscriptItem {
  role: 'assistant' | 'user'
  content: string
}

export interface InterviewStartResponse {
  question: string
}

export interface InterviewAnswerResponse {
  analysis: string
  nextQuestion: string
  scoreDelta: number
  scoreReason: string
}

export interface AuthUser {
  id: string
  email: string
  displayName: string
  preferredProviderConfigId?: string
}

export interface AuthPayload {
  token: string
  user: AuthUser
}

export interface AuthChallenge {
  challengeId: string
  challengeText: string
  expiresInSec: number
}

export interface UserProfile {
  id: string
  email: string
  displayName: string
  preferredProviderConfigId?: string
  learningDirection?: string
  learningGoal?: string
  personalInfoSession: Array<{
    role: 'user' | 'assistant' | 'system'
    content: string
    createdAt: string
  }>
  interviewProfile: {
    targetRole?: string
    focusDirection?: string
    selfIntroduction?: string
  }
}

export interface UpdateUserProfileRequest {
  displayName?: string
  learningDirection?: string
  learningGoal?: string
  preferredProviderConfigId?: string | null
  interviewProfile?: {
    targetRole?: string
    focusDirection?: string
    selfIntroduction?: string
  }
}
