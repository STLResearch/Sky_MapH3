import React, { useState, useCallback } from "react";
import Map, { Source, Layer, FlyToInterpolator, Popup } from "react-map-gl";
import { latLngToCell, cellToBoundary, cellArea } from "h3-js";
import HexDetails from "./HexDetails";

const HexMap = () => {
  const [viewport, setViewport] = useState({
    latitude: 37.7749,
    longitude: -122.4194,
    zoom: 10,
  });
  const [selectedHexes, setSelectedHexes] = useState([]);
  const [hexes, setHexes] = useState([]);
  const [hexSize, setHexSize] = useState(7);
  const [mapStyle, setMapStyle] = useState("mapbox://styles/mapbox/streets-v11");
  const [searchHexIndex, setSearchHexIndex] = useState("");
  const [hoverHex, setHoverHex] = useState(null); // Hovered hex index
  const [hoverPosition, setHoverPosition] = useState(null); // Cursor position

  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

  const drawHexagons = useCallback(
    (bounds) => {
      const sw = bounds.getSouthWest();
      const ne = bounds.getNorthEast();

      const swLat = sw.lat;
      const swLng = sw.lng;
      const neLat = ne.lat;
      const neLng = ne.lng;

      const hexagons = [];
      for (let lat = swLat; lat <= neLat; lat += 0.1) {
        for (let lng = swLng; lng <= neLng; lng += 0.1) {
          const hexIndex = latLngToCell(lat, lng, hexSize);
          hexagons.push(hexIndex);
        }
      }
      setHexes([...new Set(hexagons)]);
    },
    [hexSize]
  );

  const onMapMove = (event) => {
    const mapBounds = event.target.getBounds();
    drawHexagons(mapBounds);
  };

  const handleMapClick = (event) => {
    const { lat, lng } = event.lngLat;
    if (!lat || !lng) return;

    const hexIndex = latLngToCell(lat, lng, hexSize);
    const boundary = cellToBoundary(hexIndex, true);
    const area = cellArea(hexIndex, "m2");

    const alreadySelected = selectedHexes.some((hex) => hex.hexIndex === hexIndex);
    if (alreadySelected) {
      setSelectedHexes((prev) => prev.filter((hex) => hex.hexIndex !== hexIndex));
    } else {
      setSelectedHexes((prev) => [
        ...prev,
        { hexIndex, boundary, area, hexSize },
      ]);
    }
  };

  const handleMouseMove = (event) => {
    const { lat, lng } = event.lngLat;

    // Determine which hex the cursor is hovering over
    const hexIndex = latLngToCell(lat, lng, hexSize);
    if (hexes.includes(hexIndex)) {
      setHoverHex(hexIndex);
      setHoverPosition({ lat, lng });
    } else {
      setHoverHex(null);
      setHoverPosition(null);
    }
  };

  const handleHexSizeChange = (event) => {
    setHexSize(parseInt(event.target.value, 10));
    setHexes([]);
  };

  const toggleMapStyle = () => {
    setMapStyle((prevStyle) =>
      prevStyle === "mapbox://styles/mapbox/streets-v11"
        ? "mapbox://styles/mapbox/satellite-v9"
        : "mapbox://styles/mapbox/streets-v11"
    );
  };

  const handleSearch = () => {
    const hexIndex = searchHexIndex.trim();
    if (hexIndex) {
      const boundary = cellToBoundary(hexIndex, true);
      const centerLat = (boundary[0][0] + boundary[4][0]) / 2;
      const centerLng = (boundary[0][1] + boundary[4][1]) / 2;
      setViewport({
        ...viewport,
        latitude: centerLat,
        longitude: centerLng,
        zoom: 12,
        transitionDuration: 1000,
        transitionInterpolator: new FlyToInterpolator(),
      });
      const selectedBoundary = cellToBoundary(hexIndex, true);
      const area = cellArea(hexIndex, "m2");
      setSelectedHexes([{ hexIndex, boundary: selectedBoundary, area, hexSize }]);
    }
  };

  const locateUser = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;

        setViewport((prev) => ({
          ...prev,
          latitude,
          longitude,
          zoom: 12,
          transitionDuration: 1000,
        }));
      },
      (error) => {
        alert("Unable to retrieve your location.");
        console.error(error);
      }
    );
  };

  return (
    <div className="flex flex-col lg:flex-row w-full h-screen overflow-hidden relative">
      <div className="relative lg:w-2/3 w-full h-full overflow-hidden">
        <Map
          {...viewport}
          style={{ width: "100%", height: "100%" }}
          mapStyle={mapStyle}
          mapboxAccessToken={mapboxToken}
          attributionControl={false}
          onMoveEnd={onMapMove}
          onClick={handleMapClick}
          onMouseMove={handleMouseMove} // Attach the hover event
        >
          <Source
            id="hexes"
            type="geojson"
            data={{
              type: "FeatureCollection",
              features: hexes.map((hex) => ({
                type: "Feature",
                geometry: {
                  type: "Polygon",
                  coordinates: [cellToBoundary(hex, true)],
                },
                properties: {},
              })),
            }}
          >
            <Layer
              id="hex-layer"
              type="fill"
              paint={{
                "fill-color": "#088",
                "fill-opacity": 0.4,
              }}
            />
          </Source>

          {selectedHexes.map((hex, index) => (
            <Source
              key={index}
              id={`selected-hex-${index}`}
              type="geojson"
              data={{
                type: "FeatureCollection",
                features: [
                  {
                    type: "Feature",
                    geometry: {
                      type: "Polygon",
                      coordinates: [hex.boundary],
                    },
                    properties: {},
                  },
                ],
              }}
            >
              <Layer
                id={`selected-hex-layer-${index}`}
                type="line"
                paint={{
                  "line-color": "#f00",
                  "line-width": 3,
                }}
              />
            </Source>
          ))}

          {/* Hover Pop-up */}
          {hoverHex && hoverPosition && (
            <Popup
              latitude={hoverPosition.lat}
              longitude={hoverPosition.lng}
              closeButton={false}
              closeOnClick={false}
              anchor="top"
            >
              <div className="text-sm">Hex Index: {hoverHex}</div>
            </Popup>
          )}
        </Map>

        <button
          onClick={locateUser}
          className="absolute bottom-4 right-4 bg-blue-500 text-white p-3 rounded-full shadow-lg z-10 hover:bg-blue-600"
        >
          Locate me 📍
        </button>
      </div>

      <div className="lg:w-1/3 w-full h-full bg-gray-900 text-white p-4 overflow-auto">
        <div className="mb-4">
          <span className="text-white text-lg">
            Selected Hexes: {selectedHexes.length}
          </span>
        </div>
        <div className="mb-4">
          <span className="text-white text-lg">Hex Resolution: {hexSize}</span>
        </div>
        <HexDetails hexes={selectedHexes} hexSize={hexSize} />
      </div>

      <div className="absolute top-4 left-4 bg-white p-4 rounded shadow-lg z-10">
        <label htmlFor="hexSize" className="block text-sm font-medium text-gray-700">
          Hex Size (Resolution: {hexSize})
        </label>
        <input
          id="hexSize"
          type="range"
          min="0"
          max="15"
          value={hexSize}
          onChange={handleHexSizeChange}
          className="mt-2 w-full"
        />
        <button
          onClick={toggleMapStyle}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded shadow-md hover:bg-blue-600"
        >
          Switch {mapStyle.includes("satellite") ? "Basic" : "Satellite"} View
        </button>
      </div>

      <div className="absolute bottom-4 left-4 z-20 bg-white p-2 rounded shadow-md w-1/4">
        <input
          type="text"
          value={searchHexIndex}
          onChange={(e) => setSearchHexIndex(e.target.value)}
          placeholder="Hex Index"
          className="p-1 w-full rounded bg-gray-800 text-white border border-gray-700 focus:outline-none text-sm"
        />
        <button
          onClick={handleSearch}
          className="mt-2 w-full px-3 py-1 bg-blue-500 text-white rounded shadow-md hover:bg-blue-600 text-sm"
        >
          Search
        </button>
      </div>
    </div>
  );
};

export default HexMap;
