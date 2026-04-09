const express = require("express");
const app = express();
const path = require("path");
const fs = require("fs");
const staticDir = __dirname;
const routerVersion = express.Router();
const routerConfig = express.Router();
const urlPrefix = process.env.URL_PREFIX;
const nativePrefix = "/allure-docker-service-ui";
let prefix = nativePrefix;
if (urlPrefix) {
  prefix = `${urlPrefix}${nativePrefix}`;
}

function getVersion() {
  const content = fs.readFileSync(path.resolve(staticDir, "ui_version"), {
    encoding: "utf8",
    flag: "r",
  });
  return content.trim();
}

function getConfig() {
  const content = fs.readFileSync(path.resolve(staticDir, "config.json"), {
    encoding: "utf8",
    flag: "r",
  });
  return content.trim();
}

app.use(express.json());

app.use("/version", routerVersion);
app.use(`${nativePrefix}/version`, routerVersion);
app.use(`${prefix}/version`, routerVersion);
routerVersion.get("/", (req, res) => {
  const json = {
    data: {
      version: getVersion(),
    },
    meta_data: {
      message: "Version successfully obtained",
    },
  };
  res.json(json);
});

app.use("/config", routerConfig);
app.use(`${nativePrefix}/config`, routerConfig);
app.use(`${prefix}/config`, routerConfig);
routerConfig.get("/", (req, res) => {
  const config = JSON.parse(getConfig());
  const json = {
    data: config,
    meta_data: {
      message: "Config successfully obtained",
    },
  };
  res.json(json);
});

app.use("/", express.static(staticDir));
app.use(prefix, express.static(staticDir));
app.get("*", (req, res) => {
  res.sendFile(path.resolve(staticDir, "index.html"));
});

app.listen(process.env.port || process.env.PORT || 6060);
