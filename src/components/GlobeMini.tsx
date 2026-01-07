import { onMount } from "solid-js";
import * as d3 from "d3";
import worldData from "../lib/world.json";
import { GLOBE_CONFIG } from "../lib/constants";

const GlobeMini = () => {
  let mapContainer: HTMLDivElement | undefined;

  onMount(() => {
    if (!mapContainer) return;

    const width = 500;
    const height = 500;
    const scale = 250;

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
      .attr("height", height);

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

    // Auto rotate
    d3.timer(() => {
      const rotate = projection.rotate();
      const k = GLOBE_CONFIG.sensitivity / projection.scale();
      projection.rotate([rotate[0] - GLOBE_CONFIG.rotateSpeed * k, rotate[1]]);
      svg.selectAll("path").attr("d", (d: any) => pathGenerator(d as any));
    }, GLOBE_CONFIG.timerInterval);
  });

  return <div ref={mapContainer} class="w-full h-full flex items-center justify-center"></div>;
};

export default GlobeMini;
