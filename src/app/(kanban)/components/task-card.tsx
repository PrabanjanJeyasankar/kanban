'use client'

import { Calendar, Clock, MoreVertical, Pencil, Trash2 } from 'lucide-react'
import { useDroppable, useDraggable } from '@dnd-kit/core'
import { gradientMap } from '@/utils/gradient'
import { Task } from '@/store/kanban-store'
import { useState } from 'react'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { TaskModal } from './task-modal'
import { JSX } from 'react/jsx-runtime'
import { useDeleteCard } from '@/002-hooks/use-tasks'

interface Props {
  task: Task
  index: number
  columnId: string
}

export const TaskCard = ({ task, index, columnId }: Props): JSX.Element => {
  const deleteCardMutation = useDeleteCard()

  const { setNodeRef: setDropRef, isOver } = useDroppable({ id: task.id })
  const { attributes, listeners, setNodeRef: setDragRef, isDragging } = useDraggable({ id: task.id })

  const [isEditOpen, setIsEditOpen] = useState(false)
  const cardGradient = gradientMap[task.status] ?? 'bg-[--color-card]'

  const created = task.createdAt ? new Date(task.createdAt) : null
  const dateStr = created?.toLocaleDateString()
  const timeStr = created?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  const setRefs = (el: HTMLElement | null) => {
    setDropRef(el)
    setDragRef(el)
  }

  return (
    <>
      <div
        ref={setRefs}
        {...listeners}
        {...attributes}
        className={`relative rounded-xl p-4 space-y-4 shadow-sm bg-no-repeat bg-cover transition
          ${cardGradient}
          ${isDragging ? ' outline-2 outline-[--color-ring] z-20' : ''}
         ${isOver ? 'ring-3 ring-black/20 dark:ring-white/20' : ''}
        `}>

        <div
          className='absolute top-2 right-2 z-20'
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className='hover:cursor-pointer rounded p-2 hover:bg-[--color-muted] transition' aria-label='Task actions'>
                <MoreVertical className='w-5 h-5' />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align='end'
              sideOffset={8}
              className='z-50 min-w-[160px] rounded-lg border border-[--color-border] bg-white py-1 shadow-md'
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => e.stopPropagation()}>
              <DropdownMenuItem
                className='hover:cursor-pointer flex items-center gap-2 px-3 py-2 text-sm font-sans cursor-pointer'
                onClick={(e) => {
                  e.stopPropagation()
                  setIsEditOpen(true)
                }}>
                <Pencil className='w-4 h-4' />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                className='hover:cursor-pointer flex items-center gap-2 px-3 py-2 text-sm font-sans text-destructive cursor-pointer'
                onClick={() => {
                  deleteCardMutation.mutate(task.id)
                }}>
                <Trash2 className='w-4 h-4' />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className='flex flex-col space-y-3 cursor-grab active:cursor-grabbing select-none'>
          <h3 className='text-base font-semibold font-sans'>{task.title}</h3>
          <p className='text-sm text-[--color-muted-foreground] font-sans'>{task.content}</p>

          {task.tags.length > 0 && (
            <div className='flex flex-wrap gap-1'>
              {task.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className='px-2 py-0.5 rounded-full text-xs font-mono bg-[--color-muted] text-[--color-muted-foreground]'>
                  {tag}
                </span>
              ))}
            </div>
          )}

          {created && (
            <div className='pt-3 border-t border-[--color-border]'>
              <div className='flex items-center gap-2 text-xs font-mono text-[--color-muted-foreground]'>
                <Calendar className='w-4 h-4' />
                <span>{dateStr}</span>
                <Clock className='w-4 h-4' />
                <span>{timeStr}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <TaskModal task={task} open={isEditOpen} onOpenChange={setIsEditOpen} />
    </>
  )
}
