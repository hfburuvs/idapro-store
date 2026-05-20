import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("[ErrorBoundary] React error caught:", error);
    console.error("[ErrorBoundary] Component stack:", info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div style={{ padding: 40, fontFamily: "system-ui, sans-serif", maxWidth: 800, margin: "0 auto" }}>
          <h2 style={{ color: "#c00", fontSize: 20, marginBottom: 12 }}>Something went wrong</h2>
          <p style={{ color: "#666", fontSize: 14, marginBottom: 16 }}>
            The application encountered an error. Please try refreshing the page.
          </p>
          <pre style={{
            background: "#f8f8f8",
            padding: 16,
            borderRadius: 8,
            overflow: "auto",
            fontSize: 12,
            color: "#333",
            border: "1px solid #e5e5e5",
          }}>
            {this.state.error?.message}
            {"\n\n"}
            {this.state.error?.stack}
          </pre>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: 20,
              padding: "10px 20px",
              background: "#FF9900",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              cursor: "pointer",
              fontSize: 14,
            }}
          >
            Refresh Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
