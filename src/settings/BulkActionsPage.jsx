import React, { useState } from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  FormControlLabel,
  TextField,
  Radio,
  RadioGroup,
  FormControl,
  Button,
} from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { DropzoneArea } from "react-mui-dropzone";
import EditItemView from "./components/EditItemView";
import { useTranslation } from "../common/components/LocalizationProvider";
import SettingsMenu from "./components/SettingsMenu";
import { useCatch } from "../reactHelper";
import useQuery from "../common/util/useQuery";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
const useStyles = makeStyles((theme) => ({
  details: {
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(2),
    paddingBottom: theme.spacing(3),
  },
}));

const DevicePage = () => {
  const classes = useStyles();
  const t = useTranslation();

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

  const downloadSampleFile = () => {
    const data = [["imei", "vehicle no", "group", "phone no"]];
    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(
      new Blob([wbout], { type: "application/octet-stream" }),
      "sample.xlsx"
    );
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
              <Typography variant="subtitle1">{t("userBulkActions")}</Typography>
            </AccordionSummary>
            <AccordionDetails className={classes.details}>
              <TextField
                value={item.password || ""}
                onChange={(event) =>
                  setItem({ ...item, password: event.target.value })
                }
                label={t("userPassword")}
                type="password"
              />
              <FormControl component="fieldset">
                <RadioGroup
                  aria-label="bulk-actions"
                  name="bulkActions"
                  value={item.bulkAction}
                  onChange={(event) =>
                    setItem({ ...item, bulkAction: event.target.value })
                  }
                >
                  <FormControlLabel
                    value="add"
                    control={<Radio />}
                    label={t("bulkAddDevices")}
                  />
                  <FormControlLabel
                    value="update"
                    control={<Radio />}
                    label={t("bulkUpdateDevices")}
                  />
                  <FormControlLabel
                    value="delete"
                    control={<Radio />}
                    label={t("bulkDeleteDevices")}
                  />
                </RadioGroup>
              </FormControl>
              <Button onClick={downloadSampleFile} variant="outlined">
               {t("bulkDownloadSampleFile")}
              </Button>
              <DropzoneArea
                onChange={handleFiles}
                acceptedFiles={[".xlsx", ".xls"]}
                maxFileSize={5000000}
                filesLimit={1}
                showAlerts={["error"]}
                dropzoneText={t("bulkFileUpload")}
              />
            </AccordionDetails>
          </Accordion>
        </>
      )}
    </EditItemView>
  );
};

export default DevicePage;
