import { useId, useEffect, useState } from "react";
import { kml } from "@tmcw/togeojson";
import { useTheme } from "@mui/styles";
import { map } from "../core/MapView";
import { useEffectAsync } from "../../reactHelper";
import { usePreference } from "../../common/util/preferences";
import { findFonts } from "../core/mapUtil";

// Function to load an image from URL and add it as an icon
const loadImageFromUrl = (map, url, name) => {
  return new Promise((resolve, reject) => {
    map.loadImage(url, (error, image) => {
      if (error) {
        console.error(`Error loading image from ${url}`, error);
        return reject(error);
      }
      if (!map.hasImage(name)) {
        map.addImage(name, image);
      }
      resolve();
    });
  });
};

const PoiMap = () => {
  const id = useId();

  const theme = useTheme();

  const poiLayer = usePreference("poiLayer");

  const [data, setData] = useState(null);

  useEffectAsync(async () => {
    if (poiLayer) {
      const file = await fetch(poiLayer);
      const dom = new DOMParser().parseFromString(
        await file.text(),
        "text/xml"
      );
      const iconPromises = [];
      // Cache to track loaded icons
      const loadedIcons = new Set();
      let geoJson = kml(dom);
      let features = geoJson.features.map((feature, index) => {
        if (feature.properties && feature.properties.icon) {
          const iconUrl = feature.properties.icon; // Icon URL from GeoJSON properties

          // Extract the image name from the URL
          const iconName = iconUrl.split("/").pop(); // Extract last part of the URL
          feature.properties.iconName = iconName; // Add the icon name back to properties

          // Only add to promises if the icon hasn't been loaded
          if (!loadedIcons.has(iconName)) {
            loadedIcons.add(iconName); // Mark the icon as loaded
            iconPromises.push(loadImageFromUrl(map, iconUrl, iconName));
          }

          return feature;
        }
      });
      await Promise.all(iconPromises);
      geoJson.features = features;
      setData(geoJson);
    }
  }, [poiLayer]);

  useEffect(() => {
    if (data) {
      // console.log(data);
      map.addSource(id, {
        type: "geojson",
        data,
      });
      map.addLayer({
        source: id,
        id: "poi-point",
        type: "circle",
        paint: {
          "circle-radius": 5,
          "circle-color": ["get", "icon-color"], // Use color from properties
        },
      });
      map.addLayer({
        source: id,
        id: "poi-line",
        type: "line",
        paint: {
          "line-color": theme.palette.geometry.main,
          "line-width": 2,
        },
      });
      map.addLayer({
        source: id,
        id: "poi-title",
        type: "symbol",
        layout: {
          "text-field": "{name}",
          "text-anchor": "bottom",
          "text-offset": [0, -2.0],
          "text-font": findFonts(map),
          "text-size": 12,
        },
        paint: {
          "text-halo-color": "white",
          "text-halo-width": 1,
        },
      });
      // map.addLayer({
      //   source: id,
      //   id: "poi-icon",
      //   type: "symbol",
      //   layout: {
      //     "icon-image": ["get", "iconName"],
      //     "icon-size": 0.5,
      //     "icon-allow-overlap": true,
      //     "icon-rotation-alignment": "map",
      //   },
      // });
      return () => {
        if (map.getLayer("poi-point")) {
          map.removeLayer("poi-point");
        }
        if (map.getLayer("poi-line")) {
          map.removeLayer("poi-line");
        }
        if (map.getLayer("poi-title")) {
          map.removeLayer("poi-title");
        }
        if (map.getLayer("poi-icon")) {
          map.removeLayer("poi-icon");
        }
        if (map.getSource(id)) {
          map.removeSource(id);
        }
      };
    }
    return () => {};
  }, [data]);

  return null;
};

export default PoiMap;
