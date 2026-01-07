import { AppText } from '@/components/app-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Button, useThemeColor } from 'heroui-native';
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View } from 'react-native';

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

/**
 * Default error fallback UI
 */
export function ErrorFallback({ error, onRetry }: ErrorFallbackProps) {
  const danger = useThemeColor('danger');

  return (
    <View className="flex-1 bg-background items-center justify-center px-8">
      <View className="w-24 h-24 rounded-full bg-danger/10 items-center justify-center mb-6">
        <IconSymbol name="xmark.circle.fill" size={48} color={danger} />
      </View>
      
      <AppText className="text-2xl font-bold text-foreground text-center mb-2">
        Đã xảy ra lỗi
      </AppText>
      
      <AppText className="text-muted text-center mb-6 leading-relaxed">
        Ứng dụng gặp sự cố không mong muốn.{'\n'}
        Vui lòng thử lại hoặc liên hệ hỗ trợ.
      </AppText>

      {__DEV__ && error && (
        <View className="bg-surface p-4 rounded-xl mb-6 w-full">
          <AppText className="text-danger font-mono text-xs">
            {error.message}
          </AppText>
        </View>
      )}

      {onRetry && (
        <Button
          variant="primary"
          size="lg"
          className="h-14 rounded-xl px-8"
          onPress={onRetry}
        >
          <Button.Label className="font-bold">Thử lại</Button.Label>
        </Button>
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
