import * as Recharts from 'recharts'
import * as React from 'react'

type RechartsComponent = keyof typeof Recharts

interface RechartsWrapperProps {
  component: RechartsComponent
  children?: React.ReactNode
  [key: string]: unknown
}

export const RechartsWrapper = ({
  component,
  children,
  ...props
}: RechartsWrapperProps) => {
  const Component = Recharts[component] as React.ComponentType<any>
  return <Component {...props}>{children}</Component>
}
