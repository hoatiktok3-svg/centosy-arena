import { Component, ErrorInfo, ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError:  boolean
  message:   string
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: '' }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack)
  }

  handleReload = () => {
    this.setState({ hasError: false, message: '' })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-arena-bg flex flex-col items-center justify-center px-6 gap-5">
          <div className="text-5xl">⚠️</div>
          <div className="text-center">
            <p className="text-white font-black text-lg">Đã xảy ra lỗi</p>
            <p className="text-text-secondary text-sm mt-1">
              App gặp sự cố không mong muốn. Vui lòng tải lại trang.
            </p>
            {this.state.message && (
              <p className="text-text-muted text-xs mt-2 font-mono bg-arena-card border border-arena-border rounded-lg px-3 py-2 max-w-[320px] break-words">
                {this.state.message}
              </p>
            )}
          </div>
          <button
            onClick={() => window.location.reload()}
            className="btn-primary px-8"
          >
            Tải lại trang
          </button>
          <button
            onClick={this.handleReload}
            className="text-text-muted text-sm underline"
          >
            Thử khôi phục
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
