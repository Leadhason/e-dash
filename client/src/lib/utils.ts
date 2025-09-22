import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Responsive utility functions
export const responsive = {
  // Common mobile-first grid patterns
  gridCols: {
    mobile: "grid-cols-1",
    tablet: "md:grid-cols-2", 
    desktop: "lg:grid-cols-3",
    wide: "xl:grid-cols-4"
  },
  
  // Responsive spacing
  spacing: {
    container: "px-4 md:px-6 lg:px-8",
    section: "space-y-4 md:space-y-6",
    items: "space-x-2 md:space-x-4"
  },
  
  // Typography scales
  text: {
    heading: "text-2xl md:text-3xl lg:text-4xl",
    subheading: "text-lg md:text-xl",
    body: "text-sm md:text-base",
    caption: "text-xs md:text-sm"
  },
  
  // Button sizes
  button: {
    mobile: "h-10 px-4 min-h-[44px]",
    desktop: "md:h-9 md:min-h-[36px]",
    icon: "h-10 w-10 min-h-[44px] md:h-9 md:w-9 md:min-h-[36px]"
  }
}

// Responsive class generator
export function responsiveClass(mobileClass: string, desktopClass?: string) {
  if (!desktopClass) return mobileClass
  return `${mobileClass} md:${desktopClass}`
}

// Touch-friendly sizing utilities
export function touchFriendly(baseClass: string) {
  return cn(baseClass, "touch-manipulation min-h-[44px] md:min-h-auto")
}

// Mobile-first breakpoint utilities
export const breakpoints = {
  mobile: '320px',
  mobileLarge: '375px', 
  tablet: '768px',
  desktop: '1024px',
  wide: '1280px'
} as const

// Screen size detection utilities (for use in components)
export function getScreenSize(width: number): keyof typeof breakpoints {
  if (width < 375) return 'mobile'
  if (width < 768) return 'mobileLarge'
  if (width < 1024) return 'tablet'
  if (width < 1280) return 'desktop'
  return 'wide'
}

// Container responsive classes
export const containerClasses = cn(
  "w-full max-w-none",
  "px-4 md:px-6 lg:px-8",
  "mx-auto"
)

// Card responsive variants
export const cardVariants = {
  mobile: "p-4 space-y-3",
  desktop: "md:p-6 md:space-y-4"
}
