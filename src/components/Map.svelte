<script>
  import { onMount } from "svelte";
  import mapboxgl from "mapbox-gl";
  import "mapbox-gl/dist/mapbox-gl.css";
  import yazooBackwaterStudyArea from "../data/yazoo-backwater-study-area.geo.json";

  const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;
  mapboxgl.accessToken = MAPBOX_TOKEN;

  // Inset map dimensions
  const insetWidth = 250;
  const insetHeight = 250;

  let mapContainer;
  let mapInstance;
  let resizeObserver;

  // Calculate bounds from GeoJSON polygon
  const coordinates =
    yazooBackwaterStudyArea.features[0].geometry.coordinates[0];
  const firstCoord = coordinates[0];
  const polygonBounds = new mapboxgl.LngLatBounds(
    [firstCoord[0], firstCoord[1]],
    [firstCoord[0], firstCoord[1]]
  );

  // Extend bounds with all coordinates
  coordinates.forEach((coord) => {
    polygonBounds.extend([coord[0], coord[1]]);
  });

  // Calculate inset bbox by extending polygon bounds
  const insetPadding = 1.75; // Degree padding to show broader region
  const insetBbox = `${polygonBounds.getWest() - insetPadding}, ${polygonBounds.getSouth() - insetPadding}, ${polygonBounds.getEast() + insetPadding}, ${polygonBounds.getNorth() + insetPadding}`;

  // Rectangle color
  const highlightColor = "548687";

  const fitBoundsOptions = {
    padding: 10,
    animate: false,
  };

  onMount(() => {
    mapInstance = new mapboxgl.Map({
      container: mapContainer,
      style: "mapbox://styles/mapbox/streets-v11",
      bounds: polygonBounds,
      fitBoundsOptions,
      dragPan: false,
      dragRotate: false,
      scrollZoom: false,
      touchZoomRotate: false,
      doubleClickZoom: false,
      boxZoom: false,
      keyboard: false,
    });

    // Create resize observer
    resizeObserver = new ResizeObserver(() => {
      if (mapInstance) {
        mapInstance.resize();
        mapInstance.fitBounds(polygonBounds, fitBoundsOptions);
      }
    });
    resizeObserver.observe(mapContainer);

    mapInstance.on("load", () => {
      const style = mapInstance.getStyle();
      const firstLabelLayer = style.layers.find(
        (layer) =>
          layer.type === "symbol" && layer.layout && layer.layout["text-field"]
      );

      // Hide Lake Providence label
      mapInstance.setLayoutProperty("settlement-label", "text-field", [
        "case",
        ["in", ["get", "name"], ["literal", ["Lake Providence", "Yazoo City"]]],
        "",
        ["get", "name"],
      ]);

      // Add the GeoJSON source and layers
      mapInstance.addSource("yazoo", {
        type: "geojson",
        data: yazooBackwaterStudyArea,
      });

      mapInstance.addLayer(
        {
          id: "yazoo-fill",
          type: "fill",
          source: "yazoo",
          paint: {
            "fill-color": "#548687",
            "fill-opacity": 0.2,
          },
        },
        firstLabelLayer.id
      );

      mapInstance.addLayer(
        {
          id: "yazoo-line",
          type: "line",
          source: "yazoo",
          paint: {
            "line-color": "#548687",
            "line-width": 2,
          },
        },
        firstLabelLayer.id
      );

      // Add point and label source
      mapInstance.addSource("point", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: [
            {
              type: "Feature",
              geometry: {
                type: "Point",
                coordinates: [-90.89063667554188, 32.46133442314749],
              },
              properties: {
                title: "Steele Bayou drainage flood gate",
                showLabel: true,
              },
            },
            {
              type: "Feature",
              geometry: {
                type: "Point",
                coordinates: [-90.98825884137813, 32.50384394800719],
              },
              properties: {
                showLabel: false,
              },
            },
            {
              type: "Feature",
              geometry: {
                type: "Point",
                coordinates: [-90.72994478653648, 32.62332620793813],
              },
              properties: {
                showLabel: false,
              },
            },
          ],
        },
      });

      // Add circle layer
      mapInstance.addLayer({
        id: "point-circle",
        type: "circle",
        source: "point",
        paint: {
          "circle-radius": 6,
          "circle-color": "#F1B82D",
          "circle-stroke-width": 2,
          "circle-stroke-color": "#000000",
        },
      });

      // Add text label layer with filter for only the labeled point
      mapInstance.addLayer({
        id: "point-label",
        type: "symbol",
        source: "point",
        filter: ["==", ["get", "showLabel"], true],
        layout: {
          "text-field": ["get", "title"],
          "text-anchor": "left",
          "text-offset": [1, 0],
          "text-size": 14,
          "text-justify": "left",
          "text-font": ["literal", ["DIN Pro Bold"]],
          "text-outline-width": 1,
          "text-outline-color": "#FFFFFF",
        },
        paint: {
          "text-halo-color": "#EFE9E1",
          "text-halo-width": 3,
        },
      });
    });

    return () => {
      resizeObserver.disconnect();
      if (mapInstance) {
        mapInstance.remove();
      }
    };
  });

  // Generate the inset map URL with the main area highlighted
  const insetMapUrl = `https://api.mapbox.com/styles/v1/mapbox/streets-v10/static/geojson(%7B%22type%22%3A%22Feature%22%2C%22properties%22%3A%7B%22stroke%22%3A%22%23${highlightColor}%22%2C%22stroke-width%22%3A2%2C%22fill%22%3A%22%23${highlightColor}%22%2C%22fill-opacity%22%3A0.2%7D%2C%22geometry%22%3A%7B%22type%22%3A%22Polygon%22%2C%22coordinates%22%3A%5B%5B%5B${polygonBounds.getWest()}%2C${polygonBounds.getSouth()}%5D%2C%5B${polygonBounds.getEast()}%2C${polygonBounds.getSouth()}%5D%2C%5B${polygonBounds.getEast()}%2C${polygonBounds.getNorth()}%5D%2C%5B${polygonBounds.getWest()}%2C${polygonBounds.getNorth()}%5D%2C%5B${polygonBounds.getWest()}%2C${polygonBounds.getSouth()}%5D%5D%5D%7D%7D)/[${insetBbox}]/${insetWidth}x${insetHeight}?attribution=false&logo=false&access_token=${MAPBOX_TOKEN}`;
</script>

<div class="map-container">
  <div bind:this={mapContainer} class="main-map"></div>
  <div class="inset-map">
    <img
      src={insetMapUrl}
      alt="Inset map showing the broader regional context"
    />
    <div class="inset-label">Study area</div>
  </div>
</div>


<style lang="scss">
  @use "../scss/abstracts" as *;

  .map-container {
    position: relative;
    width: 100%;
    max-width: 800px;
    pointer-events: none;

    .main-map {
      width: 100%;
      aspect-ratio: 6/9;
    }

    .inset-map {
      position: absolute;
      top: 2%;
      right: 2%;
      width: 35vw;
      height: 35vw;
      min-width: 175px;
      min-height: 175px;
      aspect-ratio: 1;
      border: 2px solid #fff;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
      background: white;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .inset-label {
        position: absolute;
        top: 35%;
        left: 50%;
        transform: translate(-50%, -50%);
        padding: 2px 8px;
        font-weight: 900;
        white-space: nowrap;
        font-size: 14px;

        @include mq($break: "medium", $dir: "max-width") {
          font-size: 0.8em;
        }
      }
    }
  }
</style>
