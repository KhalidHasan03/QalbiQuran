import { create } from 'zustand'

export interface Toast {
  id: number
  title: string
  description?: string
  variant: 'default' | 'success' | 'error'
}

interface ToastState {
  toasts: Toast[]
  push: (toast: Omit<Toast, 'id'>) => void
  dismiss: (id: number) => void
}

let counter = 0

export const useToasts = create<ToastState>((set) => ({
  toasts: [],
  push: (toast) => {
    const id = ++counter
    set((s) => ({ toasts: [...s.toasts, { ...toast, id }] }))
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }))
    }, 4500)
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}))

export const toast = {
  success: (title: string, description?: string) =>
    useToasts.getState().push({ title, description, variant: 'success' }),
  error: (title: string, description?: string) =>
    useToasts.getState().push({ title, description, variant: 'error' }),
  info: (title: string, description?: string) =>
    useToasts.getState().push({ title, description, variant: 'default' }),
}
