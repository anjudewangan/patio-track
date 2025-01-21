import { useSelector } from "react-redux";
import {
  MenuItem,
  List,
  ListItemText,
  ListItemButton,
  Collapse,
} from "@mui/material";
import { useEffect, useState, Fragment, useMemo } from "react";
import { ExpandLess, ExpandMore } from "@mui/icons-material";

export const GroupFilter = ({ filter, setFilter }) => {
  const [openState, setOpenState] = useState({});
  const groups = useSelector((state) => state.groups.items);
  const [selectedGroups, setSelectedGroups] = useState([]);

  const toggleFilter = (value) => {
    if (selectedGroups.includes(value)) {
      setSelectedGroups(selectedGroups.filter((id) => id !== value));
      return;
    }
    setSelectedGroups([value, ...selectedGroups]);
  };
  useEffect(() => {
    setFilter({ ...filter, groups: selectedGroups });
  }, [selectedGroups]);

  const upperLevelGroups = Object.values(groups)
    .filter((group) => !group.groupId)
    .reduce((map, group) => {
      map[group.id] = group;
      return map;
    }, {});

  const handleToggle = (id) => {
    setOpenState((prevState) => ({
      ...prevState,
      [id]: !prevState[id],
    }));
  };

  // Helper function to transform flat data into a nested structure
  const buildNestedList = (data, parentId = undefined) => {
    return data
      .filter((item) => {
        return item.groupId === parentId;
      })
      .map((item) => {
        return {
          ...item,
          children: buildNestedList(data, item.id),
        };
      });
  };

  const renderList = (items) => {
    return (
      <List component="div" disablePadding>
        {items.map((item) => (
          <Fragment key={item.id}>
            <ListItemButton
              selected={selectedGroups.includes(item.id) ? true : false}
              onClick={(e) => {
                if (item?.children?.length > 0) {
                  handleToggle(item.id);
                } else {
                  toggleFilter(e.target.parentElement.id);
                }
              }}
            >
              <ListItemText primary={item.name} id={item.id} />
              {item.children.length > 0 &&
                (openState[item.id] ? <ExpandLess /> : <ExpandMore />)}
            </ListItemButton>
            {item.children.length > 0 && (
              <Collapse
                in={openState[item.id]}
                timeout="auto"
                unmountOnExit
                sx={{ marginLeft: "1.5rem" }}
              >
                {renderList(item.children)}
              </Collapse>
            )}
          </Fragment>
        ))}
      </List>
    );
  };

  const nestedData = useMemo(
    () => buildNestedList(Object.values(groups)),
    [groups]
  );

  const renderedComponent = useMemo(
    () => renderList(nestedData),
    [groups, selectedGroups, openState]
  );

  return (
    <div style={{ height: "50%", overflow: "auto" }}>{renderedComponent}</div>
  );
};
