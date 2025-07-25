'use client'

import { DndContext, DragEndEvent, DragStartEvent, DragOverlay } from '@dnd-kit/core'
import { TodoColumn } from './columns/todo'
import { InProgressColumn } from './columns/in-progress'
import { CompletedColumn } from './columns/completed'
import { TaskCard } from './components/task-card'
import { useEffect, useMemo } from 'react'
import { useCards, useUpdateCard } from '@/002-hooks/use-tasks'
import { useKanbanStore, Task, CardStatus } from '@/store/kanban-store'
import { JSX } from 'react/jsx-runtime'

export const KanbanBoard = (): JSX.Element => {
  const { data: fetchedTasks, isLoading } = useCards()
  const updateCardMutation = useUpdateCard()

  const setTasks = useKanbanStore((s) => s.setTasks)
  const tasks = useKanbanStore((s) => s.tasks)
  const setDraggedTask = useKanbanStore((s) => s.setDraggedTask)
  const draggedTaskId = useKanbanStore((s) => s.draggedTaskId)

  useEffect(() => {
    if (!fetchedTasks) return

    const frontendIds = tasks.map((t) => t.id).sort()
    const backendIds = fetchedTasks.map((t) => t.id).sort()

    const idsMatch = frontendIds.length === backendIds.length && frontendIds.every((id, idx) => id === backendIds[idx])

    if (!idsMatch) {
      setTasks(fetchedTasks)
    }
  }, [fetchedTasks, setTasks, tasks])

  const handleDragStart = (event: DragStartEvent) => {
    const id = event.active.id
    if (typeof id === 'string') setDraggedTask(id)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setDraggedTask(null)

    if (!over || !active) {
      console.warn('[DragEnd] No valid target or active task')
      return
    }

    const taskId = active.id as string
    const overId = over.id as string

    console.log('[DragEnd] taskId:', taskId, '| overId:', overId)

    const task = tasks.find((t) => t.id === taskId)
    if (!task) {
      console.warn('[DragEnd] Task not found:', taskId)
      return
    }

    // Drop on a column
    if (['todo', 'in-progress', 'completed'].includes(overId)) {
      const columnTasks = tasks.filter((t) => t.status === overId)
      const newPos = columnTasks.length + 1

      updateCardMutation.mutate({
        id: taskId,
        updates: {
          status: overId as CardStatus,
          position: newPos,
        },
      })
      return
    }

    // Drop on another task
    const overTask = tasks.find((t) => t.id === overId)
    if (!overTask) {
      console.warn('[DragEnd] Over task not found:', overId)
      return
    }

    if (task.status !== overTask.status || task.position !== overTask.position) {
      updateCardMutation.mutate({
        id: taskId,
        updates: {
          status: overTask.status,
          position: overTask.position,
        },
      })
    } else {
      console.log('[DragEnd] No position/status change, skipping update')
    }
  }

  const draggedTask = useMemo(() => tasks.find((t) => t.id === draggedTaskId), [tasks, draggedTaskId])

  if (isLoading) {
    return (
      <div className='w-full flex justify-center items-center h-40 text-muted-foreground font-mono'>
        Loading tasks...
      </div>
    )
  }

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className='w-full mt-6 grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in'>
        <TodoColumn />
        <InProgressColumn />
        <CompletedColumn />
      </div>
      <DragOverlay>
        {draggedTask ? (
          <div className='pointer-events-none'>
            <TaskCard task={draggedTask} index={0} columnId={draggedTask.status} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
