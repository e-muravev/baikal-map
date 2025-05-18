"use client";

import { MapContainer, Marker, Popup, Rectangle, TileLayer, useMap, useMapEvents } from "react-leaflet";
import L, { LeafletMouseEvent } from "leaflet";
import { Circle, Polygon } from "react-leaflet";
import { useEffect } from "react";
import { OsmData } from "@/interfaces";

import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";

function MyComponent() {
  const map = useMap();

  useEffect(() => {
    let currentlyHighlited: L.Polygon | null = null;

    const highlightBuilding: L.LeafletMouseEventHandlerFn = (e) => {
      if (currentlyHighlited) {
        currentlyHighlited.setStyle({
          color: "green",
          fillColor: "green",
          fillOpacity: 0.3,
          weight: 1,
        });
      }

      e.target.setStyle({
        fillColor: "red",
        color: "red",
        fillOpacity: 0.3,
        weight: 1,
      });

      currentlyHighlited = e.target;
    };
    const displayBuildings = (osmData: OsmData) => {
      const buildingsLayer = L.layerGroup();

      osmData.elements.slice(0, 150).forEach((element) => {
        if (element.type === "way" && element.tags.building) {
          const nodes = element.nodes
            .map((nodeId) => {
              const node = osmData.elements.find((e) => e.id === nodeId && e.type === "node");

              return node ? [node.lat, node.lon] : undefined;
            })
            .filter((el) => el !== undefined);

          if (nodes && nodes.length > 2) {
            const polygon = L.polygon(nodes, {
              color: "green",
              fillColor: "green",
              fillOpacity: 0.3,
              weight: 1,
              //@ts-expect-error: we need this field
              buildingId: element.id,
            })
              .bindPopup(`<b>Здание</b><br>Имя: ${element.tags.name ?? "нет имени"}`)
              .addTo(buildingsLayer);

            polygon.on("click", highlightBuilding);
          }
        }
      });

      buildingsLayer.addTo(map);
    };

    const getBuildingsInBBox = async () => {
      const bounds = map.getBounds();
      const bbox = `${bounds.getSouth()},${bounds.getWest()},${bounds.getNorth()},${bounds.getEast()}`;

      const query = `[out:json][timeout:25];
        (
          way["building"](${bbox});
          relation["building"](${bbox});
        );
        out body;
        >;
        out skel qt;`;

      const response = await fetch("https://overpass-api.de/api/interpreter", {
        method: "POST",
        body: query,
      });

      const data = await response.json();

      displayBuildings(data);

      return data;
    };

    getBuildingsInBBox();
  }, [map]);

  useMapEvents({
    click: (e: LeafletMouseEvent) => {
      const latlng = e.latlng;

      console.log(latlng);
    },
  });

  return null;
  // <GeoJSON
  //   data={geoJSON}
  //   style={{ color: "red", weight: 5, opacity: 0.65 }}
  //   onEachFeature={(feature, layer) => {
  //     console.log(feature);
  //     if (feature.properties && feature.properties.popupContent) {
  //       console.log(feature);
  //       layer.bindPopup(feature.properties.popupContent);
  //     }
  //   }}
  // />
}

const Map = () => {
  return (
    <MapContainer
      style={{ width: "100%", height: "100vh" }}
      center={[52.984, 108.298]}
      zoom={16}
      scrollWheelZoom={false}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={[52.829, 107.182]}>
        <Popup>Озеро Байкал</Popup>
      </Marker>
      <Polygon
        color="blue"
        positions={[
          [52.173, 106.766],
          [52.315195264379575, 106.81457519531251],
          [52.45098804923731, 106.89147949218751],
          [52.556316065406556, 107.13043212890626],
        ]}>
        <Popup>Какой-то пляж</Popup>
      </Polygon>
      <Circle
        color="blue"
        center={[52.505, 107.403]}
        radius={1000}
        pathOptions={{ color: "green", fillColor: "green", fillOpacity: 0.5 }}>
        <Popup>Какой-то место</Popup>
      </Circle>
      <Rectangle
        color="red"
        bounds={[
          [52.39, 107.5],
          [52.5, 107.7],
        ]}>
        <Popup>Какой-то место</Popup>
      </Rectangle>
      <MyComponent />
    </MapContainer>
  );
};

export default Map;
