import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Paper,
  BottomNavigation,
  BottomNavigationAction,
  Menu,
  MenuItem,
  Typography,
  Badge,
  Tooltip,
  IconButton,
} from "@mui/material";

import DescriptionIcon from "@mui/icons-material/Description";
import SettingsIcon from "@mui/icons-material/Settings";
import MapIcon from "@mui/icons-material/Map";
import PersonIcon from "@mui/icons-material/Person";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import AddIcon from "@mui/icons-material/Add";
import { useDeviceReadonly } from "../../common/util/permissions";

import { sessionActions } from "../../store";
import { useTranslation } from "./LocalizationProvider";
import { useRestriction } from "../util/permissions";
import { nativePostMessage } from "./NativeInterface";
import logo from "../../../public/election-commission.png";

const BottomMenu = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const t = useTranslation();
  const deviceReadonly = useDeviceReadonly();
  const devices = useSelector((state) => state.devices.items);
  const readonly = useRestriction("readonly");
  const disableReports = useRestriction("disableReports");
  const user = useSelector((state) => state.session.user);
  const socket = useSelector((state) => state.session.socket);

  const [anchorEl, setAnchorEl] = useState(null);

  const currentSelection = () => {
    if (location.pathname === `/settings/user/${user.id}`) {
      return "account";
    }
    if (location.pathname.startsWith("/settings")) {
      return "settings";
    }
    if (location.pathname.startsWith("/reports")) {
      return "reports";
    }
    if (location.pathname === "/") {
      return "map";
    }
    return null;
  };

  const handleAccount = () => {
    setAnchorEl(null);
    navigate(`/settings/user/${user.id}`);
  };

  const handleLogout = async () => {
    setAnchorEl(null);

    const notificationToken = window.localStorage.getItem("notificationToken");
    if (notificationToken && !user.readonly) {
      window.localStorage.removeItem("notificationToken");
      const tokens = user.attributes.notificationTokens?.split(",") || [];
      if (tokens.includes(notificationToken)) {
        const updatedUser = {
          ...user,
          attributes: {
            ...user.attributes,
            notificationTokens:
              tokens.length > 1
                ? tokens.filter((it) => it !== notificationToken).join(",")
                : undefined,
          },
        };
        await fetch(`/api/users/${user.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedUser),
        });
      }
    }

    await fetch("/api/session", { method: "DELETE" });
    nativePostMessage("logout");
    navigate("/login");
    dispatch(sessionActions.updateUser(null));
  };

  const handleSelection = (event, value) => {
    switch (value) {
      case "map":
        navigate("/");
        break;
      case "reports":
        navigate("/reports/combined");
        break;
      case "settings":
        navigate("/settings/preferences");
        break;
      case "account":
        setAnchorEl(event.currentTarget);
        break;
      case "add device":
        navigate("/settings/device");
        break;
      case "logout":
        handleLogout();
        break;
      default:
        break;
    }
  };

  return (
    <Paper square elevation={3} style={{ position: "sticky", bottom: "0" }}>
      <BottomNavigation
        value={currentSelection()}
        onChange={handleSelection}
        showLabels
      >
        <BottomNavigationAction
          label={t("mapTitle")}
          icon={
            <Badge
              color="error"
              variant="dot"
              overlap="circular"
              invisible={socket !== false}
            >
              <MapIcon />
            </Badge>
          }
          value="map"
        />
        {!disableReports && (
          <BottomNavigationAction
            label={t("reportTitle")}
            icon={<DescriptionIcon />}
            value="reports"
          />
        )}
        {/* <img
          src={logo}
          alt="Logo"
          className="logo-img"
          style={{
            position: "absolute",
            bottom: "30px",
            width: "45px",
            height: "45px",
          }}
        /> */}
        {/* {readonly ? null : (
          <BottomNavigationAction
            label={t("deviceRegisterFirst")}
            icon={<AddIcon />}
            value="add device"
          />
        )} */}
        <BottomNavigationAction
          label={t("settingsTitle")}
          icon={<SettingsIcon />}
          value="settings"
        />
        {readonly ? (
          <BottomNavigationAction
            label={t("loginLogout")}
            icon={<ExitToAppIcon />}
            value="logout"
          />
        ) : (
          <BottomNavigationAction
            label={t("settingsUser")}
            icon={<PersonIcon />}
            value="account"
          />
        )}
      </BottomNavigation>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem onClick={handleAccount}>
          <Typography color="textPrimary">
            {t("settingsUserProfile")} : {user.name}
          </Typography>
        </MenuItem>
        <MenuItem onClick={handleLogout}>
          <Typography color="error">{t("loginLogout")}</Typography>
        </MenuItem>
      </Menu>
    </Paper>
  );
};

export default BottomMenu;
