import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-cyber focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 overflow-hidden font-cyber uppercase tracking-wide",
  {
    variants: {
      variant: {
        default: "bg-gradient-electric text-primary-foreground shadow-neural hover:shadow-electric border border-primary/30",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-primary/50 bg-background hover:bg-gradient-neural hover:text-accent-foreground hover:shadow-neural",
        secondary: "bg-gradient-card text-secondary-foreground hover:shadow-neural border border-primary/20",
        ghost: "hover:bg-gradient-neural hover:text-accent-foreground hover:shadow-neural",
        link: "text-primary underline-offset-4 hover:underline hover:text-primary-glow",
        
        // CYBERPUNK VARIANTS
        cyber: "bg-gradient-cyber text-primary-foreground hover:shadow-electric hover:scale-[1.02] border-2 border-primary transition-electric before:absolute before:inset-0 before:bg-gradient-electric before:opacity-0 hover:before:opacity-20",
        neural: "bg-gradient-glass backdrop-blur-sm text-primary border-2 border-primary/30 hover:border-primary/60 hover:shadow-neural hover:scale-[1.02] transition-cyber",
        matrix: "bg-gradient-cyber text-matrix-green border-2 border-matrix-green/50 hover:border-matrix-green hover:shadow-matrix hover:text-matrix-green transition-cyber",
        electric: "bg-gradient-electric text-primary-foreground hover:shadow-electric hover:animate-cyber-glow transition-electric relative before:absolute before:inset-0 before:rounded-md before:bg-gradient-electric before:blur-sm before:opacity-0 hover:before:opacity-40",
        quantum: "bg-black/80 backdrop-blur-sm text-primary border-2 border-primary/20 hover:border-primary hover:shadow-neural hover:bg-gradient-neural transition-cyber relative before:absolute before:top-0 before:left-0 before:w-full before:h-full before:bg-gradient-to-r before:from-transparent before:via-primary/10 before:to-transparent before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-1000",
        hologram: "bg-gradient-glass backdrop-blur-md text-primary-foreground border border-primary/40 shadow-neural hover:shadow-electric transition-cyber relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:translate-x-[-100%] hover:before:animate-holo-shimmer",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        xl: "h-12 rounded-lg px-10 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
