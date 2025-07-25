'use client'

import { useDroppable } from '@dnd-kit/core'
import { useKanbanStore, CardStatus } from '@/store/kanban-store'
import { Plus, FileText } from 'lucide-react'
import { TaskCard } from '../components/task-card'
import { TaskModal } from '../components/task-modal'
import { JSX } from 'react/jsx-runtime'

export const TodoColumn = (): JSX.Element => {
  const { setNodeRef } = useDroppable({ id: 'todo' })

  const tasks = useKanbanStore((s) => s.tasks)
  const draggedTaskId = useKanbanStore((s) => s.draggedTaskId)
  const todoTasks = tasks.filter((t) => t.status === 'todo').sort((a, b) => a.position - b.position)
  const filteredTasks = todoTasks.filter((t) => t.id !== draggedTaskId)

  return (
    <div ref={setNodeRef} className='rounded-xl min-h-[120px] p-4 bg-[--color-card] shadow-sm space-y-4 transition'>
      <div className='mb-4 flex items-center justify-between'>
        <span className='flex items-center text-sm font-medium px-3 py-1 rounded-full text-[--color-muted-foreground] bg-[--color-muted] font-sans'>
          <FileText className='w-4 h-4 mr-1' />
          TODO
        </span>
      </div>
      {filteredTasks.map((task, idx) => (
        <TaskCard key={task.id} task={task} index={idx} columnId='todo' />
      ))}
      <TaskModal
        defaultStatus={'todo' as CardStatus}
        trigger={
          <button className='w-full mt-2 text-sm text-[--color-muted-foreground] font-sans border border-[--color-border] rounded-md py-2 flex justify-center items-center gap-1 hover:bg-[--color-muted] transition'>
            <Plus className='w-4 h-4' />
            Add Task
          </button>
        }
      />
    </div>
  )
}
