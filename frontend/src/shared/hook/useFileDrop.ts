import { useState, useCallback } from "react"

interface UseFileDropProps {
  onFileDrop: (file: File) => void
}

export const useFileDrop = ({ onFileDrop }: UseFileDropProps) => {
  const [isDragging, setIsDragging] = useState(false)

  const onDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(false)

      const file = e.dataTransfer.files?.[0]
      if (file && file.type.startsWith("image/")) {
        onFileDrop(file)
      }
    },
    [onFileDrop]
  )

  return {
    isDragging,
    dragEvents: {
      onDragEnter,
      onDragLeave,
      onDragOver,
      onDrop,
    },
  }
}
