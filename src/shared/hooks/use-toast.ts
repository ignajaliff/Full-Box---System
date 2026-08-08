import * as React from "react"

import type {
  ToastActionElement,
  ToastProps,
} from "@/shared/components/ui/toast"

const TOAST_LIMIT = 3
const TOAST_REMOVE_DELAY = 5000

type ToasterToast = ToastProps & {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionElement
}

type State = { toasts: ToasterToast[] }

let count = 0

function generarId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER
  return count.toString()
}

const listeners: Array<(state: State) => void> = []
let memoryState: State = { toasts: [] }
const timeouts = new Map<string, ReturnType<typeof setTimeout>>()

function setState(next: State) {
  memoryState = next
  listeners.forEach((listener) => listener(memoryState))
}

function removerToast(toastId: string) {
  const timeout = timeouts.get(toastId)
  if (timeout) clearTimeout(timeout)
  timeouts.delete(toastId)
  setState({ toasts: memoryState.toasts.filter((t) => t.id !== toastId) })
}

function programarCierre(toastId: string) {
  if (timeouts.has(toastId)) return
  timeouts.set(
    toastId,
    setTimeout(() => removerToast(toastId), TOAST_REMOVE_DELAY)
  )
}

export function toast({
  ...props
}: Omit<ToasterToast, "id">) {
  const id = generarId()

  const dismiss = () =>
    setState({
      toasts: memoryState.toasts.map((t) =>
        t.id === id ? { ...t, open: false } : t
      ),
    })

  setState({
    toasts: [
      {
        ...props,
        id,
        open: true,
        onOpenChange: (open: boolean) => {
          if (!open) removerToast(id)
        },
      },
      ...memoryState.toasts,
    ].slice(0, TOAST_LIMIT),
  })

  programarCierre(id)

  return { id, dismiss }
}

export function useToast() {
  const [state, setLocalState] = React.useState<State>(memoryState)

  React.useEffect(() => {
    listeners.push(setLocalState)
    return () => {
      const index = listeners.indexOf(setLocalState)
      if (index > -1) listeners.splice(index, 1)
    }
  }, [])

  return {
    ...state,
    toast,
    dismiss: (toastId: string) => removerToast(toastId),
  }
}
