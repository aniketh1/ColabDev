import Logo from "@/components/Logo";
import LogoIcon from "@/components/LogoIcon";
import TextAnimationHeading from "@/components/TextAnimationHeading";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Suspense } from "react";

export default function AuthLayout({children} : { children : React.ReactNode}){
    return(
        <div className="grid lg:grid-cols-2 min-h-screen max-h-screen h-full relative bg-background">
            {/* Logo Icon - Top Left Mobile */}
            <div className="fixed top-4 left-4 z-50 lg:hidden">
                <LogoIcon w={36} h={36} href="/" />
            </div>

            {/* Theme Toggle - Fixed position */}
            <div className="fixed top-4 right-4 z-50">
                <ThemeToggle />
            </div>

            {/**animation text and logo */}
            <div className="hidden lg:flex flex-col p-10 bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 dark:from-primary/10 dark:via-primary/5 dark:to-primary/10 relative overflow-hidden">
                {/* Background decoration */}
                <div className="absolute top-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
                
                <div className="flex items-center relative z-10">
                    <Logo/>
                </div>
                <div className="h-full flex flex-col justify-center relative z-10">
                    <TextAnimationHeading
                        className="flex-row mx-0 lg:gap-2"
                    />
                    <p className="text-muted-foreground mt-6 text-lg max-w-md">
                        Build, collaborate, and deploy your projects with our powerful online editor.
                    </p>
                </div>
            </div>

        
            <Suspense fallback={
                <div className="flex items-center justify-center h-full bg-background">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
            }>
            <div className="h-full flex flex-col mt-14 lg:mt-0 lg:justify-center px-4 lg:p-6 overflow-auto bg-background">
                {children}
            </div>
            </Suspense>
        </div>
    )
}