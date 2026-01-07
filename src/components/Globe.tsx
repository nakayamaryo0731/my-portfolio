import { onMount } from "solid-js";
import * as d3 from "d3";
import worldData from "../lib/world.json";
import { GLOBE_CONFIG } from "../lib/constants";

const GlobeComponent = () => {
  let mapContainer: HTMLDivElement | undefined;

  onMount(() => {
    if (!mapContainer) return;

    const width = Math.min(window.innerWidth * 0.9, 600);
    const height = Math.min(window.innerHeight * 0.6, 600);
    const scale = Math.min(width, height) / 2.2;

    let projection = d3
      .geoOrthographic()
      .scale(scale)
      .center([0, 0])
      .rotate([-139, -36])
      .translate([width / 2, height / 2]);

    const initialScale = projection.scale();
    let pathGenerator = d3.geoPath().projection(projection);

    let svg = d3
      .select(mapContainer)
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .style("cursor", "grab");

    svg
      .append("circle")
      .attr("fill", GLOBE_CONFIG.colors.globe)
      .attr("stroke", "#000")
      .attr("stroke-width", "0.2")
      .attr("cx", width / 2)
      .attr("cy", height / 2)
      .attr("r", initialScale);

    let map = svg.append("g");

    map
      .append("g")
      .attr("class", "countries")
      .selectAll("path")
      .data((worldData as any).features)
      .enter()
      .append("path")
      .attr("d", (d: any) => pathGenerator(d as any))
      .attr("fill", (d: { properties: { name: string } }) =>
        GLOBE_CONFIG.visitedCountries.includes(d.properties.name)
          ? GLOBE_CONFIG.colors.visited
          : GLOBE_CONFIG.colors.unvisited
      )
      .style("stroke", GLOBE_CONFIG.colors.stroke)
      .style("stroke-width", 0.3)
      .style("opacity", 0.8);

    // Drag to rotate
    let isDragging = false;
    (svg as any).call(
      d3.drag<SVGSVGElement, unknown>()
        .on("start", () => {
          isDragging = true;
          svg.style("cursor", "grabbing");
        })
        .on("drag", (event: d3.D3DragEvent<SVGSVGElement, unknown, unknown>) => {
          const rotate = projection.rotate();
          const k = GLOBE_CONFIG.sensitivity / projection.scale();
          projection.rotate([
            rotate[0] + event.dx * k,
            rotate[1] - event.dy * k,
          ]);
          svg.selectAll("path").attr("d", (d: any) => pathGenerator(d as any));
        })
        .on("end", () => {
          isDragging = false;
          svg.style("cursor", "grab");
        })
    );

    // Auto rotate when not dragging
    d3.timer(() => {
      if (!isDragging) {
        const rotate = projection.rotate();
        const k = GLOBE_CONFIG.sensitivity / projection.scale();
        projection.rotate([rotate[0] - GLOBE_CONFIG.rotateSpeed * k, rotate[1]]);
        svg.selectAll("path").attr("d", (d: any) => pathGenerator(d as any));
      }
    }, GLOBE_CONFIG.timerInterval);
  });

  return (
    <div class="flex flex-col text-white justify-center items-center">
      <div ref={mapContainer}></div>
    </div>
  );
};

export default GlobeComponent;
