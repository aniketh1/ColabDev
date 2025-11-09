'use client'
import LogoIcon from '@/components/LogoIcon'
import { Button } from '@/components/ui/button'
import { SidebarTriggerDashboard } from '@/components/ui/sidebar'
import UserAvatar from '@/components/UserAvatar'
import { useSession } from 'next-auth/react'
import React from 'react'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'

const DashboardHeader = () => {
  const session = useSession()
  const { theme, setTheme } = useTheme()

  return (
    <header className='h-16 bg-white dark:bg-black border-b border-border flex items-center px-4 lg:px-6 sticky top-0 z-40 shadow-sm'>
      {/* Logo Icon - Always visible */}
      <div className='mr-4'>
        <LogoIcon w={40} h={40} href="/dashboard" />
      </div>

      <div className='hidden md:flex items-center gap-2'>
        <span className='text-lg font-semibold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent'>
          Welcome back,
        </span>
        <span className='text-lg font-bold'>{session.data?.user.name}</span>
      </div>

      <div className='ml-auto flex items-center gap-3'>
        {/* Theme Toggle Button */}
        <Button
          variant="outline"
          size="icon"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className='rounded-full w-10 h-10 border-2 hover:border-primary transition-all'
        >
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>

        <div className='hidden md:block'>
          <UserAvatar/>
        </div>
      </div>

      <div className='md:hidden ml-3'>
        <SidebarTriggerDashboard/>
      </div>
    </header>
  )
}

export default DashboardHeader
