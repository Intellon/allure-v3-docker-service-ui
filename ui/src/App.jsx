import React, { Component } from "react";
import "./App.css";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";

import { setViewerRole } from "./utility/user-actions";
import AllureDockerSigIn from "./components/AllureDockerSigIn/AllureDockerSigIn";
import AllureDockerMainContainer from "./containers/AllureDockerMainContainer/AllureDockerMainContainer";
import AllureDockerReportFullView from "./components/AllureDockerReportFullView/AllureDockerReportFullView";
import AllureDockerNotFound from "./components/AllureDockerNotFound/AllureDockerNotFound";
import AllureDockerErrorPage from "./components/AllureDockerErrorPage/AllureDockerErrorPage";
import axios from "./api/axios-allure-docker";

class App extends Component {
  state = {
    darkState: false,
    isLogoutNeeded: false,
    isSignInAnOption: false,
    isLoginRequired: null,
    error: null,
  };

  componentDidMount() {
    this.isLoginRequired();
    this.recoverTheme();
  }

  isAdminEndpointAccessible = () => {
    return axios
      .post("/send-results")
      .then((response) => {
        return response.status !== 401;
      })
      .catch((error) => {
        return error.status !== 401;
      });
  }

  isLoginRequired = () => {
    this.setState({ error: null });
    axios
      .get("/config")
      .then(async (response) => {
        const isSecurityEnabled = response.data.data.security_enabled;
        let isLogoutNeeded = false;
        let isSignInAnOption = false;
        if (isSecurityEnabled === 1) {
          isLogoutNeeded = true;
          const isMakeViewerEndpointsPublic = response.data.data.make_viewer_endpoints_public;
          if (isMakeViewerEndpointsPublic === 1 && !await this.isAdminEndpointAccessible()) {
            setViewerRole();
            isLogoutNeeded = false;
            isSignInAnOption = true;
          }
        } else {
          localStorage.removeItem("expirationDate");
          localStorage.removeItem("roles");
        }
        this.setState({
          isLoginRequired: false,
          isLogoutNeeded: isLogoutNeeded,
          isSignInAnOption: isSignInAnOption
        });
      })
      .catch((error) => {
        if (error.redirect) {
          this.setState({ isLoginRequired: true, isLogoutNeeded: false });
        }
        this.setState({
          error: error,
        });
      });
  };

  recoverTheme = () => {
    const darkState = localStorage.getItem("darkState");
    this.setState({ darkState: darkState === "true" });
  };

  handleThemeChange = () => {
    const darkState = !this.state.darkState;
    this.setState({ darkState: darkState });
    localStorage.setItem("darkState", darkState);
  };

  render() {
    const palletType = this.state.darkState ? "dark" : "light";
    const darkTheme = createTheme({
      palette: {
        mode: palletType,
        primary: {
          main: this.state.darkState ? "#5c6bc0" : "#1565c0",
        },
        secondary: {
          main: this.state.darkState ? "#7c4dff" : "#2979ff",
        },
        background: {
          default: this.state.darkState ? "#0f1218" : "#f5f7fa",
          paper: this.state.darkState ? "#1a1f2e" : "#ffffff",
        },
      },
      typography: {
        fontFamily: "'Inter', 'Roboto', 'Helvetica', 'Arial', sans-serif",
        h4: { fontWeight: 600 },
        h5: { fontWeight: 500 },
        h6: { fontWeight: 500 },
      },
      shape: {
        borderRadius: 12,
      },
      components: {
        MuiButton: {
          styleOverrides: {
            root: {
              textTransform: "none",
              fontWeight: 500,
              borderRadius: 8,
            },
          },
        },
        MuiPaper: {
          styleOverrides: {
            root: {
              backgroundImage: "none",
            },
          },
        },
        MuiAppBar: {
          styleOverrides: {
            root: {
              backgroundImage: "none",
              boxShadow: "0 1px 3px rgba(0,0,0,0.12)",
            },
          },
        },
      },
    });

    let switchRouter = null;
    if (this.state.error) {
      switchRouter = <AllureDockerErrorPage error={this.state.error} />;
    }

    if (this.state.isLoginRequired !== null) {
      if (this.state.isLoginRequired) {
        switchRouter = (
          <Routes>
            <Route
              path="/signin"
              element={<AllureDockerSigIn isLoginRequired={this.isLoginRequired} />}
            />
            <Route path="*" element={<Navigate to="/signin" replace />} />
          </Routes>
        );
      } else {
        let signInRoute;
        if (this.state.isSignInAnOption) {
          signInRoute = (
            <Route
              path="/signin"
              element={
                <AllureDockerSigIn
                  isLoginRequired={this.isLoginRequired}
                  isHomeAnOption={!this.state.isSignInAnOption}
                />
              }
            />
          );
        } else {
          signInRoute = (
            <Route path="/signin" element={<Navigate to="/" replace />} />
          );
        }

        switchRouter = (
          <Routes>
            <Route
              path="/"
              element={
                <AllureDockerMainContainer
                  darkState={this.state.darkState}
                  handleThemeChange={this.handleThemeChange}
                  isLogoutNeeded={this.state.isLogoutNeeded}
                  isSignInAnOption={this.state.isSignInAnOption}
                />
              }
            />
            <Route
              path="/projects/:id"
              element={
                <AllureDockerMainContainer
                  darkState={this.state.darkState}
                  handleThemeChange={this.handleThemeChange}
                  isLogoutNeeded={this.state.isLogoutNeeded}
                  isSignInAnOption={this.state.isSignInAnOption}
                />
              }
            />
            <Route
              path="/projects/:id/reports/:reportId"
              element={<AllureDockerReportFullView />}
            />
            {signInRoute}
            <Route path="*" element={<AllureDockerNotFound />} />
          </Routes>
        );
      }
    }
    return (
      <React.Fragment>
        <ThemeProvider theme={darkTheme}>
          <BrowserRouter basename={window._env_.ROUTER_BASE_NAME}>
            {switchRouter}
          </BrowserRouter>
        </ThemeProvider>
      </React.Fragment>
    );
  }
}

export default App;
