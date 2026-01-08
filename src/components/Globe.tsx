import { onMount } from "solid-js";
import * as d3 from "d3";
import type { GeoPermissibleObjects } from "d3";
import worldData from "../lib/world.json";
import { GLOBE_CONFIG } from "../lib/constants";

// GeoJSON Feature type for world data
interface GeoFeature {
  type: "Feature";
  properties: {
    name: string;
  };
  geometry: GeoPermissibleObjects;
}

interface WorldData {
  type: "FeatureCollection";
  features: GeoFeature[];
}

interface GlobeProps {
  /** Fixed size in pixels, or 'responsive' for window-based sizing */
  size?: number | "responsive";
  /** Enable drag to rotate interaction */
  draggable?: boolean;
}

const Globe = (props: GlobeProps) => {
  let mapContainer: HTMLDivElement | undefined;

  // Default values
  const size = () => props.size ?? "responsive";
  const draggable = () => props.draggable ?? true;

  onMount(() => {
    if (!mapContainer) return;

    // Calculate dimensions based on size prop
    const isResponsive = size() === "responsive";
    const width = isResponsive
      ? Math.min(window.innerWidth * 0.9, 600)
      : (size() as number);
    const height = isResponsive
      ? Math.min(window.innerHeight * 0.6, 600)
      : (size() as number);
    const scale = Math.min(width, height) / 2.2;

    const projection = d3
      .geoOrthographic()
      .scale(scale)
      .center([0, 0])
      .rotate([-139, -36])
      .translate([width / 2, height / 2]);

    const initialScale = projection.scale();
    const pathGenerator = d3.geoPath().projection(projection);

    const svg = d3
      .select(mapContainer)
      .append("svg")
      .attr("width", width)
      .attr("height", height);

    // Only show grab cursor if draggable
    if (draggable()) {
      svg.style("cursor", "grab");
    }

    svg
      .append("circle")
      .attr("fill", GLOBE_CONFIG.colors.globe)
      .attr("stroke", "#000")
      .attr("stroke-width", "0.2")
      .attr("cx", width / 2)
      .attr("cy", height / 2)
      .attr("r", initialScale);

    const map = svg.append("g");
    const typedWorldData = worldData as WorldData;

    map
      .append("g")
      .attr("class", "countries")
      .selectAll("path")
      .data(typedWorldData.features)
      .enter()
      .append("path")
      .attr("d", (d) => pathGenerator(d.geometry) ?? "")
      .attr("fill", (d) =>
        GLOBE_CONFIG.visitedCountries.includes(d.properties.name)
          ? GLOBE_CONFIG.colors.visited
          : GLOBE_CONFIG.colors.unvisited
      )
      .style("stroke", GLOBE_CONFIG.colors.stroke)
      .style("stroke-width", 0.3)
      .style("opacity", 0.8);

    // Update all paths helper
    const updatePaths = () => {
      svg.selectAll<SVGPathElement, GeoFeature>("path").attr("d", (d) =>
        pathGenerator(d.geometry) ?? ""
      );
    };

    // Drag to rotate (only if draggable)
    let isDragging = false;
    if (draggable()) {
      svg.call(
        d3
          .drag<SVGSVGElement, unknown>()
          .on("start", () => {
            isDragging = true;
            svg.style("cursor", "grabbing");
          })
          .on("drag", (event) => {
            const rotate = projection.rotate();
            const k = GLOBE_CONFIG.sensitivity / projection.scale();
            projection.rotate([
              rotate[0] + event.dx * k,
              rotate[1] - event.dy * k,
            ]);
            updatePaths();
          })
          .on("end", () => {
            isDragging = false;
            svg.style("cursor", "grab");
          })
      );
    }

    // Auto rotate when not dragging
    d3.timer(() => {
      if (!isDragging) {
        const rotate = projection.rotate();
        const k = GLOBE_CONFIG.sensitivity / projection.scale();
        projection.rotate([rotate[0] - GLOBE_CONFIG.rotateSpeed * k, rotate[1]]);
        updatePaths();
      }
    }, GLOBE_CONFIG.timerInterval);
  });

  // Use different container styles based on size
  const containerClass = () =>
    size() === "responsive"
      ? "flex flex-col text-white justify-center items-center"
      : "w-full h-full flex items-center justify-center";

  return (
    <div class={containerClass()}>
      <div ref={mapContainer}></div>
    </div>
  );
};

export default Globe;
