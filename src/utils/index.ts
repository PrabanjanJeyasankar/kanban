import { CardStatus } from "@/store/kanban-store"
import { Task } from "./card-type"

export function findContainer(
  id: string,
  tasks: Task[]
): CardStatus | undefined {
  if (['todo', 'in-progress', 'completed'].includes(id)) {
    return id as CardStatus
  }
  return tasks.find((t) => t.id === id)?.status
}
