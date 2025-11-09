'use client'
import { createContext, useContext, useState } from 'react'

interface TEditorProvider {
    isLoading: boolean
    setIsLoading: (value: boolean) => void
    openBrowser: boolean;
    setOpenBrowser: (value: boolean) => void
    code: string;
    setCode: (value: string) => void;
    projectAccess: {
        isOwner: boolean;
        isCollaborator: boolean;
        isPublic: boolean;
        canEdit: boolean;
    };
    setProjectAccess: (value: any) => void;
}

const initialValue = {
    isLoading: false,
    setIsLoading: () => {},
    openBrowser: false,
    setOpenBrowser: () => {},
    code: '',
    setCode: () => {},
    projectAccess: {
        isOwner: false,
        isCollaborator: false,
        isPublic: true,
        canEdit: false,
    },
    setProjectAccess: () => {}
}

const EditorProvider = createContext<TEditorProvider>(initialValue)

export const useEditorContext = () => useContext(EditorProvider)

export function EditorProviderComp({ children }: { children: React.ReactNode }) {
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [openBrowser, setOpenBrowser] = useState<boolean>(false)
    const [code, setCode] = useState<string>('')
    const [projectAccess, setProjectAccess] = useState({
        isOwner: false,
        isCollaborator: false,
        isPublic: true,
        canEdit: false,
    })

    const handleLoading = (value?: boolean) => {
        setIsLoading(value || false)
    }

    const handleOpenBrowser = (value?: boolean) => {
        setOpenBrowser(value || false)
    }

    const handleSetCode = (value: string) => {
        setCode(value)
    }

    const handleSetProjectAccess = (value: any) => {
        console.log('🔧 EditorProvider: setProjectAccess called with:', value);
        
        // Ensure canEdit is properly calculated
        const newAccess = {
            isOwner: value.isOwner || false,
            isCollaborator: value.isCollaborator || false,
            isPublic: value.isPublic !== false, // default true
            // canEdit is true if owner OR collaborator
            canEdit: value.isOwner || value.isCollaborator || false,
        };
        
        console.log('🔧 EditorProvider: Setting projectAccess to:', newAccess);
        setProjectAccess(newAccess);
    }

    return (
        <EditorProvider.Provider value={{
            isLoading: isLoading,
            setIsLoading: handleLoading,
            openBrowser: openBrowser,
            setOpenBrowser: handleOpenBrowser,
            code: code,
            setCode: handleSetCode,
            projectAccess: projectAccess,
            setProjectAccess: handleSetProjectAccess
        }}>
            {children}
        </EditorProvider.Provider>
    )
}