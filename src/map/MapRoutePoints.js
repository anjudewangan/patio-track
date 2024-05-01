import { useId, useEffect } from 'react';
import { map } from './core/MapView';

const MapRoutePoints = ({ positions, onClick, showStartPoint, showEndPoint, showRoutePointers, showStoppedPoint }) => {
  const id = useId();

  useEffect(() => {
    const onMouseEnter = () => map.getCanvas().style.cursor = 'pointer';
    const onMouseLeave = () => map.getCanvas().style.cursor = '';

    const onMarkerClick = (event) => {
      event.preventDefault();
      const feature = event.features[0];
      if (onClick) {
        onClick(feature.properties.id, feature.properties.index);
      }
    };

    map.addLayer({
      id,
      type: 'symbol',
      source: {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: positions.map((position, index) => ({
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [position.longitude, position.latitude],
            },
            properties: {
              index,
              id: position.id,
              rotation: position.course,
            },
          })),
        },
      },
      layout: {
        'icon-image': [
          'match',
          ['get', 'index'],
          0,
          showStartPoint ? 'startPoint' : '',
          positions.length - 1,
          showEndPoint ? 'endPoint' : '',
          showRoutePointers ? 'arrow' : '',
          // showStoppedPoint ? 'stoppedPoint' : '',
        ],
        'icon-allow-overlap': true,
        'icon-rotation-alignment': 'map',
      },
    });

    map.on('mouseenter', id, onMouseEnter);
    map.on('mouseleave', id, onMouseLeave);
    map.on('click', id, onMarkerClick);

    return () => {
      map.off('mouseenter', id, onMouseEnter);
      map.off('mouseleave', id, onMouseLeave);
      map.off('click', id, onMarkerClick);

      if (map.getLayer(id)) {
        map.removeLayer(id);
      }
      if (map.getSource(id)) {
        map.removeSource(id);
      }
    };
  }, [id, positions, showStartPoint, showEndPoint, showRoutePointers, showStoppedPoint, onClick]);

  return null;
};

export default MapRoutePoints;
