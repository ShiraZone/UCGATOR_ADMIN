import React, { createContext, useContext, useState } from "react"

type LoadingContextType = {
    loading: boolean
    message?: string
    setLoading: (value: boolean, message?: string) => void
};

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const LoadingProvider = ({ children }: { children: React.ReactNode }) => {
    const [loading, setLoadingState] = useState(false);
    const [message, setMessage] = useState<string | undefined>(undefined);

    const setLoading = (value: boolean, msg?: string) => {
        setLoadingState(value);
        setMessage(msg);
    }

    return (
        <LoadingContext.Provider value={{ loading, message, setLoading }}>
            {children}
        </LoadingContext.Provider>
    )
}

export const useLoading = () => {
    const context = useContext(LoadingContext);

    if(!context) throw new Error('useLoading must be used within a LoadingProvider');
    
    return context
}