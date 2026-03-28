"use client"

import { Component, type ReactNode } from "react"

type Props = {
  children:  ReactNode
  fallback?: ReactNode
}

type State = { hasError: boolean }

export class ThreeDErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div className="w-full h-full flex items-center justify-center bg-solar-void">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border border-solar-border/30 flex items-center justify-center">
              <span className="text-solar-muted/30 text-lg">⬡</span>
            </div>
            <p className="text-[9px] font-mono text-solar-muted/30 uppercase tracking-widest">
              3D indisponível
            </p>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
