'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePathname } from 'next/navigation'

export interface PageTransitionProps {
    children: React.ReactNode
    variant?: 'fade' | 'slide' | 'scale'
    duration?: number
}

const variants = {
    fade: {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
    },
    slide: {
        initial: { opacity: 0, x: -20 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: 20 },
    },
    scale: {
        initial: { opacity: 0, scale: 0.95 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.95 },
    },
}

/**
 * Page Transition Component
 * 
 * Wraps page content with smooth transitions using Framer Motion
 */
export function PageTransition({
    children,
    variant = 'fade',
    duration = 0.3,
}: PageTransitionProps) {
    const pathname = usePathname()

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={pathname}
                initial="initial"
                animate="animate"
                exit="exit"
                variants={variants[variant]}
                transition={{
                    duration,
                    ease: 'easeInOut',
                }}
            >
                {children}
            </motion.div>
        </AnimatePresence>
    )
}

export default PageTransition
