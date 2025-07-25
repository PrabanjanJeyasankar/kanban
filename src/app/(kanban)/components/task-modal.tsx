'use client'

import { useState, useEffect, ReactElement } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { useKanbanStore, Task, CardStatus } from '@/store/kanban-store'
import { useCreateCard, useUpdateCard } from '@/002-hooks/use-tasks'
import { JSX } from 'react/jsx-runtime'

export interface TaskModalProps {
  task?: Task
  defaultStatus?: CardStatus
  trigger?: ReactElement
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export const TaskModal = ({
  task,
  defaultStatus,
  trigger,
  open: externalOpen,
  onOpenChange: externalOnChange,
}: TaskModalProps): JSX.Element => {
  const isEditMode: boolean = !!task

  const [internalOpen, setInternalOpen] = useState<boolean>(false)
  const isControlled = externalOpen !== undefined && externalOnChange !== undefined

  const isOpen = isControlled ? externalOpen : internalOpen
  const setIsOpen = isControlled ? externalOnChange : setInternalOpen

  const [title, setTitle] = useState<string>(task?.title ?? '')
  const [content, setContent] = useState<string>(task?.content ?? '')
  const [status, setStatus] = useState<CardStatus>(task?.status ?? defaultStatus ?? 'todo')

  const addTask = useKanbanStore((s) => s.addTask)
  const updateTask = useKanbanStore((s) => s.updateTask)
  const tasks = useKanbanStore((s) => s.tasks)

  const createCardMutation = useCreateCard()
  const updateCardMutation = useUpdateCard()

  useEffect(() => {
    if (isOpen) {
      setTitle(task?.title ?? '')
      setContent(task?.content ?? '')
      setStatus(task?.status ?? defaultStatus ?? 'todo')
    }
  }, [isOpen, task, defaultStatus])

  const handleSubmit = (): void => {
    if (isEditMode && task) {
      updateCardMutation.mutate(
        { id: task.id, updates: { title, content, status } },
        {
          onSuccess: () => {
            updateTask(task.id, { title, content, status })
            setIsOpen(false)
          },
        }
      )
    } else {
      const sameStatusTasks = tasks.filter((t) => t.status === status)
      const maxPosition = sameStatusTasks.length > 0 ? Math.max(...sameStatusTasks.map((t) => t.position)) : 0
      const newPosition = maxPosition + 1

      createCardMutation.mutate(
        {
          title,
          content,
          status,
          position: newPosition,
          tags: [],
        },
        {
          onSuccess: (newTask) => {
            addTask(newTask)
            setIsOpen(false)
          },
        }
      )
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Task' : 'Create Task'}</DialogTitle>
          <DialogDescription>
            {isEditMode ? 'Update your task details below.' : 'Enter details for your new task.'}
          </DialogDescription>
        </DialogHeader>

        <div className='grid gap-4 py-4'>
          <div className='grid gap-2'>
            <Label htmlFor='task-title'>Title</Label>
            <Input
              id='task-title'
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className='font-sans'
              placeholder='e.g. Finalize presentation'
            />
          </div>
          <div className='grid gap-2'>
            <Label htmlFor='task-content'>Description</Label>
            <Textarea
              id='task-content'
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className='font-sans'
              placeholder='Details about the task...'
            />
          </div>

          {isEditMode && (
            <div className='grid gap-2'>
              <Label>Status</Label>
              <RadioGroup value={status} onValueChange={(v) => setStatus(v as CardStatus)} className='flex space-x-4'>
                <div className='flex items-center space-x-2'>
                  <RadioGroupItem id='status-todo' value='todo' />
                  <Label htmlFor='status-todo' className='font-sans'>
                    To Do
                  </Label>
                </div>
                <div className='flex items-center space-x-2'>
                  <RadioGroupItem id='status-in-progress' value='in-progress' />
                  <Label htmlFor='status-in-progress' className='font-sans'>
                    In Progress
                  </Label>
                </div>
                <div className='flex items-center space-x-2'>
                  <RadioGroupItem id='status-completed' value='completed' />
                  <Label htmlFor='status-completed' className='font-sans'>
                    Completed
                  </Label>
                </div>
              </RadioGroup>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant='outline' onClick={() => setIsOpen(false)} className='font-sans'>
            Cancel
          </Button>
          <Button type='button' onClick={handleSubmit} className='font-sans'>
            {isEditMode ? 'Save' : 'Create'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
