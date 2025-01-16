import { useSelector } from "react-redux";
import { MenuItem } from "@mui/material";

export const GroupFilter = () => {
  const groups = useSelector((state) => state.groups.items);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        overflow: "auto",
        height: "50%",
      }}
    >
      {Object.values(groups)
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((group) => (
          <MenuItem key={group.id} value={group.id}>
            {group.name}
          </MenuItem>
        ))}
    </div>
  );
};
