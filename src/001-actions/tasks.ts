/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios'
import { CardStatus, Task } from '@/store/kanban-store'

export type BEStatus = 'to-do' | 'in-progress' | 'completed'
export const statusBEtoFE: Record<BEStatus, CardStatus> = {
  'to-do': 'todo',
  'in-progress': 'in-progress',
  completed: 'completed',
}
export const statusFEtoBE: Record<CardStatus, BEStatus> = {
  todo: 'to-do',
  'in-progress': 'in-progress',
  completed: 'completed',
}

export interface RawCard {
  _id: string
  title: string
  content: string
  status: BEStatus
  position: number
  createdAt?: string
  updatedAt?: string
  tags?: string[]
}

export type CreateCardPayload = Omit<RawCard, '_id' | 'createdAt' | 'updatedAt'>
export type UpdateCardPayload = Partial<CreateCardPayload>

const API_URL: string = process.env.NEXT_PUBLIC_API_URL!

export async function fetchCards(): Promise<RawCard[]> {
  const response = await axios.get<{ message: string; error: any; data: RawCard[] }>(`${API_URL}/cards`)
  return response.data.data
}

export async function createCard(payload: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<RawCard> {
  const bePayload: CreateCardPayload = {
    ...payload,
    status: statusFEtoBE[payload.status],
  }
  const response = await axios.post<RawCard>(`${API_URL}/cards`, bePayload)
  return response.data
}

export async function updateCard(id: string, updates: Partial<Omit<Task, 'id'>>): Promise<RawCard> {
  const beUpdates: UpdateCardPayload = {
    ...updates,
    status: updates.status ? statusFEtoBE[updates.status] : undefined,
  }
  const response = await axios.patch<RawCard>(`${API_URL}/cards/${id}`, beUpdates)
  return response.data
}

export async function deleteCard(id: string): Promise<{ success: boolean }> {
  const response = await axios.delete<{ success: boolean }>(`${API_URL}/cards/${id}`)
  return response.data
}

export function normalizeCard(raw: RawCard): Task {
  return {
    id: raw._id,
    title: raw.title,
    content: raw.content,
    status: statusBEtoFE[raw.status],
    position: raw.position,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
    tags: raw.tags ?? [],
  }
}
