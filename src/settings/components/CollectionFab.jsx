import React, { useState } from "react";
import { Fab, Menu, MenuItem } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import AddIcon from "@mui/icons-material/Add";
import { useNavigate } from "react-router-dom";
import { useRestriction } from "../../common/util/permissions";
import { useTranslation } from "../../common/components/LocalizationProvider";

const useStyles = makeStyles((theme) => ({
  fab: {
    position: "fixed",
    bottom: theme.spacing(2),
    right: theme.spacing(2),
    [theme.breakpoints.down("md")]: {
      bottom: `calc(${theme.dimensions.bottomBarHeight}px + ${theme.spacing(
        2
      )})`,
    },
  },
}));

const CollectionFab = ({ editPath, bulkActionPath, disabled }) => {
  const classes = useStyles();
  const navigate = useNavigate();
  const readonly = useRestriction("readonly");
  const [anchorEl, setAnchorEl] = useState(null);
  const t = useTranslation();

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  if (!readonly && !disabled) {
    return (
      <div>
        <Fab
          size="medium"
          color="primary"
          className={classes.fab}
          aria-controls="add-menu"
          aria-haspopup="true"
          onClick={handleClick}
        >
          <AddIcon />
        </Fab>
        <Menu
          id="add-menu"
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleClose}
          anchorOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
          transformOrigin={{
            vertical: "bottom",
            horizontal: "right",
          }}
        >
          <MenuItem
            onClick={() => {
              handleClose();
              navigate(editPath);
            }}
          >
            {t("singleDevices")}
          </MenuItem>
          <MenuItem
            onClick={() => {
              handleClose();
              navigate(bulkActionPath);
            }}
          >
            {t("userBulkActions")}
          </MenuItem>
        </Menu>
      </div>
    );
  }
  return "";
};

export default CollectionFab;
