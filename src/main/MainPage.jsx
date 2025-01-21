import React, { useState, useCallback, useEffect } from "react";
import { Paper, Tabs, Tab, IconButton } from "@mui/material";
import { KeyboardArrowLeft, KeyboardArrowRight } from "@mui/icons-material";
import { makeStyles } from "@mui/styles";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useDispatch, useSelector } from "react-redux";
import DeviceList from "./DeviceList";
import BottomMenu from "../common/components/BottomMenu";
import StatusCard from "../common/components/StatusCard";
import { devicesActions } from "../store";
import usePersistedState from "../common/util/usePersistedState";
import EventsDrawer from "./EventsDrawer";
import useFilter from "./useFilter";
import MainToolbar from "./MainToolbar";
import MainMap from "./MainMap";
import { useAttributePreference } from "../common/util/preferences";
import { useTranslation } from "../common/components/LocalizationProvider";
import { GroupFilter } from "../common/components/GroupFilter";

const useStyles = makeStyles((theme) => ({
  root: {
    height: "100%",
  },
  sidebar: {
    pointerEvents: "none",
    display: "flex",
    flexDirection: "column",
    [theme.breakpoints.up("md")]: {
      position: "fixed",
      left: 0,
      top: 0,
      height: `calc(100% - ${theme.spacing(3)})`,
      width: theme.dimensions.drawerWidthDesktop,
      margin: theme.spacing(1.5),
      zIndex: 3,
    },
    [theme.breakpoints.down("md")]: {
      height: "100%",
      width: "100%",
    },
  },
  header: {
    pointerEvents: "auto",
    zIndex: 6,
  },
  footer: {
    pointerEvents: "auto",
    zIndex: 5,
  },
  middle: {
    flex: 1,
    display: "grid",
  },
  contentMap: {
    pointerEvents: "auto",
    gridArea: "1 / 1",
  },
  contentList: {
    pointerEvents: "auto",
    gridArea: "1 / 1",
    zIndex: 4,
    paddingBottom: "45px",
    width: "400px",
    height: "590px",
  },
}));

const MainPage = () => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const theme = useTheme();
  const t = useTranslation();

  const desktop = useMediaQuery(theme.breakpoints.up("md"));

  const mapOnSelect = useAttributePreference("mapOnSelect", true);

  const selectedDeviceId = useSelector((state) => state.devices.selectedId);
  const positions = useSelector((state) => state.session.positions);
  const [filteredPositions, setFilteredPositions] = useState([]);
  const selectedPosition = filteredPositions.find(
    (position) => selectedDeviceId && position.deviceId === selectedDeviceId
  );

  const [filteredDevices, setFilteredDevices] = useState([]);
  const [filteredDevicesByGroup, setFilteredDevicesByGroup] = useState([]);

  const [keyword, setKeyword] = useState("");
  const [filter, setFilter] = usePersistedState("filter", {
    statuses: [],
    groups: [],
  });
  const [filterByGroup, setFilterByGroup] = usePersistedState("groupFilter", {
    statuses: [],
    groups: [],
  });

  console.log("filterGroups", filterByGroup, filter);
  const [filterSort, setFilterSort] = usePersistedState("filterSort", "");
  const [filterMap, setFilterMap] = usePersistedState("filterMap", true);

  const [devicesOpen, setDevicesOpen] = useState(desktop);
  const [eventsOpen, setEventsOpen] = useState(false);

  const onEventsClick = useCallback(() => setEventsOpen(true), [setEventsOpen]);

  useEffect(() => {
    if (!desktop && mapOnSelect && selectedDeviceId) {
      setDevicesOpen(false);
    }
  }, [desktop, mapOnSelect, selectedDeviceId]);

  useFilter(
    keyword,
    filter,
    filterSort,
    filterMap,
    positions,
    setFilteredDevices,
    setFilteredPositions
  );

  useFilter(
    keyword,
    filterByGroup,
    filterSort,
    filterMap,
    positions,
    setFilteredDevicesByGroup,
    setFilteredPositions
  );

  const devices = useSelector((state) => state.devices.items);
  const [isScrollableLeft, setIsScrollableLeft] = useState(false);
  const [isScrollableRight, setIsScrollableRight] = useState(false);

  const handleTabsScroll = () => {
    const tabsContainer = document.querySelector(".MuiTabs-scroller");
    if (tabsContainer) {
      setIsScrollableLeft(tabsContainer.scrollLeft > 0);
      setIsScrollableRight(
        tabsContainer.scrollLeft <
          tabsContainer.scrollWidth - tabsContainer.clientWidth
      );
    }
  };

  useEffect(() => {
    handleTabsScroll();
  }, [filter.statuses]);

  const scrollTabsLeft = () => {
    const tabsContainer = document.querySelector(".MuiTabs-scroller");
    if (tabsContainer) {
      tabsContainer.scrollLeft -= 100;
      handleTabsScroll();
    }
  };

  const scrollTabsRight = () => {
    const tabsContainer = document.querySelector(".MuiTabs-scroller");
    if (tabsContainer) {
      tabsContainer.scrollLeft += 100;
      handleTabsScroll();
    }
  };

  const handleFilter = (value) => {
    setFilter(value);
    setFilterByGroup({ groups: value.groups || [], statuses: [] });
  };

  const getCount = (tabValue) => {
    switch (tabValue) {
      case "All":
        return filteredDevicesByGroup.length;
      case "Online":
        return filteredDevicesByGroup.filter((key) => key.status === "online")
          .length;
      case "Offline":
        return filteredDevicesByGroup.filter((key) => key.status === "offline")
          .length;
      case "Inactive":
        return filteredDevicesByGroup.filter((key) => key.status === "unknown")
          .length;
      default:
        return 0;
    }
  };

  return (
    <div className={classes.root}>
      {desktop && (
        <MainMap
          filteredPositions={filteredPositions}
          selectedPosition={selectedPosition}
          onEventsClick={onEventsClick}
        />
      )}
      <div className={classes.sidebar}>
        <Paper square elevation={3} className={classes.header}>
          <MainToolbar
            filteredDevices={filteredDevices}
            devicesOpen={devicesOpen}
            setDevicesOpen={setDevicesOpen}
            keyword={keyword}
            setKeyword={setKeyword}
            filter={filter}
            setFilter={setFilter}
            filterSort={filterSort}
            setFilterSort={setFilterSort}
            filterMap={filterMap}
            setFilterMap={setFilterMap}
          />
        </Paper>
        <div className={classes.middle}>
          {!desktop && (
            <div className={classes.contentMap}>
              <MainMap
                filteredPositions={filteredPositions}
                selectedPosition={selectedPosition}
                onEventsClick={onEventsClick}
              />
            </div>
          )}
          <Paper
            square
            className={classes.contentList}
            style={devicesOpen ? {} : { visibility: "hidden" }}
          >
            <GroupFilter filter={filter} setFilter={handleFilter} />
            <div style={{ display: "flex", alignItems: "center" }}>
              <IconButton onClick={scrollTabsLeft}>
                <KeyboardArrowLeft />
              </IconButton>
              <Tabs
                value={filter.statuses}
                onChange={(e, newValue) =>
                  setFilter({ ...filter, statuses: newValue })
                }
                onScroll={handleTabsScroll}
              >
                <Tab
                  label={`${t("deviceStatusAll")} (${getCount("All")})`}
                  value=""
                  style={{ textTransform: "capitalize", minWidth: "auto" }}
                />
                <Tab
                  label={`${t("deviceStatusOnline")} (${getCount("Online")})`}
                  value="online"
                  style={{ textTransform: "capitalize", minWidth: "auto" }}
                />
                <Tab
                  label={`${t("deviceStatusOffline")} (${getCount("Offline")})`}
                  value="offline"
                  style={{ textTransform: "capitalize", minWidth: "auto" }}
                />
                <Tab
                  label={`${t("deviceStatusUnknown")} (${getCount(
                    "Inactive"
                  )})`}
                  value="unknown"
                  style={{ textTransform: "capitalize", minWidth: "auto" }}
                />
              </Tabs>
              <IconButton onClick={scrollTabsRight}>
                <KeyboardArrowRight />
              </IconButton>
            </div>
            <DeviceList devices={filteredDevices} />
          </Paper>
        </div>
        {desktop && (
          <div className={classes.footer}>
            <BottomMenu />
          </div>
        )}
      </div>
      <EventsDrawer open={eventsOpen} onClose={() => setEventsOpen(false)} />
      {selectedDeviceId && (
        <StatusCard
          deviceId={selectedDeviceId}
          position={selectedPosition}
          onClose={() => dispatch(devicesActions.selectId(null))}
          desktopPadding={theme.dimensions.drawerWidthDesktop}
        />
      )}
    </div>
  );
};

export default MainPage;
