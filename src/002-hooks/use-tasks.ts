import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { CardStatus, Task, useKanbanStore } from '@/store/kanban-store'
import { createCard, deleteCard, fetchCards, updateCard } from '@/001-actions/tasks'

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

export function useCards() {
  return useQuery<Task[]>({
    queryKey: ['cards'],
    queryFn: async (): Promise<Task[]> => {
      const rawCards = await fetchCards()
      return rawCards.map(normalizeCard)
    },
    staleTime: 5 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
  })
}

export function useCreateCard() {
  const queryClient = useQueryClient()
  const addTask = useKanbanStore((s) => s.addTask)

  return useMutation<Task, Error, Omit<Task, 'id' | 'createdAt' | 'updatedAt'>>({
    mutationFn: async (payload) => {
      const raw = await createCard(payload) // returns RawCard
      return normalizeCard(raw) // ensures shape matches Task
    },
    onSuccess: (newTask) => {
      addTask(newTask)
      queryClient.invalidateQueries({ queryKey: ['cards'] })
    },
  })
}

export function useUpdateCard() {
  const queryClient = useQueryClient()
  const updateTask = useKanbanStore((s) => s.updateTask)
  const allTasks = useKanbanStore.getState().tasks
  const setTasks = useKanbanStore.getState().setTasks

  return useMutation<Task, Error, { id: string; updates: Partial<Omit<Task, 'id'>> }>({
    mutationFn: async ({ id, updates }) => normalizeCard(await updateCard(id, updates)),
    onSuccess: (updatedTask) => {
      updateTask(updatedTask.id, updatedTask)

      const otherTasks = allTasks.filter((t) => t.id !== updatedTask.id)
      const sameColumnTasks = otherTasks
        .filter((t) => t.status === updatedTask.status)
        .sort((a, b) => a.position - b.position)

      const insertAt = sameColumnTasks.findIndex((t) => t.position >= updatedTask.position)

      const reordered = [...otherTasks]
      if (insertAt === -1) {
        reordered.push(updatedTask)
      } else {
        reordered.splice(insertAt, 0, updatedTask)
      }

      const finalTasks = reordered.map((task, index) => {
        if (task.status === updatedTask.status) {
          return { ...task, position: index + 1 }
        }
        return task
      })

      setTasks(finalTasks)

      queryClient.invalidateQueries({ queryKey: ['cards'] })
    },
  })
}

export function useDeleteCard() {
  const queryClient = useQueryClient()
  const deleteTask = useKanbanStore((s) => s.deleteTask)

  return useMutation<{ success: boolean }, Error, string>({
    mutationFn: async (id) => deleteCard(id),
    onSuccess: (_res, id) => {
      deleteTask(id) // ✅ remove it from store
      queryClient.invalidateQueries({ queryKey: ['cards'] })
    },
  })
}
