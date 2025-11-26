import { useEffect, useId } from "react";
import { useTheme } from "@mui/styles";
import { map } from "../core/MapView";
import { useEffectAsync } from "../../reactHelper";
import { usePreference } from "../../common/util/preferences";
import { findFonts } from "../core/mapUtil";

// Utility to load icon from URL only once
const loadIcon = (map, url, name) => {
  return new Promise((resolve, reject) => {
    if (map.hasImage(name)) return resolve();

    map.loadImage(url, (err, image) => {
      if (err) return reject(err);
      if (!map.hasImage(name)) map.addImage(name, image);
      resolve();
    });
  });
};

const loadIconsFromGeoJson = async (map, geojson) => {
  const iconPromises = [];
  const loadedIcons = new Set();

  geojson.features.forEach(f => {
    const iconUrl = f.properties?.icon;
    if (!iconUrl) return;

    const iconName = iconUrl.split("/").pop();

    f.properties.iconName = iconName;

    if (!loadedIcons.has(iconName)) {
      loadedIcons.add(iconName);
      iconPromises.push(new Promise((resolve, reject) => {
        map.loadImage(iconUrl, (err, img) => {
          if (err) { reject(err); return; }
          if (!map.hasImage(iconName)) map.addImage(iconName, img);
          resolve();
        });
      }));
    }
  });

  await Promise.all(iconPromises);
};

const PoiMap = () => {
  const id = useId();
  const theme = useTheme();
  const poiLayer = usePreference("poiLayer"); // this now points to a GeoJSON URL

  useEffectAsync(async () => {
    if (!poiLayer) return;

    // 1️⃣ Load GeoJSON directly
    const response = await fetch(poiLayer);
    const geoJson = await response.json();

    // 2️⃣ Load icons only once
    const iconUrls = {};
    geoJson.features.forEach((f) => {
      if (f.properties?.icon) {
        const iconUrl = f.properties.icon;
        const iconName = iconUrl.split("/").pop();
        f.properties.iconName = iconName;
        iconUrls[iconName] = iconUrl;
      }
    });

    // load each icon only once
    const iconLoaders = Object.entries(iconUrls).map(([name, url]) =>
      loadIcon(map, url, name)
    );
    await Promise.all(iconLoaders);

    // 3️⃣ Add source with clustering
    if (!map.getSource(id)) {
      map.addSource(id, {
        type: "geojson",
        data: geoJson,
        cluster: true,
        clusterRadius: 50,
        clusterMaxZoom: 12,
      });
    }

    // 4️⃣ Cluster circle
    map.addLayer({
      id: `${id}-clusters`,
      type: "circle",
      source: id,
      filter: ["has", "point_count"],
      paint: {
        "circle-color": "#51bbd6",
        "circle-radius": 20,
      },
    });

    // 5️⃣ Cluster count
    map.addLayer({
      id: `${id}-cluster-count`,
      type: "symbol",
      source: id,
      filter: ["has", "point_count"],
      layout: {
        "text-field": "{point_count_abbreviated}",
        "text-size": 12,
      },
    });

    // 6️⃣ Unclustered points
    map.addLayer({
      id: `${id}-unclustered-point`,
      type: "circle",
      source: id,
      filter: ["!", ["has", "point_count"]],
      paint: {
        "circle-radius": 8,
        "circle-color": ["get", "icon-color"],
      },
    });

    // 7️⃣ Labels
    map.addLayer({
      id: `${id}-title`,
      type: "symbol",
      source: id,
      filter: ["!", ["has", "point_count"]],
      layout: {
        "text-field": "{name}",
        "text-anchor": "bottom",
        "text-offset": [0, -2],
        "text-font": findFonts(map),
        "text-size": 11,
      },
      paint: {
        "text-halo-color": "white",
        "text-halo-width": 1,
      },
    });

    // 8️⃣ Icons
    map.addLayer({
      id: `${id}-icon`,
      type: "symbol",
      source: id,
      filter: ["!", ["has", "point_count"]],
      layout: {
        "icon-image": ["get", "iconName"],
        "icon-size": 0.5,
        "icon-allow-overlap": true,
      },
    });

    map.on("click", `${id}-clusters`, (e) => {
      const features = map.queryRenderedFeatures(e.point, {
        layers: [`${id}-clusters`],
      });

      const clusterId = features[0].properties.cluster_id;

      map.getSource(id).getClusterExpansionZoom(clusterId, (err, zoom) => {
        if (err) return;

        map.easeTo({
          center: features[0].geometry.coordinates,
          zoom: zoom,
          duration: 600,
        });
      });
    });

    // Cleanup on unmount or layer change
    return () => {
      [
        `${id}-clusters`,
        `${id}-cluster-count`,
        `${id}-unclustered-point`,
        `${id}-title`,
        `${id}-icon`,
      ].forEach((layerId) => {
        if (map.getLayer(layerId)) map.removeLayer(layerId);
      });

      if (map.getSource(id)) map.removeSource(id);
    };
  }, [poiLayer]);

  return null;
};

export default PoiMap;
