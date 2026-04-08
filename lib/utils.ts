import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

export function formatTime(date: Date | string) {
  return new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

export function calculateWorkHours(entries: any[]) {
  let totalMinutes = 0
  
  for (let i = 0; i < entries.length; i += 2) {
    const entry = entries[i]
    const exit = entries[i + 1]
    
    if (entry && exit && entry.type === 'ENTRY' && exit.type === 'EXIT') {
      const entryTime = new Date(entry.timestamp)
      const exitTime = new Date(exit.timestamp)
      const diffMinutes = (exitTime.getTime() - entryTime.getTime()) / (1000 * 60)
      totalMinutes += diffMinutes
    }
  }
  
  const hours = Math.floor(totalMinutes / 60)
  const minutes = Math.floor(totalMinutes % 60)
  
  return { hours, minutes, totalMinutes }
}
