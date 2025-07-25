export type Task = {
  id: string
  title: string
  content: string
  status: 'todo' | 'in-progress' | 'completed'
  position: number
  createdAt?: string
  updatedAt?: string
}
