'use client'

import { CheckCircle } from 'lucide-react'
import { ThemeToggle } from '@/components/toggle-theme'
import { useKanbanStore } from '@/store/kanban-store'
import { JSX } from 'react/jsx-runtime'

export const KanbanNavbar = (): JSX.Element => {
  const completedCount = useKanbanStore((s) => s.tasks.filter((t) => t.status === 'completed').length)

  return (
    <nav className='w-full border-b border-border px-4 py-3 flex items-center justify-between'>
      <div className='text-lg font-semibold tracking-tight font-mono'>KanbanBoard</div>

      <div className='flex items-center gap-4'>
        <div className='flex items-center text-sm text-muted-foreground font-mono'>
          <CheckCircle className='h-4 w-4 mr-1 text-primary' />
          {completedCount} done
        </div>
        <ThemeToggle />
      </div>
    </nav>
  )
}
