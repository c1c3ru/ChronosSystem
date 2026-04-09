/**
 * Focus Management Utilities
 *
 * Provides utilities for managing focus in modals, dialogs, and complex components
 */

import { getFocusableElements } from './keyboard-shortcuts'

/**
 * Focus trap for modals and dialogs
 */
export class FocusTrap {
  private container: HTMLElement
  private previouslyFocusedElement: HTMLElement | null = null
  private isActive = false

  constructor(container: HTMLElement) {
    this.container = container
  }

  /**
   * Activate the focus trap
   */
  activate() {
    if (this.isActive) return

    // Store the currently focused element
    this.previouslyFocusedElement = document.activeElement as HTMLElement

    // Focus the first focusable element in the container
    const focusableElements = getFocusableElements(this.container)
    if (focusableElements.length > 0) {
      focusableElements[0].focus()
    }

    // Add event listener for Tab key
    this.container.addEventListener('keydown', this.handleKeyDown)
    this.isActive = true
  }

  /**
   * Deactivate the focus trap
   */
  deactivate() {
    if (!this.isActive) return

    this.container.removeEventListener('keydown', this.handleKeyDown)
    this.isActive = false

    // Restore focus to the previously focused element
    if (this.previouslyFocusedElement) {
      this.previouslyFocusedElement.focus()
    }
  }

  /**
   * Handle Tab key to trap focus
   */
  private handleKeyDown = (event: KeyboardEvent) => {
    if (event.key !== 'Tab') return

    const focusableElements = getFocusableElements(this.container)
    if (focusableElements.length === 0) return

    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]
    const activeElement = document.activeElement as HTMLElement

    // Shift + Tab
    if (event.shiftKey) {
      if (activeElement === firstElement) {
        event.preventDefault()
        lastElement.focus()
      }
    }
    // Tab
    else {
      if (activeElement === lastElement) {
        event.preventDefault()
        firstElement.focus()
      }
    }
  }

  /**
   * Clean up
   */
  destroy() {
    this.deactivate()
  }
}

/**
 * Create a focus trap for a container
 */
export function createFocusTrap(container: HTMLElement): FocusTrap {
  return new FocusTrap(container)
}

/**
 * Restore focus to an element
 */
export function restoreFocus(element: HTMLElement | null) {
  if (element && typeof element.focus === 'function') {
    // Use setTimeout to ensure the element is ready to receive focus
    setTimeout(() => {
      element.focus()
    }, 0)
  }
}

/**
 * Focus the first focusable element in a container
 */
export function focusFirstElement(container: HTMLElement) {
  const focusableElements = getFocusableElements(container)
  if (focusableElements.length > 0) {
    focusableElements[0].focus()
  }
}

/**
 * Focus the last focusable element in a container
 */
export function focusLastElement(container: HTMLElement) {
  const focusableElements = getFocusableElements(container)
  if (focusableElements.length > 0) {
    focusableElements[focusableElements.length - 1].focus()
  }
}

/**
 * Roving tabindex manager for component groups (like radio buttons or tabs)
 */
export class RovingTabIndex {
  private container: HTMLElement
  private items: HTMLElement[] = []
  private currentIndex = 0

  constructor(container: HTMLElement, itemSelector: string) {
    this.container = container
    this.items = Array.from(container.querySelectorAll<HTMLElement>(itemSelector))
    this.initialize()
  }

  /**
   * Initialize roving tabindex
   */
  private initialize() {
    this.items.forEach((item, index) => {
      item.setAttribute('tabindex', index === 0 ? '0' : '-1')
      item.addEventListener('keydown', this.handleKeyDown)
      item.addEventListener('focus', () => this.setCurrentIndex(index))
    })
  }

  /**
   * Handle arrow key navigation
   */
  private handleKeyDown = (event: KeyboardEvent) => {
    let newIndex = this.currentIndex

    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        event.preventDefault()
        newIndex = (this.currentIndex + 1) % this.items.length
        break
      case 'ArrowLeft':
      case 'ArrowUp':
        event.preventDefault()
        newIndex = (this.currentIndex - 1 + this.items.length) % this.items.length
        break
      case 'Home':
        event.preventDefault()
        newIndex = 0
        break
      case 'End':
        event.preventDefault()
        newIndex = this.items.length - 1
        break
      default:
        return
    }

    this.focusItem(newIndex)
  }

  /**
   * Focus an item by index
   */
  private focusItem(index: number) {
    if (index < 0 || index >= this.items.length) return

    this.items[this.currentIndex].setAttribute('tabindex', '-1')
    this.items[index].setAttribute('tabindex', '0')
    this.items[index].focus()
    this.currentIndex = index
  }

  /**
   * Set current index
   */
  private setCurrentIndex(index: number) {
    this.currentIndex = index
  }

  /**
   * Clean up
   */
  destroy() {
    this.items.forEach((item) => {
      item.removeEventListener('keydown', this.handleKeyDown)
    })
  }
}

/**
 * Create a roving tabindex for a container
 */
export function createRovingTabIndex(container: HTMLElement, itemSelector: string): RovingTabIndex {
  return new RovingTabIndex(container, itemSelector)
}
