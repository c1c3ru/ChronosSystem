/**
 * Hook para gerenciar navegação por teclado
 * Facilita a implementação de atalhos de teclado acessíveis
 */

import { useEffect, useCallback } from 'react'

export interface KeyboardShortcut {
    key: string
    ctrlKey?: boolean
    shiftKey?: boolean
    altKey?: boolean
    metaKey?: boolean
    callback: (event: KeyboardEvent) => void
    description?: string
}

export function useKeyboardNavigation(shortcuts: KeyboardShortcut[]) {
    const handleKeyDown = useCallback(
        (event: KeyboardEvent) => {
            for (const shortcut of shortcuts) {
                const keyMatches = event.key.toLowerCase() === shortcut.key.toLowerCase()
                const ctrlMatches = shortcut.ctrlKey === undefined || event.ctrlKey === shortcut.ctrlKey
                const shiftMatches = shortcut.shiftKey === undefined || event.shiftKey === shortcut.shiftKey
                const altMatches = shortcut.altKey === undefined || event.altKey === shortcut.altKey
                const metaMatches = shortcut.metaKey === undefined || event.metaKey === shortcut.metaKey

                if (keyMatches && ctrlMatches && shiftMatches && altMatches && metaMatches) {
                    event.preventDefault()
                    shortcut.callback(event)
                    break
                }
            }
        },
        [shortcuts]
    )

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [handleKeyDown])
}

/**
 * Hook para gerenciar foco em trap (modal, dialog)
 */
export function useFocusTrap(containerRef: React.RefObject<HTMLElement>, isActive: boolean) {
    useEffect(() => {
        if (!isActive || !containerRef.current) return

        const container = containerRef.current
        const focusableElements = container.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )

        const firstElement = focusableElements[0]
        const lastElement = focusableElements[focusableElements.length - 1]

        const handleTabKey = (e: KeyboardEvent) => {
            if (e.key !== 'Tab') return

            if (e.shiftKey) {
                if (document.activeElement === firstElement) {
                    e.preventDefault()
                    lastElement?.focus()
                }
            } else {
                if (document.activeElement === lastElement) {
                    e.preventDefault()
                    firstElement?.focus()
                }
            }
        }

        const handleEscapeKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                // Dispatch custom event para fechar modal
                container.dispatchEvent(new CustomEvent('escape-pressed'))
            }
        }

        container.addEventListener('keydown', handleTabKey as EventListener)
        container.addEventListener('keydown', handleEscapeKey as EventListener)

        // Focar primeiro elemento ao abrir
        firstElement?.focus()

        return () => {
            container.removeEventListener('keydown', handleTabKey as EventListener)
            container.removeEventListener('keydown', handleEscapeKey as EventListener)
        }
    }, [containerRef, isActive])
}

/**
 * Hook para anunciar mudanças para leitores de tela
 */
export function useScreenReaderAnnouncement() {
    const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
        const announcement = document.createElement('div')
        announcement.setAttribute('role', 'status')
        announcement.setAttribute('aria-live', priority)
        announcement.setAttribute('aria-atomic', 'true')
        announcement.className = 'sr-only'
        announcement.textContent = message

        document.body.appendChild(announcement)

        setTimeout(() => {
            document.body.removeChild(announcement)
        }, 1000)
    }, [])

    return { announce }
}

/**
 * Exemplo de uso:
 * 
 * ```tsx
 * // Atalhos de teclado
 * useKeyboardNavigation([
 *   {
 *     key: 's',
 *     ctrlKey: true,
 *     callback: () => handleSave(),
 *     description: 'Salvar'
 *   },
 *   {
 *     key: 'Escape',
 *     callback: () => handleClose(),
 *     description: 'Fechar'
 *   }
 * ])
 * 
 * // Focus trap em modal
 * const modalRef = useRef<HTMLDivElement>(null)
 * useFocusTrap(modalRef, isOpen)
 * 
 * // Anúncios para leitores de tela
 * const { announce } = useScreenReaderAnnouncement()
 * announce('Registro salvo com sucesso', 'polite')
 * ```
 */
