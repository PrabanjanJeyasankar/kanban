'use client'

export const dynamic = 'force-dynamic'

import { KanbanNavbar } from './(kanban)/components/navbar'
import { KanbanBoard } from './(kanban)/kanban-board'

export default function KanbanPage() {
  return (
    <main className='min-h-screen w-full bg-background text-foreground font-sans'>
      <KanbanNavbar />
      <section className='p-6'>
        <KanbanBoard />
      </section>
    </main>
  )
}
