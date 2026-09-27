import { Component, type ErrorInfo, type ReactNode } from 'react';
import i18n from '../i18n';
import { Screen } from './Screen';

interface Props {
  children: ReactNode;
  onBackToToday: () => void;
}

interface State {
  failed: boolean;
}

/**
 * Catches any rendering error in Person mode and shows one calm sentence with a way home.
 * There are no error dialogs anywhere in Person mode.
 */
export class CalmFallback extends Component<Props, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('Companion: person-mode error', error, info);
  }

  private reset = () => {
    this.setState({ failed: false });
    this.props.onBackToToday();
  };

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <Screen center onBackToToday={this.reset}>
        <p className="lead" style={{ textAlign: 'center' }}>
          {i18n.t('common.calmFallback')}
        </p>
      </Screen>
    );
  }
}
