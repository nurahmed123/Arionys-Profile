/**
 * Utility functions for consistent text formatting across blocks
 */

import { getTheme, getThemeClasses } from "./themes"

export interface TextFormatOptions {
  theme: string
  size?: "xs" | "sm" | "base" | "lg" | "xl" | "2xl" | "3xl"
  weight?: "light" | "normal" | "medium" | "semibold" | "bold"
  type?: "heading" | "body" | "muted"
  align?: "left" | "center" | "right" | "justify"
}

/**
 * Returns consistent text formatting classes based on theme and options
 */
export function getTextClasses(options: TextFormatOptions): string {
  const { theme, size = "base", weight, type = "body", align = "left" } = options
  const themeConfig = getTheme(theme)
  const classes = getThemeClasses(themeConfig)
  
  // Base text classes
  let textClasses = ""
  
  // Add theme-specific text class
  if (type === "heading") {
    textClasses += classes.heading
  } else if (type === "muted") {
    textClasses += classes.muted
  } else {
    textClasses += classes.body
  }
  
  // Add size class
  textClasses += ` text-${size}`
  
  // Add weight class if specified
  if (weight) {
    textClasses += ` font-${weight}`
  }
  
  // Add alignment
  if (align !== "left") {
    textClasses += ` text-${align}`
  }
  
  return textClasses
}

/**
 * Applies consistent spacing between text elements
 */
export function getTextSpacing(theme: string): string {
  const themeConfig = getTheme(theme)
  const classes = getThemeClasses(themeConfig)
  return classes.spacing
}