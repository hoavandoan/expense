import { AppText } from '@/components/app-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Pressable, View } from 'react-native';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary component to catch JavaScript errors anywhere in the child component tree
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return <ErrorFallback error={this.state.error} onRetry={this.handleRetry} />;
    }

    return this.props.children;
  }
}

interface ErrorFallbackProps {
  error: Error | null;
  onRetry?: () => void;
}

import { useTranslation } from '@/lib/hooks/use-translation';

/**
 * Default error fallback UI - Uses native components since this renders outside HeroUINativeProvider
 */
export function ErrorFallback({ error, onRetry }: ErrorFallbackProps) {
  const { t } = useTranslation();

  return (
    <View className="flex-1 bg-background items-center justify-center px-8">
      <View className="w-24 h-24 rounded-full bg-danger/10 items-center justify-center mb-6">
        <IconSymbol name="xmark.circle.fill" size={48} color="#F31260" />
      </View>
      
      <AppText className="text-2xl font-bold text-foreground text-center mb-2">
        {t("error_boundary.title")}
      </AppText>
      
      <AppText className="text-muted text-center mb-6 leading-relaxed">
        {t("error_boundary.message")}{'\n'}
        {t("error_boundary.hint")}
      </AppText>

      {__DEV__ && error && (
        <View className="bg-surface p-4 rounded-xl mb-6 w-full">
          <AppText className="text-danger font-mono text-xs">
            {error.message}
          </AppText>
        </View>
      )}

      {onRetry && (
        <Pressable
          onPress={onRetry}
          className="h-14 rounded-xl px-8 bg-accent items-center justify-center"
        >
          <AppText className="font-bold text-white">{t("error_boundary.retry")}</AppText>
        </Pressable>
      )}
    </View>
  );
}

/**
 * Higher-order component to wrap a component with ErrorBoundary
 */
export function withErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  fallback?: ReactNode
) {
  return function WithErrorBoundary(props: P) {
    return (
      <ErrorBoundary fallback={fallback}>
        <WrappedComponent {...props} />
      </ErrorBoundary>
    );
  };
}
