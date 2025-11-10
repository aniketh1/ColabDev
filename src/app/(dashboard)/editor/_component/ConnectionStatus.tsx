"use client";
import { useState } from "react";

export default function ConnectionStatus() {
  const [showSpeedTest, setShowSpeedTest] = useState(false);

  return (
    <div className="relative">
      {/* Speed Test Button */}
      <button
        onClick={() => setShowSpeedTest(!showSpeedTest)}
        className="flex items-center gap-2 px-3 py-1 rounded-md bg-[#1e1e1e] border border-[#2d2d2d] hover:bg-[#2a2d2e] transition-colors"
      >
        <svg className="w-3.5 h-3.5 text-[#007acc]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        <span className="text-xs text-[#cccccc] font-medium">
          Speed Test
        </span>
      </button>

      {/* Speed Test Modal */}
      {showSpeedTest && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setShowSpeedTest(false)}
          />
          
          {/* Modal */}
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 bg-[#252526] border border-[#2d2d2d] rounded-lg shadow-2xl w-[600px] max-w-[90vw]">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#2d2d2d]">
              <h3 className="text-sm font-semibold text-[#cccccc]">Internet Speed Test</h3>
              <button
                onClick={() => setShowSpeedTest(false)}
                className="text-[#999999] hover:text-[#cccccc] transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Speed Test Widget */}
            <div className="p-4">
              <div style={{ minHeight: '360px' }}>
                <div style={{ width: '100%', height: 0, paddingBottom: '50%', position: 'relative' }}>
                  <iframe 
                    style={{ 
                      border: 'none', 
                      position: 'absolute', 
                      top: 0, 
                      left: 0, 
                      width: '100%', 
                      height: '100%', 
                      minHeight: '360px', 
                      overflow: 'hidden'
                    }} 
                    src="https://www.metercustom.net/plugin/"
                    title="Speed Test"
                  />
                </div>
              </div>
              <div className="text-center text-xs text-[#999999] mt-2">
                Provided by <a href="https://www.meter.net" target="_blank" rel="noopener noreferrer" className="text-[#007acc] hover:underline">Meter.net</a>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
