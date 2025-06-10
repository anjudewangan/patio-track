import React, { useEffect, useState } from "react";
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  TextField,
  Typography,
  OutlinedInput,
} from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import { useDispatch, useSelector } from "react-redux";
import dayjs from "dayjs";
import { useTranslation } from "../../common/components/LocalizationProvider";
import useReportStyles from "../common/useReportStyles";
import { devicesActions, reportsActions } from "../../store";
import SplitButton from "../../common/components/SplitButton";
import SelectField from "../../common/components/SelectField";
import { useRestriction } from "../../common/util/permissions";
const options = [
  { label: "Apple", value: "apple" },
  { label: "Banana", value: "banana" },
  { label: "Cherry", value: "cherry" },
  { label: "Date", value: "date" },
  { label: "Elderberry", value: "elderberry" },
];
const ReportFilter = ({
  children,
  handleSubmit,
  handleSchedule,
  showOnly,
  ignoreDevice,
  multiDevice,
  includeGroups,
  distanceTraveled,
  reportPreferences,
}) => {
  const classes = useReportStyles();
  const dispatch = useDispatch();
  const t = useTranslation();

  const readonly = useRestriction("readonly");

  const devices = useSelector((state) => state.devices.items);
  const groups = useSelector((state) => state.groups.items);

  const deviceId = useSelector((state) => state.devices.selectedId);
  const deviceIds = useSelector((state) => state.devices.selectedIds);
  const groupIds = useSelector((state) => state.reports.groupIds);
  const period = useSelector((state) => state.reports.period);
  const from = useSelector((state) => state.reports.from);
  const to = useSelector((state) => state.reports.to);
  const distanceTraveledLimit = useSelector(
    (state) => state.devices.distanceTraveledLimit
  );

  const deviceTypeState = useSelector((state) => state.reports.deviceType);
  const [button, setButton] = useState("json");

  const [description, setDescription] = useState();
  const [calendarId, setCalendarId] = useState();

  const scheduleDisabled =
    button === "schedule" && (!description || !calendarId);
  const disabled =
    (!ignoreDevice && !deviceId && !deviceIds.length && !groupIds.length) ||
    scheduleDisabled;

  const [deviceType, setDeviceType] = useState(new Set());

  useEffect(() => {
    const tmpList = [];
    Object.values(devices).forEach((device) => {
      if (device?.attributes?.deviceType)
        tmpList.push(device.attributes.deviceType);
    });

    setDeviceType((previousSet) => {
      const newSet = new Set(previousSet);
      tmpList.forEach((item) => newSet.add(item));
      return newSet;
    });
  }, [devices]);

  const handleClick = (type) => {
    if (type === "schedule") {
      handleSchedule(deviceIds, groupIds, {
        description,
        calendarId,
        attributes: {},
      });
    } else {
      let selectedFrom;
      let selectedTo;
      switch (period) {
        case "today":
          selectedFrom = dayjs().startOf("day");
          selectedTo = dayjs().endOf("day");
          break;
        case "yesterday":
          selectedFrom = dayjs().subtract(1, "day").startOf("day");
          selectedTo = dayjs().subtract(1, "day").endOf("day");
          break;
        case "thisWeek":
          selectedFrom = dayjs().startOf("week");
          selectedTo = dayjs().endOf("week");
          break;
        case "previousWeek":
          selectedFrom = dayjs().subtract(1, "week").startOf("week");
          selectedTo = dayjs().subtract(1, "week").endOf("week");
          break;
        case "thisMonth":
          selectedFrom = dayjs().startOf("month");
          selectedTo = dayjs().endOf("month");
          break;
        case "previousMonth":
          selectedFrom = dayjs().subtract(1, "month").startOf("month");
          selectedTo = dayjs().subtract(1, "month").endOf("month");
          break;
        default:
          selectedFrom = dayjs(from, "YYYY-MM-DDTHH:mm");
          selectedTo = dayjs(to, "YYYY-MM-DDTHH:mm");
          break;
      }

      handleSubmit({
        deviceId,
        deviceIds,
        groupIds,
        from: selectedFrom.toISOString(),
        to: selectedTo.toISOString(),
        calendarId,
        type,
        distanceTraveledLimit,
        deviceType: deviceTypeState,
      });
    }
  };
  const deviceList = Object.values(devices)
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((device) => ({ label: device.name, value: device.id }));

  const [selected, setSelected] = useState([]);

  return (
    <div className={classes.filter}>
      {!ignoreDevice && (
        <div className={classes.filterItem}>
          <FormControl fullWidth>
            {/* <InputLabel>
              {t(multiDevice ? "deviceTitle" : "reportDevice")}
            </InputLabel>
            <Select
              label={t(multiDevice ? "deviceTitle" : "reportDevice")}
              value={multiDevice ? deviceIds : deviceId || ""}
              onChange={(e) => {
                console.log("value default", e.target.value);
                dispatch(
                  multiDevice
                    ? devicesActions.selectIds(e.target.value)
                    : devicesActions.selectId(e.target.value)
                );
              }}
              multiple={multiDevice}
            >
              {Object.values(devices)
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((device) => (
                  <MenuItem key={device.id} value={device.id}>
                    {device.name}
                  </MenuItem>
                ))}
            </Select> */}
            <Autocomplete
              multiple
              options={Object.values(devices)
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((device) => ({ label: device.name, value: device.id }))}
              getOptionLabel={(option) => option.label}
              onChange={(event, value) => {
                console.log("value", value);
                dispatch(
                  multiDevice
                    ? devicesActions.selectIds(value.map((item) => item.value))
                    : devicesActions.selectId(value.map((item) => item.value))
                );
              }}
              isOptionEqualToValue={(option, value) => {
                // console.log(option, value);
                return option.value === value.value;
              }}
              value={
                multiDevice
                  ? deviceList.filter((opt) => deviceIds?.includes(opt.value))
                  : deviceList.filter((opt) => {
                      return deviceId?.includes(opt.value);
                    }) || ""
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={t(multiDevice ? "deviceTitle" : "reportDevice")}
                />
              )}
            />
          </FormControl>
        </div>
      )}
      {distanceTraveled && (
        <div className={classes.filterItem}>
          <FormControl fullWidth>
            <InputLabel>{t("reportDistanceTraveled")}</InputLabel>
            <OutlinedInput
              label={t("reportDistanceTraveled")}
              value={distanceTraveledLimit}
              type="number"
              onChange={(e) =>
                dispatch(devicesActions.selectNumber(e.target.value))
              }
            ></OutlinedInput>
          </FormControl>
        </div>
      )}
      {reportPreferences?.includes("userFilter") && (
        <div className={classes.filterItem}>
          <FormControl fullWidth>
            <InputLabel>{t("DeviceTypeFilter")}</InputLabel>
            <Select
              label={t("DeviceTypeFilter")}
              value={deviceTypeState}
              onChange={(e) =>
                dispatch(reportsActions.updateDeviceType(e.target.value))
              }
              multiple
            >
              {Array.from(deviceType)
                .sort((a, b) => a.localeCompare(b))
                .map((type, idx) => (
                  <MenuItem key={idx} value={type}>
                    {type}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
        </div>
      )}
      {includeGroups && (
        <div className={classes.filterItem}>
          <FormControl fullWidth>
            <InputLabel>{t("settingsGroups")}</InputLabel>
            <Select
              label={t("settingsGroups")}
              value={groupIds}
              onChange={(e) => {
                dispatch(devicesActions.selectIds([]));
                dispatch(devicesActions.selectId(null));
                dispatch(reportsActions.updateGroupIds(e.target.value));
                console.log(groupIds);
              }}
              multiple
            >
              {Object.values(groups)
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((group) => (
                  <MenuItem key={group.id} value={group.id}>
                    {group.name}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
        </div>
      )}
      {button !== "schedule" ? (
        <>
          <div className={classes.filterItem}>
            <FormControl fullWidth>
              <InputLabel>{t("reportPeriod")}</InputLabel>
              <Select
                label={t("reportPeriod")}
                value={period}
                onChange={(e) =>
                  dispatch(reportsActions.updatePeriod(e.target.value))
                }
              >
                <MenuItem value="today">{t("reportToday")}</MenuItem>
                <MenuItem value="yesterday">{t("reportYesterday")}</MenuItem>
                <MenuItem value="thisWeek">{t("reportThisWeek")}</MenuItem>
                <MenuItem value="previousWeek">
                  {t("reportPreviousWeek")}
                </MenuItem>
                <MenuItem value="thisMonth">{t("reportThisMonth")}</MenuItem>
                <MenuItem value="previousMonth">
                  {t("reportPreviousMonth")}
                </MenuItem>
                <MenuItem value="custom">{t("reportCustom")}</MenuItem>
              </Select>
            </FormControl>
          </div>
          {period === "custom" && (
            <div className={classes.filterItem}>
              <TextField
                label={t("reportFrom")}
                type="datetime-local"
                value={from}
                onChange={(e) =>
                  dispatch(reportsActions.updateFrom(e.target.value))
                }
                fullWidth
              />
            </div>
          )}
          {period === "custom" && (
            <div className={classes.filterItem}>
              <TextField
                label={t("reportTo")}
                type="datetime-local"
                value={to}
                onChange={(e) =>
                  dispatch(reportsActions.updateTo(e.target.value))
                }
                fullWidth
              />
            </div>
          )}
        </>
      ) : (
        <>
          <div className={classes.filterItem}>
            <TextField
              value={description || ""}
              onChange={(event) => setDescription(event.target.value)}
              label={t("sharedDescription")}
              fullWidth
            />
          </div>
          <div className={classes.filterItem}>
            <SelectField
              value={calendarId || 0}
              onChange={(event) => setCalendarId(Number(event.target.value))}
              endpoint="/api/calendars"
              label={t("sharedCalendar")}
              fullWidth
            />
          </div>
        </>
      )}
      {children}
      <div className={classes.filterItem}>
        {showOnly ? (
          <Button
            fullWidth
            variant="outlined"
            color="secondary"
            disabled={disabled}
            onClick={() => handleClick("json")}
          >
            <Typography variant="button" noWrap>
              {t("reportShow")}
            </Typography>
          </Button>
        ) : (
          <SplitButton
            fullWidth
            variant="outlined"
            color="secondary"
            disabled={disabled}
            onClick={handleClick}
            selected={button}
            setSelected={(value) => setButton(value)}
            options={
              readonly
                ? {
                    json: t("reportShow"),
                    export: t("reportExport"),
                    mail: t("reportEmail"),
                  }
                : {
                    json: t("reportShow"),
                    export: t("reportExport"),
                    mail: t("reportEmail"),
                    schedule: t("reportSchedule"),
                  }
            }
          />
        )}
      </div>
    </div>
  );
};

export default ReportFilter;
