'use client'

import React, { useState, useEffect } from 'react'

interface LoadingScreenProps {
  userEmail?: string
  progress?: number
  message?: string
}

export function LoadingScreen({ 
  userEmail = 'benoats@gmail.com', 
  progress = 0,
  message = 'Building your AI-powered financial dashboard...'
}: LoadingScreenProps) {
  const [animatedProgress, setAnimatedProgress] = useState(0)

  useEffect(() => {
    // Animate progress from 0 to the target progress
    const duration = 2000 // 2 seconds
    const startTime = Date.now()
    
    const animate = () => {
      const elapsed = Date.now() - startTime
      const currentProgress = Math.min((elapsed / duration) * 100, progress)
      
      setAnimatedProgress(currentProgress)
      
      if (currentProgress < progress) {
        requestAnimationFrame(animate)
      }
    }
    
    requestAnimationFrame(animate)
  }, [progress])

  // Calculate the stroke-dasharray for the progress ring
  const radius = 40
  const circumference = 2 * Math.PI * radius
  const strokeDasharray = circumference
  const strokeDashoffset = circumference - (animatedProgress / 100) * circumference

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-64 h-64 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-2000"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Logo and Brand */}
        <div className="mb-12 text-center">
          <div className="relative mb-6">
            {/* Animated Logo Ring */}
            <div className="w-24 h-24 mx-auto relative">
              <div className="absolute inset-0 rounded-full border-4 border-white/20"></div>
              <div 
                className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-400 border-r-purple-400 animate-spin"
                style={{ animationDuration: '2s' }}
              ></div>
              <div className="absolute inset-2 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
                <span className="text-2xl font-bold text-white">S</span>
              </div>
            </div>
          </div>
          
          <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">
            SplitSave
          </h1>
          <p className="text-white/80 text-lg font-light mb-1">
            AI-Powered Financial Dashboard
          </p>
          <p className="text-white/60 text-sm">
            Building your personalized savings strategy...
          </p>
        </div>

        {/* Loading Animation */}
        <div className="relative mb-8">
          {/* Progress Ring */}
          <svg
            className="w-32 h-32 transform -rotate-90"
            viewBox="0 0 100 100"
          >
            {/* Background Circle */}
            <circle
              cx="50"
              cy="50"
              r={radius}
              stroke="rgba(255, 255, 255, 0.1)"
              strokeWidth="3"
              fill="none"
            />
            {/* Progress Circle */}
            <circle
              cx="50"
              cy="50"
              r={radius}
              stroke="url(#gradient)"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-500 ease-out drop-shadow-lg"
            />
            {/* Gradient Definition */}
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#60A5FA" />
                <stop offset="50%" stopColor="#8B5CF6" />
                <stop offset="100%" stopColor="#EC4899" />
              </linearGradient>
            </defs>
          </svg>

          {/* Center Content */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-bold text-white mb-1">
                {Math.round(animatedProgress)}%
              </div>
              <div className="w-2 h-2 bg-white/60 rounded-full mx-auto animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Loading Message */}
        <div className="text-center text-white/90 max-w-md">
          <p className="text-lg font-medium mb-2">{message}</p>
          <div className="flex items-center justify-center space-x-1">
            <div className="w-1 h-1 bg-white/60 rounded-full animate-bounce"></div>
            <div className="w-1 h-1 bg-white/60 rounded-full animate-bounce delay-100"></div>
            <div className="w-1 h-1 bg-white/60 rounded-full animate-bounce delay-200"></div>
          </div>
        </div>
      </div>

      {/* Bottom Branding */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white/40 text-sm">
        <p>Powered by smart financial technology</p>
      </div>
    </div>
  )
}

// Hook for managing loading state
export function useLoadingScreen() {
  const [isLoading, setIsLoading] = useState(true)
  const [progress, setProgress] = useState(0)
  const [message, setMessage] = useState('Building your AI-powered financial dashboard...')

  const startLoading = (initialMessage = 'Building your AI-powered financial dashboard...') => {
    setIsLoading(true)
    setProgress(0)
    setMessage(initialMessage)
  }

  const updateProgress = (newProgress: number, newMessage?: string) => {
    setProgress(newProgress)
    if (newMessage) {
      setMessage(newMessage)
    }
  }

  const finishLoading = () => {
    setProgress(100)
    setTimeout(() => {
      setIsLoading(false)
    }, 500)
  }

  return {
    isLoading,
    progress,
    message,
    startLoading,
    updateProgress,
    finishLoading
  }
}
