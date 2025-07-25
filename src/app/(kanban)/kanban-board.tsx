'use client'

import React, { useEffect } from 'react'
import {
  DndContext,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
  DragOverlay,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'

import { useCards, useUpdateCard } from '@/002-hooks/use-tasks'
import { useKanbanStore } from '@/store/kanban-store'
import { JSX } from 'react/jsx-runtime'
import { TaskCard } from './components/task-card'
import { InProgressColumn } from './columns/in-progress'
import { TodoColumn } from './columns/todo'
import { CompletedColumn } from './columns/completed'
import { findContainer } from '@/utils'



export const KanbanBoard = (): JSX.Element => {
  const { data: fetched, isLoading } = useCards()
  const updateCardMutation = useUpdateCard()

  const setTasks   = useKanbanStore((s) => s.setTasks)
  const tasks      = useKanbanStore((s) => s.tasks)
  const updateTask = useKanbanStore((s) => s.updateTask)
  const draggedId  = useKanbanStore((s) => s.draggedTaskId)
  const setDragged = useKanbanStore((s) => s.setDraggedTask)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { delay: 100, tolerance: 5 } })
  )

  useEffect(() => {
    if (!fetched) return
    const localIds  = tasks.map((t) => t.id).sort()
    const remoteIds = fetched.map((t) => t.id).sort()
    const same = localIds.length === remoteIds.length &&
      localIds.every((id, i) => id === remoteIds[i])
    if (!same) setTasks(fetched)
  }, [fetched, tasks, setTasks])

  const handleDragStart = (event: DragStartEvent): void => {
    setDragged(event.active.id as string)
  }

  const handleDragOver = (event: DragOverEvent): void => {
    const { active, over } = event
    if (!over) return

    const activeId = active.id as string
    const overId   = over.id   as string

    const activeContainer = findContainer(activeId, tasks)
    const overContainer   = findContainer(overId, tasks)

    if (
      activeContainer &&
      overContainer &&
      activeContainer !== overContainer
    ) {
      tasks
        .filter((t) => t.status === overContainer)
        .forEach((t) =>
          updateTask(t.id, { position: t.position + 1 })
        )

      updateTask(activeId, {
        status: overContainer,
        position: 1,
      })
    }
  }

  const handleDragEnd = (event: DragEndEvent): void => {
    const { active, over } = event
    setDragged(null)
    if (!over) return

    const activeId = active.id as string
    const overId   = over.id   as string

    const newContainer = findContainer(overId, tasks)
    if (!newContainer) return

    const newPosition = tasks.filter((t) => t.status === newContainer)
      .sort((a, b) => a.position - b.position)
      .findIndex((t) => t.id === activeId) + 1

    const original = tasks.find((t) => t.id === activeId)
    if (
      original &&
      original.status === newContainer &&
      original.position === newPosition
    ) {
      return
    }

    updateTask(activeId, {
      status: newContainer,
      position: newPosition,
    })

    updateCardMutation.mutate({
      id: activeId,
      updates: {
        status: newContainer,
        position: newPosition,
      },
    })
  }

  if (isLoading) {
    return (
      <div className="w-full flex justify-center items-center h-40 font-mono">
        Loading…
      </div>
    )
  }
  const todoIds       = tasks.filter((t) => t.status === 'todo').map((t) => t.id)
  const inProgressIds = tasks.filter((t) => t.status === 'in-progress').map((t) => t.id)
  const completedIds  = tasks.filter((t) => t.status === 'completed').map((t) => t.id)

  const activeTask = tasks.find((t) => t.id === draggedId!) 

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SortableContext
          items={todoIds}
          strategy={verticalListSortingStrategy}
        >
          <TodoColumn />
        </SortableContext>

        <SortableContext
          items={inProgressIds}
          strategy={verticalListSortingStrategy}
        >
          <InProgressColumn />
        </SortableContext>

        <SortableContext
          items={completedIds}
          strategy={verticalListSortingStrategy}
        >
          <CompletedColumn />
        </SortableContext>
      </div>

      {/* Drag preview */}
      <DragOverlay>
        {activeTask ? (
          <TaskCard
            task={activeTask}
            index={0}
            columnId={activeTask.status}
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}

