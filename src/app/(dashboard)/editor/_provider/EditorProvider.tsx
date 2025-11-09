'use client'
import { createContext, useContext, useState } from 'react'

interface TEditorProvider {
    isLoading : boolean
    setIsLoading : (value : boolean)=>void
    openBrowser : boolean;
    setOpenBrowser : (value : boolean)=>void
    code: string;
    setCode: (value: string) => void;
}

const initialValue = {
    isLoading : false,
    setIsLoading : ()=>{},
    openBrowser : false,
    setOpenBrowser : ()=>{},
    code: '',
    setCode: () => {}
}

const EditorProvider = createContext<TEditorProvider>(initialValue)

export const useEditorContext = ()=>useContext(EditorProvider)


export function EditorProviderComp({children} : { children : React.ReactNode }){
    const [isLoading,setIsLoading] = useState<boolean>(false)
    const [openBrowser,setOpenBrowser] = useState<boolean>(false)
    const [code, setCode] = useState<string>('')

    const handleLoading = (value? : boolean)=>{
        setIsLoading(value || false)
    }

    const handleOpenBrowser = (value? : boolean)=>{
        setOpenBrowser(value || false)
    }

    const handleSetCode = (value: string) => {
        setCode(value)
    }


    return(
        <EditorProvider.Provider value={{
            isLoading : isLoading,
            setIsLoading : handleLoading,
            openBrowser: openBrowser,
            setOpenBrowser : handleOpenBrowser,
            code: code,
            setCode: handleSetCode
        }}>
            {children}
        </EditorProvider.Provider>
    )
}

