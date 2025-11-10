"use client";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function ConnectionStatus() {
  const [ping, setPing] = useState<number>(0);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    let toastId: string | number | undefined;

    const checkConnection = async () => {
      setIsChecking(true);
      const startTime = performance.now();
      
      try {
        // Ping a fast endpoint to check connection speed
        await fetch('/api/user', { 
          method: 'HEAD',
          cache: 'no-store'
        });
        
        const endTime = performance.now();
        const latency = Math.round(endTime - startTime);
        setPing(latency);

        // Show toast only when connection is slow
        if (latency > 200) {
          if (toastId) {
            toast.dismiss(toastId);
          }
          toastId = toast.error(
            `Slow connection detected (${latency}ms). Collaboration may be affected.`,
            { 
              duration: 5000,
              id: 'slow-connection'
            }
          );
        } else if (toastId && latency <= 200) {
          toast.dismiss(toastId);
          toastId = undefined;
        }
      } catch (error) {
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

    // Check every 5 seconds
    const interval = setInterval(checkConnection, 5000);

    return () => {
      clearInterval(interval);
      if (toastId) {
        toast.dismiss(toastId);
      }
    };
  }, []);

  const getStatusColor = () => {
    if (ping === 0 || isChecking) return 'bg-gray-500';
    if (ping > 200) return 'bg-red-500 animate-pulse';
    if (ping > 100) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStatusText = () => {
    if (ping === 0) return 'Checking...';
    if (ping === 999) return 'Offline';
    return `${ping}ms`;
  };

  return (
    <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-[#1e1e1e] border border-[#2d2d2d]">
      <div className={`w-2 h-2 rounded-full ${getStatusColor()}`} />
      <span className="text-xs text-[#cccccc] font-medium">
        {getStatusText()}
      </span>
    </div>
  );
}
