import * as React from "react"

export interface FieldContextValue {
  invalid: boolean
  errorId?: string
  hintId?: string
}

export const FieldContext = React.createContext<FieldContextValue | null>(null)

export function useFieldContext(): FieldContextValue | null {
  return React.useContext(FieldContext)
}
