import React, { useState, useRef, useEffect } from 'react'
import { ChevronDown, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SimpleSelectProps {
  value: string
  onValueChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  children: React.ReactNode
}

export function SimpleSelect({
  value,
  onValueChange,
  placeholder = 'Sélectionner...',
  disabled = false,
  className,
  children
}: SimpleSelectProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Fermer le menu lorsqu'on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <div 
      ref={ref}
      className={cn(
        "relative w-full",
        className
      )}
    >
      <button
        type="button"
        onClick={() => !disabled && setOpen(!open)}
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          disabled && "opacity-50 cursor-not-allowed"
        )}
        aria-expanded={open}
        aria-disabled={disabled}
      >
        <span className="flex-1 text-left truncate">
          {value ? React.Children.toArray(children).find(
            (child) => React.isValidElement(child) && child.props.value === value
          ) ? (
            (React.Children.toArray(children).find(
              (child) => React.isValidElement(child) && child.props.value === value
            ) as React.ReactElement).props.children
          ) : value
          : placeholder}
        </span>
        <ChevronDown className="h-4 w-4 opacity-50" />
      </button>
      
      {open && (
        <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-popover text-popover-foreground shadow-md">
          <div className="p-1">
            {children}
          </div>
        </div>
      )}
    </div>
  )
}

interface SimpleSelectItemProps {
  value: string
  children: React.ReactNode
  disabled?: boolean
  className?: string
  onSelect: (value: string) => void
  isSelected: boolean
}

export function SimpleSelectItem({
  value,
  children,
  disabled = false,
  className,
  onSelect,
  isSelected
}: SimpleSelectItemProps) {
  return (
    <button
      type="button"
      className={cn(
        "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        isSelected && "bg-accent",
        disabled && "opacity-50 pointer-events-none",
        className
      )}
      onClick={() => !disabled && onSelect(value)}
      data-disabled={disabled}
      data-selected={isSelected}
    >
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        {isSelected && <Check className="h-4 w-4" />}
      </span>
      <span className="truncate">{children}</span>
    </button>
  )
}

export function SimpleSelectGroup({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <div className={cn("p-1", className)}>
      {children}
    </div>
  )
}

export function SimpleSelectLabel({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <div className={cn("px-2 py-1.5 text-xs font-medium text-muted-foreground", className)}>
      {children}
    </div>
  )
}

// Composant complet qui combine les sous-composants
interface SelectProps {
  value: string
  onValueChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  options: Array<{
    value: string
    label: string
    disabled?: boolean
  }>
}

export function Select({
  value,
  onValueChange,
  placeholder,
  disabled,
  className,
  options
}: SelectProps) {
  return (
    <SimpleSelect
      value={value}
      onValueChange={onValueChange}
      placeholder={placeholder}
      disabled={disabled}
      className={className}
    >
      {options.map((option) => (
        <SimpleSelectItem
          key={option.value}
          value={option.value}
          disabled={option.disabled}
          onSelect={onValueChange}
          isSelected={value === option.value}
        >
          {option.label}
        </SimpleSelectItem>
      ))}
    </SimpleSelect>
  )
}
