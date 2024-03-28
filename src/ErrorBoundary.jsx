import React from "react";
import { Alert } from "@mui/material";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      error: null,
      showAlert: false,
    };
  }

  static getDerivedStateFromError(error) {
    return { error, showAlert: true };
  }

  componentDidMount() {
    if (this.state.error) {
      this.timer = setTimeout(() => {
        this.setState({ showAlert: false });
      }, 2000);
    }
  }

  componentWillUnmount() {
    clearTimeout(this.timer);
  }

  render() {
    const { error, showAlert } = this.state;
    if (error && showAlert) {
      return (
        <Alert
          severity="error"
          onClose={() => this.setState({ showAlert: false })}
        >
          {/* <code
            dangerouslySetInnerHTML={{
              __html: error.stack
                .replaceAll("\n", "<br>")
                .replaceAll(" ", "&nbsp;"),
            }}
          /> */}
          <code
            dangerouslySetInnerHTML={{
              __html: error.stack.replaceAll("Coming Soon"),
            }}
          />
        </Alert>
      );
    }
    const { children } = this.props;
    return children;
  }
}

export default ErrorBoundary;
