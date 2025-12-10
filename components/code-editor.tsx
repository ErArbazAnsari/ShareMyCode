"use client"

import type React from "react"

import { useState } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface CodeEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function CodeEditor({ value, onChange, placeholder }: CodeEditorProps) {
  const [tabSize, setTabSize] = useState("2")
  const [wrapMode, setWrapMode] = useState("no-wrap")

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab") {
      e.preventDefault()
      const target = e.target as HTMLTextAreaElement
      const start = target.selectionStart
      const end = target.selectionEnd
      const spaces = " ".repeat(Number.parseInt(tabSize))

      const newValue = value.substring(0, start) + spaces + value.substring(end)
      onChange(newValue)

      setTimeout(() => {
        target.selectionStart = target.selectionEnd = start + spaces.length
      }, 0)
    }
  }

  const lines = value.split("\n")
  const lineNumbers = Array.from({ length: Math.max(lines.length, 1) }, (_, i) => i + 1)

  return (
    <div className="border rounded-lg overflow-hidden bg-background">
      <div className="flex items-center justify-between p-2 border-b bg-muted/50">
        <div className="text-sm text-muted-foreground">
          Use <kbd className="px-1 py-0.5 text-xs bg-muted rounded">Ctrl+Shift+M</kbd> to toggle the{" "}
          <kbd className="px-1 py-0.5 text-xs bg-muted rounded">Tab</kbd> key moving focus.
        </div>
        <div className="flex items-center space-x-2">
          <Select value={tabSize} onValueChange={setTabSize}>
            <SelectTrigger className="w-20 h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2">2</SelectItem>
              <SelectItem value="4">4</SelectItem>
              <SelectItem value="8">8</SelectItem>
            </SelectContent>
          </Select>
          <Select value={wrapMode} onValueChange={setWrapMode}>
            <SelectTrigger className="w-24 h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="no-wrap">No wrap</SelectItem>
              <SelectItem value="wrap">Wrap</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex min-h-[300px]">
        <div className="flex flex-col bg-muted/30 text-muted-foreground text-sm font-mono p-2 select-none">
          {lineNumbers.map((num) => (
            <div key={num} className="leading-6 text-right pr-2 min-w-[2rem]">
              {num}
            </div>
          ))}
        </div>

        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-1 border-0 resize-none font-mono text-sm leading-6 focus-visible:ring-0 rounded-none"
          style={{
            whiteSpace: wrapMode === "wrap" ? "pre-wrap" : "pre",
            overflowWrap: wrapMode === "wrap" ? "break-word" : "normal",
          }}
        />
      </div>
    </div>
  )
}
