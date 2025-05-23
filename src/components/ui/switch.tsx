import * as React from "react"
import { cn } from "@/lib/utils"

interface SwitchProps extends React.InputHTMLAttributes<HTMLInputElement> {
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
}

const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, checked = false, onCheckedChange, ...props }, ref) => {
    // État local pour gérer l'état du switch
    const [isChecked, setIsChecked] = React.useState(checked);

    // Mettre à jour l'état local lorsque la prop checked change
    React.useEffect(() => {
      setIsChecked(!!checked);
    }, [checked]);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const newChecked = event.target.checked;
      setIsChecked(newChecked);

      if (onCheckedChange) {
        onCheckedChange(newChecked);
      }
    };

    // Ajouter un gestionnaire de clic pour améliorer l'expérience utilisateur
    const handleClick = () => {
      const newChecked = !isChecked;
      setIsChecked(newChecked);

      if (onCheckedChange) {
        onCheckedChange(newChecked);
      }
    };

    return (
      <div
        className={cn(
          "relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer",
          isChecked ? "bg-primary" : "bg-muted",
          className
        )}
        onClick={handleClick}
      >
        <input
          type="checkbox"
          className="peer sr-only"
          checked={isChecked}
          onChange={handleChange}
          ref={ref}
          {...props}
        />
        <span
          className={cn(
            "pointer-events-none block h-5 w-5 rounded-full bg-white dark:bg-gray-200 shadow-lg ring-0 transition-transform",
            isChecked ? "translate-x-5" : "translate-x-1"
          )}
        />
      </div>
    )
  }
)

export { Switch }
