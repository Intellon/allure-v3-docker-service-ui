import React from "react";

import { ThemeProvider } from "@mui/material/styles";
import { withStyles } from "@mui/styles";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import Divider from "@mui/material/Divider";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Typography from "@mui/material/Typography";

import { Link } from "react-router-dom";
import { withRouter } from "../../utility/withRouter";

const drawerWidth = 260;
const styles = (theme) => ({
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
  },
  drawerPaper: {
    width: drawerWidth,
    borderRight: "none",
    boxShadow: "2px 0 8px rgba(0,0,0,0.08)",
  },
  drawerHeader: {
    display: "flex",
    alignItems: "center",
    padding: theme.spacing(0, 1),
    ...theme.mixins.toolbar,
    justifyContent: "flex-end",
  },
  title: {
    display: "block",
    [theme.breakpoints.up("sm")]: {
      display: "none",
    },
  },
  listItem: {
    borderRadius: 8,
    margin: theme.spacing(0.5, 1),
    width: "auto",
    "&:hover": {
      backgroundColor: theme.palette.action.hover,
    },
  },
});

const allureDockerProjectsSideDrawer = (props) => {
  const { classes } = props;

  const elements = [];
  for (let key in props.projects) {
    elements.push(
      <Link
        to={`/projects/${key}`}
        key={key}
        style={{ color: "inherit", textDecoration: "inherit" }}
      >
        <ListItem button id={key} onClick={() => props.selectProject(key)} className={classes.listItem}>
          <ListItemText primary={key} />
        </ListItem>
      </Link>
    );
  }

  return (
    <Drawer
      className={classes.drawer}
      variant="persistent"
      anchor="left"
      open={props.isSideDrawerOpen}
      classes={{
        paper: classes.drawerPaper,
      }}
    >
      <div className={classes.drawerHeader}>
        <IconButton onClick={props.handleSideDrawerClose}>
          {ThemeProvider.direction === "ltr" ? (
            <ChevronLeftIcon />
          ) : (
            <React.Fragment>
              <Typography className={classes.title} variant="subtitle1" noWrap>
                {props.title}
              </Typography>
              <ChevronRightIcon />
            </React.Fragment>
          )}
        </IconButton>
      </div>
      <Divider />
      <List>{elements}</List>
    </Drawer>
  );
};

export default withStyles(styles, { withTheme: true })(
  withRouter(allureDockerProjectsSideDrawer)
);
