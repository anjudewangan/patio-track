import React from "react";
import { useDispatch, useSelector } from "react-redux";
import makeStyles from "@mui/styles/makeStyles";
import {
  IconButton,
  Tooltip,
  Avatar,
  ListItemAvatar,
  ListItemText,
  ListItemButton,
} from "@mui/material";
import BatteryFullIcon from "@mui/icons-material/BatteryFull";
import BatteryChargingFullIcon from "@mui/icons-material/BatteryChargingFull";
import Battery60Icon from "@mui/icons-material/Battery60";
import BatteryCharging60Icon from "@mui/icons-material/BatteryCharging60";
import Battery20Icon from "@mui/icons-material/Battery20";
import BatteryCharging20Icon from "@mui/icons-material/BatteryCharging20";
import ErrorIcon from "@mui/icons-material/Error";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { devicesActions } from "../store";
import {
  formatAlarm,
  formatBoolean,
  formatPercentage,
  formatStatus,
  getStatusColor,
} from "../common/util/formatter";
import { useTranslation } from "../common/components/LocalizationProvider";
import { mapIconKey, mapIcons } from "../map/core/preloadImages";
import { useAdministrator } from "../common/util/permissions";
import EngineIcon from "../resources/images/data/engine.svg?react";
import { useAttributePreference } from "../common/util/preferences";

dayjs.extend(relativeTime);

const useStyles = makeStyles((theme) => ({
  icon: {
    width: "25px",
    height: "25px",
    filter: "brightness(0) invert(1)",
  },
  batteryText: {
    fontSize: "0.75rem",
    fontWeight: "normal",
    lineHeight: "0.875rem",
  },
  success: {
    color: theme.palette.success.main,
  },
  warning: {
    color: theme.palette.warning.main,
  },
  error: {
    color: theme.palette.error.main,
  },
  neutral: {
    color: theme.palette.neutral.main,
  },
}));

const DeviceRow = ({ data, index, style }) => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const t = useTranslation();

  const admin = useAdministrator();

  const item = data[index];
  const position = useSelector((state) => state.session.positions[item.id]);

  const devicePrimary = useAttributePreference("devicePrimary", "name");
  const deviceSecondary = useAttributePreference("deviceSecondary", "");

  const displayStatus = () => {
    if (item.status === "online" && position && position.speed !== undefined) {
      if (position.speed > 0) {
        return t("deviceStatusMoving");
      } else {
        const lastUpdate = dayjs(position.fixTime);
        const currentTime = dayjs();
        const timeDifference = currentTime.diff(lastUpdate, "minutes");

        if (timeDifference >= 0 && timeDifference <= 5) {
          return t("deviceStatusIdle");
        } else if (timeDifference > 5 && timeDifference <= 15) {
          return t("deviceStatusParked");
        } else if (timeDifference > 30) {
          return t("deviceStatusStopped");
        }
      }
    }
    return "";
  };

  const secondaryText = () => {
    let status;
    let backgroundColor;
    if (item.status === "online" || !item.lastUpdate) {
      status = formatStatus(item.status, t);
    } else {
      status = dayjs(item.lastUpdate).fromNow();
    }

    const deviceStatus = displayStatus();

    if (deviceStatus === t("deviceStatusMoving")) {
      backgroundColor = "#28a745";
    } else if (deviceStatus === t("deviceStatusIdle")) {
      backgroundColor = "#ffc107";
    } else if (deviceStatus === t("deviceStatusParked")) {
      backgroundColor = "#007bff";
    } else if (deviceStatus === t("deviceStatusStopped")) {
      backgroundColor = "#dc3545";
    }
    return (
      <>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {deviceSecondary &&
            item[deviceSecondary] &&
            `${item[deviceSecondary]} • `}
          <span className={classes[getStatusColor(item.status)]}>{status}</span>{" "}
          <span
            style={{
              padding: "0 5px",
              borderRadius: "5px",
              backgroundColor: backgroundColor || "#ffffff",
              color: "white",
            }}
          >
            {position && displayStatus()}
          </span>
        </div>
      </>
    );
  };

  return (
    <div style={style}>
      <ListItemButton
        key={item.id}
        onClick={() => dispatch(devicesActions.selectId(item.id))}
        disabled={!admin && item.disabled}
      >
        <ListItemAvatar>
          <Avatar>
            <img
              className={classes.icon}
              src={mapIcons[mapIconKey(item.category)]}
              alt=""
            />
          </Avatar>
        </ListItemAvatar>
        <ListItemText
          primary={item[devicePrimary]}
          primaryTypographyProps={{ noWrap: true }}
          secondary={secondaryText()}
          secondaryTypographyProps={{ noWrap: true }}
        />
        {position && (
          <>
            {position.attributes.hasOwnProperty("alarm") && (
              <Tooltip
                title={`${t("eventAlarm")}: ${formatAlarm(
                  position.attributes.alarm,
                  t
                )}`}
              >
                <IconButton size="small">
                  <ErrorIcon fontSize="small" className={classes.error} />
                </IconButton>
              </Tooltip>
            )}
            {position.attributes.hasOwnProperty("ignition") && (
              <Tooltip
                title={`${t("positionIgnition")}: ${formatBoolean(
                  position.attributes.ignition,
                  t
                )}`}
              >
                <IconButton size="small">
                  {position.attributes.ignition ? (
                    <EngineIcon
                      width={20}
                      height={20}
                      className={classes.success}
                    />
                  ) : (
                    <EngineIcon
                      width={20}
                      height={20}
                      className={classes.neutral}
                    />
                  )}
                </IconButton>
              </Tooltip>
            )}
            {position.attributes.hasOwnProperty("batteryLevel") && (
              <Tooltip
                title={`${t("positionBatteryLevel")}: ${formatPercentage(
                  position.attributes.batteryLevel
                )}`}
              >
                <IconButton size="small">
                  {position.attributes.batteryLevel > 70 ? (
                    position.attributes.charge ? (
                      <BatteryChargingFullIcon
                        fontSize="small"
                        className={classes.success}
                      />
                    ) : (
                      <BatteryFullIcon
                        fontSize="small"
                        className={classes.success}
                      />
                    )
                  ) : position.attributes.batteryLevel > 30 ? (
                    position.attributes.charge ? (
                      <BatteryCharging60Icon
                        fontSize="small"
                        className={classes.warning}
                      />
                    ) : (
                      <Battery60Icon
                        fontSize="small"
                        className={classes.warning}
                      />
                    )
                  ) : position.attributes.charge ? (
                    <BatteryCharging20Icon
                      fontSize="small"
                      className={classes.error}
                    />
                  ) : (
                    <Battery20Icon fontSize="small" className={classes.error} />
                  )}
                </IconButton>
              </Tooltip>
            )}
          </>
        )}
      </ListItemButton>
    </div>
  );
};

export default DeviceRow;
