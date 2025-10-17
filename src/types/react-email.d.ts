declare module '@react-email/render' {
  import * as React from 'react'
  export function render(component: React.ReactElement, options?: { pretty?: boolean }): string | Promise<string>
}


