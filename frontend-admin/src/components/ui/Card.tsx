import { HTMLAttributes, forwardRef, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  children?: ReactNode;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, hover = false, children, onClick, onMouseEnter, onMouseLeave, ...props }, ref) => {
    if (hover) {
      return (
        <motion.div
          ref={ref}
          whileHover={{ y: -4 }}
          transition={{ duration: 0.2 }}
          className={cn(
            'glass rounded-lg p-6 border border-white/10 cursor-pointer',
            className
          )}
          onClick={onClick}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
        >
          {children}
        </motion.div>
      );
    }

    return (
      <div
        ref={ref}
        className={cn(
          'glass rounded-lg p-6 border border-white/10',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export default Card;
