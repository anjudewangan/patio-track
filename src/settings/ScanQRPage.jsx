import React, { useState } from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Button,
} from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useNavigate } from "react-router-dom";

import EditItemView from "./components/EditItemView";
import { useTranslation } from "../common/components/LocalizationProvider";
import SettingsMenu from "./components/SettingsMenu";
import { useCatch } from "../reactHelper";
import useQuery from "../common/util/useQuery";
import QRBarcodeScanner from "./components/QRBarcodeScanner";
const useStyles = makeStyles((theme) => ({
  details: {
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(2),
    paddingBottom: theme.spacing(3),
  },
}));

const ScanQRPage = () => {
  const classes = useStyles();
  const t = useTranslation();

  const navigate = useNavigate();

  const query = useQuery();
  const uniqueId = query.get("uniqueId");

  const [item, setItem] = useState(uniqueId ? { uniqueId } : null);

  const handleFiles = useCatch(async (files) => {
    if (files.length > 0) {
      const response = await fetch(`/api/devices/${item.id}/image`, {
        method: "POST",
        body: files[0],
      });
      if (response.ok) {
        setItem({
          ...item,
          attributes: {
            ...item.attributes,
            deviceImage: await response.text(),
          },
        });
      } else {
        throw Error(await response.text());
      }
    }
  });

  const validate = () =>
    item && item.password && item.bulkAction && handleFiles;

  const [qrCode, setQrCode] = useState(null);

  const handleScanComplete = (scannedData) => {
    console.log("Scanned QR Code:", scannedData);
    setQrCode(scannedData);
  };

  const resetQrCode = () => {
    setQrCode(null);
  };

  const handleDeviceNavigation = async () => {
    // check if device exists, and user have edit permission
    const response = await fetch(
      `/api/devices/get-device-with-permission?imei=${qrCode
        .replaceAll('"', "")
        .slice(0, 15)}`
    );

    if (response.ok) {
      const data = await response.json();
      console.log(data);
      navigate(`/settings/device/${data.id}`);
    } else {
      throw Error(await response.text());
    }
    // if exists then navigate to device edit page
    // if does not exists then navigate to device add page with imei number as param
  };

  return (
    <EditItemView
      endpoint="devices"
      item={item}
      setItem={setItem}
      validate={validate}
      menu={<SettingsMenu />}
      breadcrumbs={["settingsTitle", "sharedDevice"]}
    >
      {item && (
        <>
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1">
                {t("userScanQrActions")}
              </Typography>
            </AccordionSummary>
            <AccordionDetails className={classes.details}>
              <QRBarcodeScanner
                onScanComplete={handleScanComplete}
                resetQrCode={resetQrCode}
              />
              {qrCode && (
                <Button
                  type="button"
                  color="primary"
                  variant="outlined"
                  onClick={handleDeviceNavigation}
                >
                  {t("userScanQrFetchDetails")}
                </Button>
              )}
            </AccordionDetails>
          </Accordion>
        </>
      )}
    </EditItemView>
  );
};

export default ScanQRPage;
