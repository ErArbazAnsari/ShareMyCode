import * as React from "react"

export type ToastActionElement = React.ReactElement

export interface ToastProps extends React.HTMLAttributes<HTMLDivElement> {
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export type ToasterToast = ToastProps & {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionElement
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export interface Toast extends Omit<ToasterToast, "id"> {}

export interface UseToastReturns {
  toast: (props: Toast) => void
  dismiss: (toastId?: string) => void
}
