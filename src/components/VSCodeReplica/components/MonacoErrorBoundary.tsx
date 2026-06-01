import React from 'react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * MonacoErrorBoundary — catches runtime errors thrown by the Monaco Editor.
 *
 * Monaco can fail to initialise in several environments:
 * - SSR / Next.js without `dynamic(() => ..., { ssr: false })`
 * - Missing web worker configuration in the host bundler
 * - Browser extensions that block `blob:` worker URLs
 *
 * Wrap `<Editor>` with this boundary so a single Monaco crash does not
 * unmount the entire VSCodeReplica component.
 */
export class MonacoErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[MonacoErrorBoundary] Monaco Editor failed to load:', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            gap: '12px',
            color: 'var(--vsc-text-error)',
            fontFamily: 'var(--vsc-font-mono)',
            padding: '24px',
            textAlign: 'center',
          }}
        >
          <span style={{ fontSize: '14px', fontWeight: 600 }}>⚠ Monaco Editor failed to load</span>
          {this.state.error && (
            <pre
              style={{
                fontSize: '11px',
                color: 'var(--vsc-text-muted)',
                maxWidth: '480px',
                overflow: 'auto',
                margin: 0,
                lineHeight: 1.5,
              }}
            >
              {this.state.error.message}
            </pre>
          )}
          <span style={{ fontSize: '11px', color: 'var(--vsc-text-muted)' }}>
            Ensure Monaco web workers are configured in your bundler.
            <br />
            In Next.js, use{' '}
            <code style={{ color: 'var(--vsc-accent)' }}>dynamic(() =&gt; import(...), {'{'} ssr: false {'}'})</code>.
          </span>
        </div>
      );
    }

    return this.props.children;
  }
}
