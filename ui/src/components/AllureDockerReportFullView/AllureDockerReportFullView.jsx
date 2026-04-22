import React, { Component } from "react";
import Backdrop from "@mui/material/Backdrop";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import IconButton from "@mui/material/IconButton";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Stack from "@mui/material/Stack";
import Switch from "@mui/material/Switch";
import Tooltip from "@mui/material/Tooltip";
import HomeIcon from "@mui/icons-material/Home";

import { withRouter } from "../../utility/withRouter";
import AllureDockerErrorPage from "../../components/AllureDockerErrorPage/AllureDockerErrorPage";
import axios from "../../api/axios-allure-docker";
import { redirect } from "../../utility/navigate";

const optionsSeconds = [
  { seconds: 10, text: "10 seconds" },
  { seconds: 20, text: "20 seconds" },
  { seconds: 30, text: "30 seconds" },
  { seconds: 40, text: "40 seconds" },
  { seconds: 50, text: "50 seconds" },
  { seconds: 60, text: "1 minute" },
  { seconds: 120, text: "2 minutes" },
  { seconds: 300, text: "5 minutes" },
  { seconds: 900, text: "15 minutes" },
  { seconds: 1800, text: "30 minutes" },
  { seconds: 2700, text: "45 minutes" },
  { seconds: 3600, text: "1 hour" },
  { seconds: 7200, text: "2 hours" },
  { seconds: 14400, text: "4 hours" },
  { seconds: 21600, text: "6 hours" },
  { seconds: 28800, text: "8 hours" },
  { seconds: 36000, text: "10 hours" },
  { seconds: 43200, text: "12 hours" },
  { seconds: 50400, text: "14 hours" },
  { seconds: 57600, text: "16 hours" },
  { seconds: 64800, text: "18 hours" },
  { seconds: 72000, text: "20 hours" },
  { seconds: 79200, text: "22 hours" },
  { seconds: 86400, text: "24 hours" },
];

class AllureDockerReportFullView extends Component {
  intervalID;
  constructor(props) {
    super(props);
    this.state = this.initialState;
  }

  get initialState() {
    return {
      report: {
        projectId: null,
        id: null,
      },
      error: null,
      reloadEnable: false,
      autoRefreshSeconds: optionsSeconds[0].seconds,
    };
  }

  getReport = () => {
    const projectId = this.props.match.params.id;
    const reportId = this.props.match.params.reportId;
    axios
      .get(
        `/projects/${projectId}/reports/${reportId}/index.html?redirect=false`
      )
      .then(() => {
        const report = { ...this.state.report };
        report.projectId = projectId;
        report.id = reportId;
        this.setState({ report: report, error: null });
      })
      .catch((error) => {
        redirect(error);
        this.setState({ report: null, error: error });
      });
  };

  componentDidMount() {
    this.getReport();
  }

  componentDidUpdate() {
    this.handleReloadSwitch();
  }

  componentWillUnmount() {
    this.disableReload();
  }

  handleSwitch = () => {
    this.setState({ reloadEnable: !this.state.reloadEnable });
  };

  handleReloadSwitch = () => {
    if (this.state.reloadEnable) {
      this.enableReload();
    } else {
      this.disableReload();
    }
  };

  enableReload = () => {
    if (!this.intervalID) {
      this.intervalID = setInterval(
        this.reloadReport.bind(this),
        this.state.autoRefreshSeconds * 1000
      );
    }
  };

  disableReload = () => {
    clearInterval(this.intervalID);
    this.intervalID = undefined;
  };

  reloadReport = () => {
    this.setState({ report: null, error: null });
    this.getReport();
  };

  handleAutoRefreshSeconds = (event) => {
    const seconds = event.target.value;
    this.setState({ autoRefreshSeconds: seconds });
    this.disableReload();
  };

  goToHome = () => {
    this.props.history.push("/");
  };

  render() {
    let progress = null;
    if (this.state.progress) {
      progress = (
        <Backdrop open={true} sx={{ zIndex: (t) => t.zIndex.drawer + 1, color: "#fff" }}>
          <CircularProgress color="inherit" />
        </Backdrop>
      );
    }

    if (this.state.error) {
      return <AllureDockerErrorPage error={this.state.error} />;
    }

    const ready =
      this.state.report &&
      this.state.report.projectId &&
      this.state.report.id;
    const reportIframe = ready
      ? `${window._env_.ALLURE_DOCKER_API_URL}/projects/${this.state.report.projectId}/reports/${this.state.report.id}/index.html?redirect=false`
      : null;
    const isLatest = ready && this.state.report.id === "latest";

    return (
      <Box
        sx={{
          position: "fixed",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          bgcolor: "background.default",
        }}
      >
        {progress}
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          justifyContent="flex-end"
          sx={{
            px: 1,
            py: 0.5,
            borderBottom: 1,
            borderColor: "divider",
            bgcolor: "background.paper",
          }}
        >
          {isLatest && (
            <>
              <FormControlLabel
                control={
                  <Switch
                    size="small"
                    checked={this.state.reloadEnable}
                    onChange={this.handleSwitch}
                  />
                }
                label="Auto refresh"
                sx={{ mr: 0 }}
              />
              <FormControl size="small" sx={{ minWidth: 140 }}>
                <Select
                  value={this.state.autoRefreshSeconds}
                  onChange={this.handleAutoRefreshSeconds}
                  disabled={!this.state.reloadEnable}
                >
                  {optionsSeconds.map((option) => (
                    <MenuItem key={option.seconds} value={option.seconds}>
                      {option.text}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </>
          )}
          <Tooltip title="Home">
            <IconButton size="small" onClick={this.goToHome}>
              <HomeIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
        {reportIframe && (
          <Box
            component="iframe"
            src={reportIframe}
            title="Allure Report"
            sx={{
              flex: 1,
              width: "100%",
              border: 0,
              display: "block",
            }}
          />
        )}
      </Box>
    );
  }
}

export default withRouter(AllureDockerReportFullView);
