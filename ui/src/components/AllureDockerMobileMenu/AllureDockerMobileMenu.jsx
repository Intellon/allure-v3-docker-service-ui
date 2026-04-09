import React, { Component } from "react";

import IconButton from "@mui/material/IconButton";
import InfoIcon from "@mui/icons-material/Info";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Switch from "@mui/material/Switch";
import { withRouter } from "../../utility/withRouter";

import SwaggerLogo from "../../components/SwaggerLogo/SwaggerLogo";
import AllureDockerInfoDialog from "../../components/AllureDockerInfoDialog/AllureDockerInfoDialog";

class AllureDockerMobileMenu extends Component {
  state = {
    infoDialog: false,
  };

  openInfoDialog = () => {
    this.setState({ infoDialog: true });
  };

  closeInfoDialog = () => {
    this.setState({ infoDialog: false });
  };

  goToSwagger = () => {
    window.open(`${window._env_.ALLURE_DOCKER_API_URL}/swagger`, "_blank");
  };

  render() {
    return (
      <React.Fragment>
        <Menu
          anchorEl={this.props.anchorEl}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
          id="primary-search-account-menu-mobile"
          keepMounted
          transformOrigin={{ vertical: "top", horizontal: "right" }}
          open={this.props.isMobileMenuOpen}
          onClose={this.props.handleMobileMenuClose}
        >
          <MenuItem>
            <Switch
              checked={this.props.darkState}
              onChange={this.props.handleThemeChange}
            />
            <p>Dark Mode</p>
          </MenuItem>
          <MenuItem onClick={this.openInfoDialog}>
            <IconButton color="inherit">
              <InfoIcon />
            </IconButton>
            <p>Info</p>
          </MenuItem>
          <MenuItem onClick={this.goToSwagger}>
            <IconButton color="inherit">
              <SwaggerLogo height="100%" />
            </IconButton>
            <p>Swagger Doc</p>
          </MenuItem>
        </Menu>
        <AllureDockerInfoDialog
          open={this.state.infoDialog}
          handleCloseDialog={this.closeInfoDialog}
        />
      </React.Fragment>
    );
  }
}

export default withRouter(AllureDockerMobileMenu);
