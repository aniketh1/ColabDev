'use client'
import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import Axios from '@/lib/Axios'
import { toast } from 'sonner'
import Image from 'next/image'
import CreateProject from './_component/CreateProject'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useRouter } from 'next/navigation'
import { Code2, FolderOpen, Clock, Sparkles, ArrowRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

const Dashboardpage = () => {
  const [data,setData] = useState<any[]>([])
  const [isLoading,setIsLoading] = useState(true)
  const [page,setPage] = useState(1)
  const [totalPage,setTotalPage] = useState(1)
  const router = useRouter()

  const fetchData = async()=>{
    try {
      setIsLoading(true)
      const response = await Axios({
        url : "/api/project",
        params : {
          page : page
        }
      })

      if(response.status === 200){
          setData(response.data.data || [])
          setTotalPage(response.data.totalPages)
      }

    } catch (error : any) {
      toast.error(error?.response?.data?.error)
    } finally{
      setIsLoading(false)
    }
  }

  useEffect(()=>{
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[page])

  const handleRedirectEditorpage = (projectId : string)=>{
    router.push(`${process.env.NEXT_PUBLIC_BASE_URL}/editor/${projectId}?file=index.html`)
  }

  const getTechStackIcon = (techStack: string) => {
    const icons: any = {
      react: '⚛️',
      vue: '💚',
      node: '🟢',
      html: '🌐',
      javascript: '⚡'
    }
    return icons[techStack.toLowerCase()] || '📄'
  }

  const getTechStackColor = (techStack: string) => {
    const colors: any = {
      react: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
      vue: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20',
      node: 'bg-green-600/10 text-green-700 dark:text-green-400 border-green-600/20',
      html: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20',
      javascript: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20'
    }
    return colors[techStack.toLowerCase()] || 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20'
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMs = now.getTime() - date.getTime()
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))
    
    if (diffInDays === 0) return 'Today'
    if (diffInDays === 1) return 'Yesterday'
    if (diffInDays < 7) return `${diffInDays} days ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  return (
    <div className='min-h-[calc(100vh-4rem)]'>
      {
        isLoading ? (
          <div className='flex items-center justify-center min-h-[calc(100vh-4rem)]'>
            <div className='flex flex-col items-center gap-4'>
              <div className='w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin'></div>
              <p className='text-muted-foreground animate-pulse'>Loading your projects...</p>
            </div>
          </div>
        ) : (
          !(Array.isArray(data) && data.length > 0) ? (
            <div className='flex justify-center items-center flex-col min-h-[calc(100vh-4rem)] px-4'>
              <div className='relative'>
                <div className='absolute inset-0 bg-primary/20 blur-3xl rounded-full'></div>
                <Image
                  src={"/project.svg"}
                  width={300}
                  height={300}
                  alt='Create project'
                  className='relative'
                />
              </div>
              <h2 className='text-2xl font-bold mt-6 mb-2 text-center'>No Projects Yet</h2>
              <p className='text-muted-foreground mb-6 text-center max-w-md'>
                Start building something amazing! Create your first project with our powerful editor.
              </p>
              <CreateProject buttonVarient='default'/>
            </div>
          ) : (
            <div className='p-4 lg:p-8'>
              {/* Header Section */}
              <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8'>
                <div>
                  <h1 className='text-3xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent flex items-center gap-2'>
                    <Sparkles className='w-7 h-7 text-primary' />
                    My Projects
                  </h1>
                  <p className='text-muted-foreground mt-1'>
                    {data.length} {data.length === 1 ? 'project' : 'projects'} in your workspace
                  </p>
                </div>
                <CreateProject buttonVarient='default'/>
              </div>

              {/* Projects Grid */}
              <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
                {
                  data.map((item) => {
                    return(
                      <Card 
                        onClick={() => handleRedirectEditorpage(item?._id)} 
                        key={item?._id} 
                        className='group cursor-pointer overflow-hidden border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 bg-card hover:-translate-y-1'
                      >
                        <CardHeader className='pb-3'>
                          <div className='flex items-start justify-between gap-2 mb-2'>
                            <div className='p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors'>
                              <Code2 className='w-5 h-5 text-primary' />
                            </div>
                            <Badge 
                              variant="outline" 
                              className={`${getTechStackColor(item.techStack)} border font-medium`}
                            >
                              {getTechStackIcon(item.techStack)} {item.techStack}
                            </Badge>
                          </div>
                          <CardTitle className='text-xl font-bold group-hover:text-primary transition-colors line-clamp-1'>
                            {item.name}
                          </CardTitle>
                          <CardDescription className='flex items-center gap-2 text-xs mt-2'>
                            <Clock className='w-3 h-3' />
                            {formatDate(item.updatedAt)}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className='pt-0'>
                          <div className='flex items-center justify-between mt-4 pt-4 border-t border-border'>
                            <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                              <FolderOpen className='w-4 h-4' />
                              <span>Open Project</span>
                            </div>
                            <ArrowRight className='w-5 h-5 text-primary group-hover:translate-x-1 transition-transform' />
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })
                }
              </div>

              {/* Pagination */}
              {totalPage > 1 && (
                <div className='flex justify-center items-center gap-2 mt-8'>
                  <Button
                    variant="outline"
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  <span className='text-sm text-muted-foreground px-4'>
                    Page {page} of {totalPage}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => setPage(Math.min(totalPage, page + 1))}
                    disabled={page === totalPage}
                  >
                    Next
                  </Button>
                </div>
              )}
            </div>
          )
        )
      }
    </div>
  )
}

export default Dashboardpage
