import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  IconButton,
  Paper,
  Slider,
  Toolbar,
  Typography,
  FormControlLabel,
  Checkbox,
} from "@mui/material"; // Added FormControlLabel and Checkbox
import makeStyles from "@mui/styles/makeStyles";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import TuneIcon from "@mui/icons-material/Tune";
import DownloadIcon from "@mui/icons-material/Download";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import FastForwardIcon from "@mui/icons-material/FastForward";
import FastRewindIcon from "@mui/icons-material/FastRewind";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import KeyboardDoubleArrowDownIcon from "@mui/icons-material/KeyboardDoubleArrowDown";
import KeyboardDoubleArrowUpIcon from "@mui/icons-material/KeyboardDoubleArrowUp";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import MapView from "../map/core/MapView";
import MapRoutePath from "../map/MapRoutePath";
import MapRoutePoints from "../map/MapRoutePoints";
import MapPositions from "../map/MapPositions";
import { formatTime } from "../common/util/formatter";
import ReportFilter from "../reports/components/ReportFilter";
import { useTranslation } from "../common/components/LocalizationProvider";
import { useCatch } from "../reactHelper";
import MapCamera from "../map/MapCamera";
import MapGeofence from "../map/MapGeofence";
import StatusCard from "../common/components/StatusCard";
import { usePreference } from "../common/util/preferences";
// import MapRouteStopPoints from "../map/MapRouteStopPoints";

const useStyles = makeStyles((theme) => ({
  root: {
    height: "100%",
  },
  sidebar: {
    display: "flex",
    flexDirection: "column",
    position: "fixed",
    zIndex: 3,
    left: 0,
    top: 0,
    margin: theme.spacing(1.5),
    width: theme.dimensions.drawerWidthDesktop,
    [theme.breakpoints.down("md")]: {
      width: "100%",
      margin: 0,
    },
  },
  title: {
    flexGrow: 1,
  },
  slider: {
    width: "100%",
  },
  controls: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  formControlLabel: {
    height: "100%",
    width: "100%",
    paddingRight: theme.spacing(1),
    justifyContent: "space-between",
    alignItems: "center",
  },
  content: {
    display: "flex",
    flexDirection: "column",
    padding: theme.spacing(2),
    [theme.breakpoints.down("md")]: {
      margin: theme.spacing(1),
    },
    [theme.breakpoints.up("md")]: {
      marginTop: theme.spacing(1),
    },
  },
}));

const ReplayPage = () => {
  const t = useTranslation();
  const classes = useStyles();
  const navigate = useNavigate();
  const timerRef = useRef();

  const hours12 = usePreference("twelveHourFormat");

  const defaultDeviceId = useSelector((state) => state.devices.selectedId);

  const [positions, setPositions] = useState([]);
  const [index, setIndex] = useState(0);
  const [selectedDeviceId, setSelectedDeviceId] = useState(defaultDeviceId);
  const [showCard, setShowCard] = useState(false);
  const [from, setFrom] = useState();
  const [to, setTo] = useState();
  const [expanded, setExpanded] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [showRoutePointers, setShowRoutePointers] = useState(true);
  const [showTrackLine, setShowTrackLine] = useState(true);
  const [showStartPoint, setShowStartPoint] = useState(true);
  const [showEndPoint, setShowEndPoint] = useState(true);
  const [showAlarmPoint, setShowAlarmPoint] = useState(true);
  const [showParkedPoint, setShowParkedPoint] = useState(true);
  const [showStoppedPoint, setShowStoppedPoint] = useState(true);
  const [showDetailPoint, setShowDetailPoint] = useState(true);

  const [bar, setBar] = useState({ isHidden: false });

  function toggleHidden() {
    setBar({ isHidden: !bar.isHidden });
  }

  const style = { display: bar.isHidden ? "none" : "block" };

  const deviceName = useSelector((state) => {
    if (selectedDeviceId) {
      const device = state.devices.items[selectedDeviceId];
      if (device) {
        return device.name;
      }
    }
    return null;
  });

  useEffect(() => {
    if (playing && positions.length > 0) {
      timerRef.current = setInterval(() => {
        setIndex((index) => index + 1);
      }, 500);
    } else {
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [playing, positions]);

  useEffect(() => {
    if (index >= positions.length - 1) {
      clearInterval(timerRef.current);
      setPlaying(false);
    }
  }, [index, positions]);

  const onPointClick = useCallback(
    (_, index) => {
      setIndex(index);
    },
    [setIndex]
  );

  const onMarkerClick = useCallback(
    (positionId) => {
      setShowCard(!!positionId);
    },
    [setShowCard]
  );

  const handleSubmit = useCatch(async ({ deviceId, from, to }) => {
    setSelectedDeviceId(deviceId);
    setFrom(from);
    setTo(to);
    const query = new URLSearchParams({ deviceId, from, to });
    const response = await fetch(`/api/positions?${query.toString()}`);
    if (response.ok) {
      setIndex(0);
      const positions = await response.json();
      setPositions(positions);
      if (positions.length) {
        setExpanded(false);
      } else {
        throw Error(t("sharedNoData"));
      }
    } else {
      throw Error(await response.text());
    }
  });

  const handleDownload = () => {
    const query = new URLSearchParams({ deviceId: selectedDeviceId, from, to });
    window.location.assign(`/api/positions/kml?${query.toString()}`);
  };

  return (
    <div className={classes.root}>
      <MapView>
        <MapGeofence />
        <MapRoutePath positions={positions} showTrackLine={showTrackLine} />
        <MapRoutePoints
          positions={positions}
          onClick={onPointClick}
          showRoutePointers={showRoutePointers}
          showStartPoint={showStartPoint}
          showEndPoint={showEndPoint}
          showStoppedPoint={showStoppedPoint}
        />
        {/* <MapRouteStopPoints
        positions={positions}
        onClick={onPointClick}
        showRoutePointers={showRoutePointers}
        showStartPoint={showStartPoint}
        showEndPoint={showEndPoint}
        showStoppedPoint={showStoppedPoint}
        /> */}
        {index < positions.length && (
          <MapPositions
            positions={[positions[index]]}
            onClick={onMarkerClick}
            titleField="fixTime"
          />
        )}
      </MapView>
      <MapCamera positions={positions} />
      <div className={classes.sidebar}>
        <Paper elevation={3} square>
          <Toolbar>
            <IconButton
              edge="start"
              sx={{ mr: 2 }}
              onClick={() => navigate(-1)}
            >
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h6" className={classes.title}>
              {t("reportReplay")}
            </Typography>
            <IconButton onClick={() => toggleHidden()}>
              {bar.isHidden ? (
                <KeyboardDoubleArrowDownIcon />
              ) : (
                <KeyboardDoubleArrowUpIcon />
              )}
            </IconButton>
            {!expanded && (
              <>
                <IconButton onClick={handleDownload}>
                  <DownloadIcon />
                </IconButton>
                <IconButton onClick={() => setExpanded(true)}>
                  <TuneIcon />
                </IconButton>
              </>
            )}
          </Toolbar>
        </Paper>
        <Paper className={classes.content} square>
          {!expanded ? (
            <>
              <Typography variant="subtitle1" align="center">
                {deviceName}
              </Typography>
              <Slider
                className={classes.slider}
                max={positions.length - 1}
                step={null}
                marks={positions.map((_, index) => ({ value: index }))}
                value={index}
                onChange={(_, index) => setIndex(index)}
              />
              <div className={classes.controls}>
                {`${index + 1}/${positions.length}`}
                <IconButton
                  onClick={() => setIndex((index) => index - 1)}
                  disabled={playing || index <= 0}
                >
                  <FastRewindIcon />
                </IconButton>
                <IconButton
                  onClick={() => setPlaying(!playing)}
                  disabled={index >= positions.length - 1}
                >
                  {playing ? <PauseIcon /> : <PlayArrowIcon />}
                </IconButton>
                <IconButton
                  onClick={() => setIndex((index) => index + 1)}
                  disabled={playing || index >= positions.length - 1}
                >
                  <FastForwardIcon />
                </IconButton>
                {formatTime(positions[index].fixTime, "seconds", hours12)}
              </div>
            </>
          ) : (
            <ReportFilter handleSubmit={handleSubmit} fullScreen showOnly />
          )}
          {/* <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignContent: "center",
            }}
          >
            <IconButton onClick={() => toggleHidden()}>
              {
                bar.isHidden ? (<KeyboardDoubleArrowDownIcon/>): (<KeyboardDoubleArrowUpIcon/>)
              }
            </IconButton>
          </div> */}
          <div style={style}>
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                flexWrap: "wrap",
                padding: "24px 16px 16px",
              }}
            >
              <div style={{ width: "50%", marginBottom: "8px" }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={showRoutePointers}
                      onChange={() => setShowRoutePointers(!showRoutePointers)}
                      style={{ color: "#D60024" }}
                    />
                  }
                  label={t("routePointers")}
                />
              </div>
              <div style={{ width: "50%", marginBottom: "8px" }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={showTrackLine}
                      onChange={() => setShowTrackLine(!showTrackLine)}
                      style={{ color: "#59EA4F" }}
                    />
                  }
                  label={t("trackLine")}
                />
              </div>
              <div style={{ width: "50%", marginBottom: "8px" }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={showStartPoint}
                      onChange={() => setShowStartPoint(!showStartPoint)}
                      style={{ color: "#19BE6B" }}
                    />
                  }
                  label={t("startPoint")}
                />
              </div>
              <div style={{ width: "50%", marginBottom: "8px" }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={showEndPoint}
                      onChange={() => setShowEndPoint(!showEndPoint)}
                      style={{ color: "#FF9900" }}
                    />
                  }
                  label={t("endPoint")}
                />
              </div>
              <div style={{ width: "50%", marginBottom: "8px" }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={showAlarmPoint}
                      onChange={() => setShowAlarmPoint(!showAlarmPoint)}
                      style={{ color: "#FFC107" }}
                    />
                  }
                  label={t("alarmPoint")}
                />
              </div>
              <div style={{ width: "50%", marginBottom: "8px" }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={showParkedPoint}
                      onChange={() => setShowParkedPoint(!showParkedPoint)}
                      style={{ color: "#A949DE" }}
                    />
                  }
                  label={t("parkedPoint")}
                />
              </div>
              <div style={{ width: "50%", marginBottom: "8px" }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={showStoppedPoint}
                      onChange={() => setShowStoppedPoint(!showStoppedPoint)}
                      style={{ color: "#2D8CF0" }}
                    />
                  }
                  label={t("stoppedPoint")}
                />
              </div>
              <div style={{ width: "50%", marginBottom: "8px" }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={showDetailPoint}
                      onChange={() => setShowDetailPoint(!showDetailPoint)}
                      style={{ color: "#2DB7F5" }}
                    />
                  }
                  label={t("detailTag")}
                />
              </div>
            </div>
          </div>
        </Paper>
      </div>
      {showCard && index < positions.length && (
        <StatusCard
          deviceId={selectedDeviceId}
          position={positions[index]}
          onClose={() => setShowCard(false)}
          disableActions
        />
      )}
    </div>
  );
};

export default ReplayPage;
