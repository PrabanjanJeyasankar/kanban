import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type CardStatus = 'todo' | 'in-progress' | 'completed'

export interface Task {
  id: string
  title: string
  content: string
  status: CardStatus
  position: number
  createdAt?: string
  updatedAt?: string
  tags: string[]
}

interface KanbanStore {
  tasks: Task[]
  draggedTaskId: string | null
  setTasks: (tasks: Task[]) => void
  setDraggedTask: (id: string | null) => void
  addTask: (task: Task) => void
  updateTask: (id: string, updates: Partial<Omit<Task, 'id'>>) => void
  deleteTask: (id: string) => void
  moveTask: (id: string, newStatus: CardStatus) => void
  reorderTask: (id: string, newPosition: number) => void
}

export const useKanbanStore = create<KanbanStore>()(
  persist(
    (set, get) => ({
      tasks: [],
      draggedTaskId: null,
      setTasks: (tasks) => set({ tasks }),
      setDraggedTask: (id) => set({ draggedTaskId: id }),
      addTask: (task) => set((state) => ({ tasks: [...state.tasks, task] })),
      updateTask: (id: string, updates: Partial<Task>) => {
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id ? { ...t, ...updates } : t
          ),
        }))
      },
      deleteTask: (id) =>
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== id),
        })),
      moveTask: (id, newStatus) =>
        set((state) => ({
          tasks: state.tasks.map((task) => (task.id === id ? { ...task, status: newStatus } : task)),
        })),
      reorderTask: (id, newPosition) =>
        set((state) => ({
          tasks: state.tasks.map((task) => (task.id === id ? { ...task, position: newPosition } : task)),
        })),
    }),
    { name: 'kanban-storage' }
  )
)
