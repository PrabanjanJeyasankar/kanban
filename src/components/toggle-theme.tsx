'use client'

import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'
import { JSX } from 'react/jsx-runtime'

export const ThemeToggle = (): JSX.Element => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    const storedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null
    if (storedTheme) {
      setTheme(storedTheme)
      document.documentElement.classList.toggle('dark', storedTheme === 'dark')
    }
  }, [])

  const toggleTheme = (): void => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    document.documentElement.classList.toggle('dark', newTheme === 'dark')
    localStorage.setItem('theme', newTheme)
    setTheme(newTheme)
  }

  return (
    <button onClick={toggleTheme} className='rounded-md p-1 hover:bg-muted transition-colors' aria-label='Toggle theme'>
      {theme === 'dark' ? <Sun className='h-5 w-5 text-primary' /> : <Moon className='h-5 w-5 text-primary' />}
    </button>
  )
}
