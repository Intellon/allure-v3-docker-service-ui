import React from "react";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";

const AllureDockerReportsDropDown = ({ reports, reportSelected, selectReport }) => {
  return (
    <FormControl size="small" sx={{ minWidth: 260, maxWidth: 480 }}>
      <InputLabel id="report-run-label">Report run</InputLabel>
      <Select
        labelId="report-run-label"
        id="report-run-select"
        label="Report run"
        value={reportSelected || ""}
        onChange={selectReport}
      >
        {reports.map((report) => (
          <MenuItem key={report.linkValue} value={report.linkValue}>
            {report.linkVisibleText}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default AllureDockerReportsDropDown;
