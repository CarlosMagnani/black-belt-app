import React, { Component, type ErrorInfo, type ReactNode } from "react";
import { Text, View } from "react-native";
import { Button } from "./Button";

type Props = {
  children: ReactNode;
  fallbackMessage?: string;
  onRetry?: () => void;
};

type State = {
  hasError: boolean;
  error: Error | null;
};

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("ErrorBoundary caught:", error, info.componentStack);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
    this.props.onRetry?.();
  };

  render() {
    if (this.state.hasError) {
      return (
        <View className="flex-1 items-center justify-center p-6">
          <Text className="font-display text-lg text-strong-light dark:text-strong-dark">
            Algo deu errado
          </Text>
          <Text className="mt-2 text-center text-sm text-muted-light dark:text-muted-dark">
            {this.props.fallbackMessage ?? "Ocorreu um erro inesperado. Tente novamente."}
          </Text>
          <View className="mt-4">
            <Button label="Tentar novamente" onPress={this.handleRetry} size="sm" />
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}
