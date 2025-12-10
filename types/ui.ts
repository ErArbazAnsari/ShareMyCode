import React from "react"

export interface UseIsMobileReturns extends Boolean {}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
}

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {}

export type FormFieldContextValue = Record<string, any>

export interface GistCardProps {
  gist: any
  onDelete?: (id: string) => void
  onUpdate?: (id: string) => void
}
