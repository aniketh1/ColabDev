"use client";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function ConnectionStatus() {
  const [ping, setPing] = useState<number>(0);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    let toastId: string | number | undefined;

    const checkConnection = async () => {
      setIsChecking(true);
      
      try {
        // Use a lightweight image ping for more accurate results
        const img = new Image();
        const startTime = performance.now();
        
        // Add timestamp to prevent caching
        img.src = `https://www.google.com/favicon.ico?t=${Date.now()}`;
        
        await new Promise((resolve, reject) => {
          img.onload = () => {
            const endTime = performance.now();
            const latency = Math.round(endTime - startTime);
            setPing(latency);
            
            // Show toast only when connection is slow
            if (latency > 200) {
              if (toastId) {
                toast.dismiss(toastId);
              }
              toastId = toast.error(
                `Slow connection: ${latency}ms. Collaboration may lag.`,
                { 
                  duration: 5000,
                  id: 'slow-connection'
                }
              );
            } else if (toastId && latency <= 200) {
              toast.dismiss(toastId);
              toastId = undefined;
            }
            
            resolve(true);
          };
          
          img.onerror = () => {
            reject(new Error('Network error'));
          };
          
          // Timeout after 3 seconds
          setTimeout(() => reject(new Error('Timeout')), 3000);
        });
      } catch {
        setPing(999);
        if (toastId) {
          toast.dismiss(toastId);
        }
        toastId = toast.error('Connection lost', { 
          duration: 5000,
          id: 'connection-lost'
        });
      }
      
      setIsChecking(false);
    };

    // Check immediately
    checkConnection();

    // Check every 3 seconds for more frequent updates
    const interval = setInterval(checkConnection, 3000);

    return () => {
      clearInterval(interval);
      if (toastId) {
        toast.dismiss(toastId);
      }
    };
  }, []);

  const getStatusColor = () => {
    if (ping === 0 || isChecking) return 'bg-gray-500';
    if (ping === 999) return 'bg-red-500 animate-pulse';
    if (ping > 200) return 'bg-red-500';
    if (ping > 100) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStatusText = () => {
    if (ping === 0 && isChecking) return 'Checking...';
    if (ping === 999) return 'Offline';
    return `${ping}ms`;
  };

  const getStatusLabel = () => {
    if (ping === 0 || isChecking) return 'Checking';
    if (ping === 999) return 'Offline';
    if (ping > 200) return 'Slow';
    if (ping > 100) return 'Medium';
    return 'Fast';
  };

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#1e1e1e] border border-[#2d2d2d]">
      <div className={`w-2 h-2 rounded-full ${getStatusColor()} transition-colors`} />
      <div className="flex flex-col">
        <span className="text-xs text-[#cccccc] font-medium leading-none">
          {getStatusText()}
        </span>
        <span className="text-[10px] text-[#999999] leading-none mt-0.5">
          {getStatusLabel()}
        </span>
      </div>
    </div>
  );
}
