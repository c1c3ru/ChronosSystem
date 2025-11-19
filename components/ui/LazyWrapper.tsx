import { Suspense, ComponentType } from 'react';
import { Loading } from './Loading';

interface LazyWrapperProps {
    children: React.ReactNode;
    fallback?: React.ReactNode;
    skeleton?: React.ReactNode;
}

/**
 * Wrapper component for lazy-loaded components
 * Provides a loading state while the component is being loaded
 */
export function LazyWrapper({ children, fallback, skeleton }: LazyWrapperProps) {
    const loadingComponent = fallback || skeleton || <Loading />;

    return (
        <Suspense fallback={loadingComponent}>
            {children}
        </Suspense>
    );
}

/**
 * Higher-order component to wrap a lazy-loaded component with Suspense
 */
export function withLazyLoading<P extends object>(
    Component: ComponentType<P>,
    LoadingComponent?: React.ComponentType
) {
    return function LazyLoadedComponent(props: P) {
        return (
            <Suspense fallback={LoadingComponent ? <LoadingComponent /> : <Loading />}>
                <Component {...props} />
            </Suspense>
        );
    };
}

/**
 * Skeleton loader for lazy-loaded content
 */
export function ContentSkeleton() {
    return (
        <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            <div className="space-y-3">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/6"></div>
            </div>
        </div>
    );
}

/**
 * Card skeleton loader
 */
export function CardSkeleton() {
    return (
        <div className="animate-pulse">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-4">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                <div className="space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                </div>
            </div>
        </div>
    );
}

/**
 * Table skeleton loader
 */
export function TableSkeleton({ rows = 5 }: { rows?: number }) {
    return (
        <div className="animate-pulse space-y-3">
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
            {Array.from({ length: rows }).map((_, i) => (
                <div key={i} className="h-16 bg-gray-100 dark:bg-gray-800 rounded"></div>
            ))}
        </div>
    );
}

/**
 * Chart skeleton loader
 */
export function ChartSkeleton() {
    return (
        <div className="animate-pulse">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
                <div className="h-64 bg-gray-100 dark:bg-gray-700 rounded flex items-end justify-around p-4">
                    {Array.from({ length: 7 }).map((_, i) => (
                        <div
                            key={i}
                            className="bg-gray-300 dark:bg-gray-600 rounded-t"
                            style={{
                                width: '12%',
                                height: `${Math.random() * 80 + 20}%`,
                            }}
                        ></div>
                    ))}
                </div>
            </div>
        </div>
    );
}
