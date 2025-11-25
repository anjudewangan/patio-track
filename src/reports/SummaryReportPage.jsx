import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  FormControl, InputLabel, Select, MenuItem, Table, TableHead, TableRow, TableBody, TableCell, Button, Typography,
} from '@mui/material';
import {
  formatDistance, formatHours, formatSpeed, formatVolume, formatTime,
  formatPercentage,
} from '../common/util/formatter';
import dayjs from "dayjs";
import ReportFilter from './components/ReportFilter';
import { useAttributePreference, usePreference } from '../common/util/preferences';
import { useTranslation } from '../common/components/LocalizationProvider';
import PageLayout from '../common/components/PageLayout';
import ReportsMenu from './components/ReportsMenu';
import usePersistedState from '../common/util/usePersistedState';
import ColumnSelect from './components/ColumnSelect';
import { useCatch } from '../reactHelper';
import useReportStyles from './common/useReportStyles';
import TableShimmer from '../common/components/TableShimmer';
import scheduleReport from './common/scheduleReport';
import { reportsActions, devicesActions } from "../store";

const columnsArray = [
  ["startTime", "reportStartTime"],
  ["endTime", "reportEndTime"],
  ['startBattery', 'reportStartBattery'],
  ['endBattery', 'reportEndBattery'],
  ['replayButton', 'reportReplayButton'],
  ["distance", "sharedDistance"],
  ["startOdometer", "reportStartOdometer"],
  ["endOdometer", "reportEndOdometer"],
  ["averageSpeed", "reportAverageSpeed"],
  ["maxSpeed", "reportMaximumSpeed"],
  ["engineHours", "reportEngineHours"],
  ["spentFuel", "reportSpentFuel"],
  ["group", "reportGroup"],
  ["targetDistance", "reportTargetDistance"],
];
const columnsMap = new Map(columnsArray);

const SummaryReportPage = () => {
  const navigate = useNavigate();
  const classes = useReportStyles();
  const t = useTranslation();
  const dispatch = useDispatch();

  const devices = useSelector((state) => state.devices.items);

  const distanceUnit = useAttributePreference("distanceUnit");
  const speedUnit = useAttributePreference("speedUnit");
  const volumeUnit = useAttributePreference("volumeUnit");
  const filterReportOptions = useAttributePreference(
    "filterReportOptions",
    ""
  ).split(",");
  const hours12 = usePreference("twelveHourFormat");

  const [columns, setColumns] = usePersistedState("summaryColumns", [
    "startTime",
    "distance",
    "averageSpeed",
  ]);
  const [daily, setDaily] = useState(false);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const timePeriod = useSelector((state) => state.reports.period);
  const timeFrom = useSelector((state) => state.reports.from);
  const timeTo = useSelector((state) => state.reports.to);

  const handleSubmit = useCatch(
    async ({
      deviceIds,
      groupIds,
      from,
      to,
      type,
      distanceTraveledLimit,
      deviceType,
    }) => {
      const query = new URLSearchParams({
        from,
        to,
        daily,
        distanceTraveledLimit,
      });
      deviceIds.forEach((deviceId) => query.append("deviceId", deviceId));
      groupIds.forEach((groupId) => query.append("groupId", groupId));
      deviceType.forEach((item) => query.append("deviceType", item));
      if (type === "export") {
        window.location.assign(`/api/reports/summary/xlsx?${query.toString()}`);
      } else if (type === "mail") {
        const response = await fetch(
          `/api/reports/summary/mail?${query.toString()}`
        );
        if (!response.ok) {
          throw Error(await response.text());
        }
      } else {
        setLoading(true);
        try {
          const response = await fetch(
            `/api/reports/summary?${query.toString()}`,
            {
              headers: { Accept: "application/json" },
            }
          );
          if (response.ok) {
            setItems(await response.json());
          } else {
            throw Error(await response.text());
          }
        } finally {
          setLoading(false);
        }
      }
    }
  );

  const handleSchedule = useCatch(async (deviceIds, groupIds, report) => {
    report.type = "summary";
    report.attributes.daily = daily;
    const error = await scheduleReport(deviceIds, groupIds, report);
    if (error) {
      throw Error(error);
    } else {
      navigate("/reports/scheduled");
    }
  });

  const getTimePeriod = () => {
    let selectedFrom;
    let selectedTo;
    switch (timePeriod) {
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
        selectedFrom = dayjs(timeFrom, "YYYY-MM-DDTHH:mm");
        selectedTo = dayjs(timeTo, "YYYY-MM-DDTHH:mm");
        break;
    }
    selectedFrom = selectedFrom.format("YYYY-MM-DDTHH:mm");
    selectedTo = selectedTo.format("YYYY-MM-DDTHH:mm");
    return { selectedFrom, selectedTo };
  }

  const formatValue = (item, key) => {
    switch (key) {
      case "deviceId":
        return devices[item[key]].name;
      case "startTime":
        return formatTime(item[key], "minutes", hours12);
      case "endTime":
        return formatTime(item[key], "minutes", hours12);
      case "startOdometer":
      case "endOdometer":
      case "distance":
      case "targetDistance":
        return formatDistance(item[key], distanceUnit, t);
      case "averageSpeed":
      case "maxSpeed":
        return formatSpeed(item[key], speedUnit, t);
      case "engineHours":
        return formatHours(item[key]);
      case "spentFuel":
        return formatVolume(item[key], volumeUnit, t);
      case "startBattery":
      case "endBattery":
        return formatPercentage(item[key]);
      case "replayButton":
        const { selectedFrom, selectedTo } = getTimePeriod();
        console.log("item:", item, selectedFrom, selectedTo);
        return (
          <Button
            fullWidth
            variant="outlined"
            color="secondary"
            onClick={() => {
              dispatch(devicesActions.selectId(item.deviceId));
              dispatch(reportsActions.updateFrom(selectedFrom));
              dispatch(reportsActions.updateTo(selectedTo));
              navigate("/replay");
            }}
          >
            <Typography variant="button" noWrap>
              {t("reportReplay")}
            </Typography>
          </Button>
        )
      default:
        return item[key];
    }
  };

  return (
    <PageLayout
      menu={<ReportsMenu />}
      breadcrumbs={["reportTitle", "reportSummary"]}
    >
      <div className={classes.header}>
        <ReportFilter
          handleSubmit={handleSubmit}
          handleSchedule={handleSchedule}
          includeGroups
          ignoreDevice
          distanceTraveled
          reportPreferences={filterReportOptions}
        >
          <div className={classes.filterItem}>
            <FormControl fullWidth>
              <InputLabel>{t("sharedType")}</InputLabel>
              <Select
                label={t("sharedType")}
                value={daily}
                onChange={(e) => setDaily(e.target.value)}
              >
                <MenuItem value={false}>{t("reportSummary")}</MenuItem>
                <MenuItem value>{t("reportDaily")}</MenuItem>
              </Select>
            </FormControl>
          </div>
          <ColumnSelect
            columns={columns}
            setColumns={setColumns}
            columnsArray={columnsArray}
          />
        </ReportFilter>
      </div>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>{t("sharedDevice")}</TableCell>
            {columns.map((key) => (
              <TableCell key={key}>{t(columnsMap.get(key))}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {!loading ? (
            items.map((item) => (
              <TableRow key={`${item.deviceId}_${Date.parse(item.startTime)}`}>
                <TableCell>{devices[item.deviceId].name}</TableCell>
                {columns.map((key) => (
                  <TableCell key={key}>{formatValue(item, key)}</TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableShimmer columns={columns.length + 1} />
          )}
        </TableBody>
      </Table>
    </PageLayout>
  );
};

export default SummaryReportPage;
