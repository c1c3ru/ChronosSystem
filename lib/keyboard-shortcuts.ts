/**
 * Keyboard Navigation Utilities
 * 
 * Provides utilities for managing keyboard shortcuts and navigation
 */

type KeyboardShortcut = {
    key: string
    ctrlKey?: boolean
    shiftKey?: boolean
    altKey?: boolean
    metaKey?: boolean
    handler: (event: KeyboardEvent) => void
    description: string
}

class KeyboardShortcutManager {
    private shortcuts: Map<string, KeyboardShortcut> = new Map()
    private isListening = false

    /**
     * Register a keyboard shortcut
     */
    register(id: string, shortcut: KeyboardShortcut) {
        this.shortcuts.set(id, shortcut)
        if (!this.isListening) {
            this.startListening()
        }
    }

    /**
     * Unregister a keyboard shortcut
     */
    unregister(id: string) {
        this.shortcuts.delete(id)
        if (this.shortcuts.size === 0) {
            this.stopListening()
        }
    }

    /**
     * Handle keyboard events
     */
    private handleKeyDown = (event: KeyboardEvent) => {
        // Don't trigger shortcuts when typing in inputs
        const target = event.target as HTMLElement
        if (
            target.tagName === 'INPUT' ||
            target.tagName === 'TEXTAREA' ||
            target.isContentEditable
        ) {
            // Allow Escape key even in inputs
            if (event.key !== 'Escape') {
                return
            }
        }

        for (const shortcut of this.shortcuts.values()) {
            const keyMatches = event.key.toLowerCase() === shortcut.key.toLowerCase()
            const ctrlMatches = !!shortcut.ctrlKey === event.ctrlKey
            const shiftMatches = !!shortcut.shiftKey === event.shiftKey
            const altMatches = !!shortcut.altKey === event.altKey
            const metaMatches = !!shortcut.metaKey === event.metaKey

            if (keyMatches && ctrlMatches && shiftMatches && altMatches && metaMatches) {
                event.preventDefault()
                shortcut.handler(event)
                break
            }
        }
    }

    /**
     * Start listening for keyboard events
     */
    private startListening() {
        if (typeof window !== 'undefined') {
            window.addEventListener('keydown', this.handleKeyDown)
            this.isListening = true
        }
    }

    /**
     * Stop listening for keyboard events
     */
    private stopListening() {
        if (typeof window !== 'undefined') {
            window.removeEventListener('keydown', this.handleKeyDown)
            this.isListening = false
        }
    }

    /**
     * Get all registered shortcuts
     */
    getShortcuts(): KeyboardShortcut[] {
        return Array.from(this.shortcuts.values())
    }

    /**
     * Clean up all shortcuts
     */
    destroy() {
        this.shortcuts.clear()
        this.stopListening()
    }
}

// Global instance
export const keyboardShortcuts = new KeyboardShortcutManager()

/**
 * Common keyboard shortcuts
 */
export const commonShortcuts = {
    ESCAPE: { key: 'Escape', description: 'Fechar modal ou cancelar' },
    ENTER: { key: 'Enter', description: 'Confirmar ou enviar' },
    SPACE: { key: ' ', description: 'Ativar elemento' },
    ARROW_UP: { key: 'ArrowUp', description: 'Navegar para cima' },
    ARROW_DOWN: { key: 'ArrowDown', description: 'Navegar para baixo' },
    ARROW_LEFT: { key: 'ArrowLeft', description: 'Navegar para esquerda' },
    ARROW_RIGHT: { key: 'ArrowRight', description: 'Navegar para direita' },
    TAB: { key: 'Tab', description: 'Próximo elemento' },
    SHIFT_TAB: { key: 'Tab', shiftKey: true, description: 'Elemento anterior' },
}

/**
 * Check if an element is focusable
 */
export function isFocusable(element: HTMLElement): boolean {
    if (element.hasAttribute('disabled')) return false
    if (element.hasAttribute('tabindex') && element.getAttribute('tabindex') === '-1') return false

    const focusableElements = [
        'a[href]',
        'button:not([disabled])',
        'input:not([disabled])',
        'select:not([disabled])',
        'textarea:not([disabled])',
        '[tabindex]:not([tabindex="-1"])',
    ]

    return focusableElements.some(selector => element.matches(selector))
}

/**
 * Get all focusable elements within a container
 */
export function getFocusableElements(container: HTMLElement): HTMLElement[] {
    const selector = [
        'a[href]',
        'button:not([disabled])',
        'input:not([disabled])',
        'select:not([disabled])',
        'textarea:not([disabled])',
        '[tabindex]:not([tabindex="-1"])',
    ].join(', ')

    return Array.from(container.querySelectorAll<HTMLElement>(selector))
}
