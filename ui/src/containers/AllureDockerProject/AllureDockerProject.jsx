import React, { Component } from "react";

import Backdrop from "@mui/material/Backdrop";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardMedia from "@mui/material/CardMedia";
import CircularProgress from "@mui/material/CircularProgress";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";

import Archive from "@mui/icons-material/Archive";
import CleaningServices from "@mui/icons-material/CleaningServices";
import CloudUpload from "@mui/icons-material/CloudUpload";
import DeleteForever from "@mui/icons-material/DeleteForever";
import DeleteSweep from "@mui/icons-material/DeleteSweep";
import Download from "@mui/icons-material/Download";
import Email from "@mui/icons-material/Email";
import FileCopyRounded from "@mui/icons-material/FileCopyRounded";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import MoreVert from "@mui/icons-material/MoreVert";
import PlayArrow from "@mui/icons-material/PlayArrow";
import Refresh from "@mui/icons-material/Refresh";

import { withRouter } from "../../utility/withRouter";
import { withStyles } from "@mui/styles";

import axios from "../../api/axios-allure-docker";
import AllureDockerReportsDropDown from "../../components/AllureDockerReportsDropDown/AllureDockerReportsDropDown";
import AllureDockerDeleteProjectDialog from "../../components/AllureDockerDeleteProjectDialog/AllureDockerDeleteProjectDialog";
import AllureDockerGenerateReport from "../../components/AllureDockerGenerateReportDialog/AllureDockerGenerateReportDialog";
import AllureDockerCleanResultsDialog from "../../components/AllureDockerCleanResultsDialog/AllureDockerCleanResultsDialog";
import AllureDockerCleanHistoryDialog from "../../components/AllureDockerCleanHistoryDialog/AllureDockerCleanHistoryDialog";
import AllureDockerSendResultsDialog from "../../components/AllureDockerSendResultsDialog/AllureDockerSendResultsDialog";
import { redirect, redirectRootInSeconds } from "../../utility/navigate";
import { isAdmin } from "../../utility/user-actions";

const styles = (theme) => ({
  paper: {
    padding: theme.spacing(2),
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(1.5),
    borderRadius: 16,
    boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
    height: "calc(100vh - 112px)",
    minHeight: 480,
  },
  iframeCard: {
    flex: 1,
    minHeight: 0,
    borderRadius: 12,
    border: `1px solid ${theme.palette.divider}`,
    overflow: "hidden",
  },
  iframeMedia: {
    width: "100%",
    height: "100%",
    border: 0,
  },
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: "#fff",
  },
});

class AllureDockerProject extends Component {
  constructor(props) {
    super(props);
    this.state = this.initialState;
  }

  get initialState() {
    return {
      project: null,
      projectNotFound: false,
      progress: false,
      reportSelected: null,
      reportSelectedValue: 0,
      reportUrlSelected: null,
      openDeleteProjectDialog: false,
      openGenerateReportDialog: false,
      openCleanResultsDialog: false,
      openCleanHistoryDialog: false,
      openSendResultsDialog: false,
      openCopyToolTip: false,
      overflowAnchorEl: null,
    };
  }

  componentDidMount() {
    this.getProject(this.props.match.params.id);
  }

  componentDidUpdate() {
    if (this.props.match.params.id) {
      if (
        !this.state.project ||
        (this.state.project &&
          this.state.project.id !== this.props.match.params.id)
      ) {
        this.getProject(this.props.match.params.id);
      }
    }
  }

  getProject = (projectId) => {
    axios
      .get(`/projects/${projectId}`)
      .then((response) => {
        this.setState({
          project: response.data.data.project,
          reportSelected: null,
          reportSelectedValue: 0,
          reportUrlSelected: null,
          projectNotFound: false,
        });
      })
      .catch((error) => {
        redirect(error);

        let projectNotFound = false;
        if (error.status === 404) {
          projectNotFound = true;
        }
        this.handleAPIErrorAlert(error);
        const project = { ...this.state.project };
        project.id = projectId;
        project.reports = [];
        this.setState({ project: project, projectNotFound: projectNotFound });
        redirectRootInSeconds(3);
      });
  };

  goToEmailableReport = (projectId) => {
    if (projectId) {
      axios
        .get(`/emailable-report/render?project_id=${projectId}`, {
          responseType: "blob",
        })
        .then((response) => {
          const url = window.URL.createObjectURL(
            new Blob([response.data], { type: "text/html" })
          );
          window.open(url, "_blank");
          this.handleAPISuccessAlert("Report successfully rendered");
        })
        .catch((error) => {
          redirect(error);
          this.handleAPIErrorAlert(error);
        });
    }
  };

  exportEmailableReport = (projectId) => {
    axios
      .get(`/emailable-report/export?project_id=${projectId}`, {
        responseType: "blob",
      })
      .then((response) => {
        const url = window.URL.createObjectURL(
          new Blob([response.data], { type: "text/html" })
        );
        const link = document.createElement("a");
        link.href = url;
        link.download = `${projectId}-emailable-report-allure-docker-service.html`;
        link.click();
        this.handleAPISuccessAlert("Emailable Report successfully exported");
      })
      .catch((error) => {
        redirect(error);
        this.handleAPIErrorAlert(error);
      });
  };

  exportFullReport = (projectId) => {
    axios
      .get(`/report/export?project_id=${projectId}`, {
        responseType: "blob",
      })
      .then((response) => {
        const url = window.URL.createObjectURL(
          new Blob([response.data], { type: "application/zip" })
        );
        const link = document.createElement("a");
        link.href = url;
        link.download = `${projectId}-allure-docker-service-report.zip`;
        link.click();
        this.handleAPISuccessAlert("Full Report successfully exported");
      })
      .catch((error) => {
        redirect(error);
        this.handleAPIErrorAlert(error);
      });
  };

  refreshProject = () => {
    this.setState(this.initialState);
  };

  copyReportUrl = (reportUrlSelected) => {
    if (reportUrlSelected) {
      navigator.clipboard.writeText(reportUrlSelected);
      this.openCopyToolTip();
    }
  };

  goToReport = (reportUrlSelected) => {
    if (reportUrlSelected) {
      window.open(reportUrlSelected, "_blank");
    }
  };

  showProgress = (show) => {
    this.setState({ progress: show });
  };

  handleAPISuccessAlert = (message) => {
    this.props.setAPIAlert("success", message, true);
  };

  handleAPIErrorAlert = (error) => {
    this.props.setAPIAlert(
      "error",
      `Something wrong => ${error.message}`,
      true
    );
  };

  openDeleteProjectDialog = () => {
    this.setState({ openDeleteProjectDialog: true, overflowAnchorEl: null });
  };
  closeDeleteProjectDialog = () => this.setState({ openDeleteProjectDialog: false });

  openGenerateReportDialog = () => this.setState({ openGenerateReportDialog: true });
  closeGenerateReportDialog = () => this.setState({ openGenerateReportDialog: false });

  openCleanResultsDialog = () => this.setState({ openCleanResultsDialog: true, overflowAnchorEl: null });
  closeCleanResultsDialog = () => this.setState({ openCleanResultsDialog: false });

  openCleanHistoryDialog = () => this.setState({ openCleanHistoryDialog: true, overflowAnchorEl: null });
  closeCleanHistoryDialog = () => this.setState({ openCleanHistoryDialog: false });

  openSendResultsDialog = () => this.setState({ openSendResultsDialog: true });
  closeSendResultsDialog = () => this.setState({ openSendResultsDialog: false });

  openCopyToolTip = () => this.setState({ openCopyToolTip: true });
  closeCopyToolTip = () => this.setState({ openCopyToolTip: false });

  openOverflowMenu = (event) => this.setState({ overflowAnchorEl: event.currentTarget });
  closeOverflowMenu = () => this.setState({ overflowAnchorEl: null });

  buildReportIPath = (projectId, reportId) => {
    return `/projects/${projectId}/reports/${reportId}/index.html?redirect=false`;
  };

  selectReport = (event, projectId) => {
    const reportSelectedValue = event.target.value;
    const reportPath = this.buildReportIPath(projectId, reportSelectedValue);
    const reportUrlSelected = `${window.location.href}/reports/${reportSelectedValue}`;

    axios
      .get(reportPath)
      .then(() => {
        this.setState({
          reportSelectedValue: reportSelectedValue,
          reportSelected: `${window._env_.ALLURE_DOCKER_API_URL}${reportPath}`,
          reportUrlSelected: reportUrlSelected,
        });
      })
      .catch((error) => {
        redirect(error);
        this.handleAPIErrorAlert(error);
      });
  };

  render() {
    const { classes } = this.props;
    let projectId = "";
    let reports = [];
    let reportIframe = "";
    let reportSelectedValue = "";
    let reportUrlSelected = "";

    if (this.state.project) {
      const project = this.state.project;
      projectId = project.id;
      if (project.reports.length !== 0) {
        for (let i in project.reports) {
          reports.push({
            linkValue: project.reports_id[i],
            linkVisibleText: `${window.location.href}/reports/${project.reports_id[i]}`,
          });
        }
        const reportPath = this.buildReportIPath(
          projectId,
          reports[0].linkValue
        );
        reportIframe = `${window._env_.ALLURE_DOCKER_API_URL}${reportPath}`;
        reportSelectedValue = reports[0].linkValue;
        reportUrlSelected = reports[0].linkVisibleText;

        if (
          this.state.reportSelected &&
          this.state.reportSelected !== reportIframe
        ) {
          reportIframe = this.state.reportSelected;
          reportSelectedValue = this.state.reportSelectedValue;
        }

        if (this.state.reportUrlSelected) {
          reportUrlSelected = this.state.reportUrlSelected;
        }
      }
    }

    let progress = null;
    if (this.state.progress) {
      progress = (
        <Backdrop open={true} className={classes.backdrop}>
          <CircularProgress color="inherit" />
        </Backdrop>
      );
    }

    const isLatestView =
      !reportSelectedValue ||
      reportSelectedValue === "latest" ||
      reports.length === 0;
    const admin = isAdmin();
    const disabled = !admin;
    const hasProject = !this.state.projectNotFound;

    return (
      <React.Fragment>
        <Paper className={classes.paper}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={1.5}
            alignItems={{ xs: "stretch", md: "center" }}
            justifyContent="space-between"
          >
            <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
              <Typography variant="h5" sx={{ fontWeight: 600, mr: 1 }}>
                {projectId}
              </Typography>
              {reports.length > 0 && (
                <AllureDockerReportsDropDown
                  selectReport={(event) => this.selectReport(event, projectId)}
                  reportSelected={reportSelectedValue}
                  reports={reports}
                />
              )}
              <Tooltip title="Refresh">
                <IconButton size="small" onClick={this.refreshProject}>
                  <Refresh fontSize="small" />
                </IconButton>
              </Tooltip>
              <ClickAwayListener onClickAway={this.closeCopyToolTip}>
                <Tooltip
                  PopperProps={{ disablePortal: true }}
                  onClose={this.closeCopyToolTip}
                  open={this.state.openCopyToolTip}
                  disableFocusListener
                  disableHoverListener
                  disableTouchListener
                  title="URL copied"
                  placement="top"
                >
                  <span>
                    <Tooltip title="Copy report URL">
                      <IconButton
                        size="small"
                        onClick={() => this.copyReportUrl(reportUrlSelected)}
                        disabled={!reportUrlSelected}
                      >
                        <FileCopyRounded fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </span>
                </Tooltip>
              </ClickAwayListener>
              <Tooltip title="Open report in new tab">
                <span>
                  <IconButton
                    size="small"
                    onClick={() => this.goToReport(reportUrlSelected)}
                    disabled={!reportUrlSelected}
                  >
                    <FullscreenIcon fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>
            </Stack>

            <Stack direction="row" spacing={1} alignItems="center">
              {isLatestView && (
                <>
                  <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    startIcon={<CloudUpload />}
                    onClick={this.openSendResultsDialog}
                    disabled={disabled}
                  >
                    Send Results
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    startIcon={<PlayArrow />}
                    onClick={this.openGenerateReportDialog}
                    disabled={disabled}
                  >
                    Generate Report
                  </Button>
                </>
              )}
              {hasProject && (
                <Tooltip title="More actions">
                  <IconButton
                    size="small"
                    onClick={this.openOverflowMenu}
                    aria-haspopup="menu"
                  >
                    <MoreVert fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
              <Menu
                anchorEl={this.state.overflowAnchorEl}
                open={Boolean(this.state.overflowAnchorEl)}
                onClose={this.closeOverflowMenu}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                transformOrigin={{ vertical: "top", horizontal: "right" }}
              >
                {isLatestView && [
                  <MenuItem
                    key="get-emailable"
                    onClick={() => {
                      this.closeOverflowMenu();
                      this.goToEmailableReport(projectId);
                    }}
                  >
                    <ListItemIcon>
                      <Email fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Get Emailable Report</ListItemText>
                  </MenuItem>,
                  <MenuItem
                    key="export-emailable"
                    onClick={() => {
                      this.closeOverflowMenu();
                      this.exportEmailableReport(projectId);
                    }}
                  >
                    <ListItemIcon>
                      <Download fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Export Emailable Report</ListItemText>
                  </MenuItem>,
                  <MenuItem
                    key="export-full"
                    onClick={() => {
                      this.closeOverflowMenu();
                      this.exportFullReport(projectId);
                    }}
                  >
                    <ListItemIcon>
                      <Archive fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Export Full Report</ListItemText>
                  </MenuItem>,
                  <Divider key="divider-destructive" />,
                  <MenuItem
                    key="clean-results"
                    onClick={this.openCleanResultsDialog}
                    disabled={disabled}
                  >
                    <ListItemIcon>
                      <CleaningServices fontSize="small" color="error" />
                    </ListItemIcon>
                    <ListItemText>Clean Results</ListItemText>
                  </MenuItem>,
                  <MenuItem
                    key="clean-history"
                    onClick={this.openCleanHistoryDialog}
                    disabled={disabled}
                  >
                    <ListItemIcon>
                      <DeleteSweep fontSize="small" color="error" />
                    </ListItemIcon>
                    <ListItemText>Clean History</ListItemText>
                  </MenuItem>,
                ]}
                <MenuItem
                  onClick={this.openDeleteProjectDialog}
                  disabled={disabled}
                  sx={{ color: "error.main" }}
                >
                  <ListItemIcon>
                    <DeleteForever fontSize="small" color="error" />
                  </ListItemIcon>
                  <ListItemText>Delete Project</ListItemText>
                </MenuItem>
              </Menu>
            </Stack>
          </Stack>

          <AllureDockerDeleteProjectDialog
            projectId={this.props.match.params.id}
            open={this.state.openDeleteProjectDialog}
            handleCloseDialog={this.closeDeleteProjectDialog}
            setAPIAlert={this.props.setAPIAlert}
            getProjects={this.props.getProjects}
            showProgress={this.showProgress}
          />
          <AllureDockerSendResultsDialog
            projectId={this.props.match.params.id}
            open={this.state.openSendResultsDialog}
            handleCloseDialog={this.closeSendResultsDialog}
            setAPIAlert={this.props.setAPIAlert}
            getProjects={this.props.getProjects}
            refreshProject={this.refreshProject}
            showProgress={this.showProgress}
          />
          <AllureDockerGenerateReport
            projectId={this.props.match.params.id}
            open={this.state.openGenerateReportDialog}
            handleCloseDialog={this.closeGenerateReportDialog}
            setAPIAlert={this.props.setAPIAlert}
            getProjects={this.props.getProjects}
            refreshProject={this.refreshProject}
            showProgress={this.showProgress}
          />
          <AllureDockerCleanResultsDialog
            projectId={this.props.match.params.id}
            open={this.state.openCleanResultsDialog}
            handleCloseDialog={this.closeCleanResultsDialog}
            setAPIAlert={this.props.setAPIAlert}
            getProjects={this.props.getProjects}
            refreshProject={this.refreshProject}
            showProgress={this.showProgress}
          />
          <AllureDockerCleanHistoryDialog
            projectId={this.props.match.params.id}
            open={this.state.openCleanHistoryDialog}
            handleCloseDialog={this.closeCleanHistoryDialog}
            setAPIAlert={this.props.setAPIAlert}
            getProjects={this.props.getProjects}
            refreshProject={this.refreshProject}
            showProgress={this.showProgress}
          />

          <Card className={classes.iframeCard}>
            {reportIframe ? (
              <CardMedia
                className={classes.iframeMedia}
                component="iframe"
                image={reportIframe}
                title="Allure Report"
              />
            ) : (
              <Box
                sx={{
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "text.secondary",
                }}
              >
                <Typography variant="body2">
                  No report available yet.
                </Typography>
              </Box>
            )}
          </Card>
        </Paper>
        {progress}
      </React.Fragment>
    );
  }
}

export default withStyles(styles, { withTheme: true })(
  withRouter(AllureDockerProject)
);
