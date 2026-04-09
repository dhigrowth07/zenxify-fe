import { cn } from "../../lib/utils";

/**
 * Skeleton component for loading states.
 * 
 * @param {{ className?: string, variant?: 'rectangle' | 'circle' | 'text' }} props
 */
function Skeleton({ className, variant = 'rectangle', ...props }) {
  return (
    <div
      className={cn(
        "animate-pulse bg-gray-200/60 dark:bg-gray-800/60",
        variant === 'circle' && "rounded-full",
        variant === 'rectangle' && "rounded-2xl",
        variant === 'text' && "rounded-md h-4 w-full",
        className
      )}
      {...props}
    />
  );
}

export { Skeleton };
