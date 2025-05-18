import { LatLngExpression } from "leaflet";

export interface OsmData {
  version: number;
  generator: string;
  osm3s: Osm3s;
  elements: Element[];
}

export interface Osm3s {
  timestamp_osm_base: string;
  copyright: string;
}

export interface Element {
  type: string;
  id: number;
  nodes: number[];
  tags: Tags;
  lat: LatLngExpression;
  lon: LatLngExpression;
}

export interface Tags {
  amenity?: string;
  building: string;
  name?: string;
  source?: string;
  "building:levels"?: string;
  emergency?: string;
  religion?: string;
  "addr:housenumber"?: string;
  "addr:street"?: string;
  "name:ru"?: string;
  "addr:city"?: string;
}
