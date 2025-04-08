<script>
  import yazooBackwaterStudyArea from "../data/yazoo-backwater-study-area.geo.json";

  // Get the coordinates from the GeoJSON
  const coordinates =
    yazooBackwaterStudyArea.features[0].geometry.coordinates[0];

  // Calculate bounds to normalize the shape
  const bounds = coordinates.reduce(
    (acc, coord) => ({
      minX: Math.min(acc.minX, coord[0]),
      maxX: Math.max(acc.maxX, coord[0]),
      minY: Math.min(acc.minY, coord[1]),
      maxY: Math.max(acc.maxY, coord[1]),
    }),
    { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity }
  );

  // Create SVG path from coordinates
  const width = 25;
  const height = 30;
  const padding = 2;

  // Scale coordinates to fit in SVG with padding
  const scaleX = (width - padding * 2) / (bounds.maxX - bounds.minX);
  const scaleY = (height - padding * 2) / (bounds.maxY - bounds.minY);
  const scale = Math.min(scaleX, scaleY);

  const pathData =
    coordinates
      .map((coord, i) => {
        const x = padding + (coord[0] - bounds.minX) * scale;
        const y = height - (padding + (coord[1] - bounds.minY) * scale);
        return `${i === 0 ? "M" : "L"}${x},${y}`;
      })
      .join(" ") + "Z";
</script>

<div class="legend">
  <div class="legend-item">
    <svg {width} {height}>
      <path
        d={pathData}
        fill="#548687"
        fill-opacity="0.2"
        stroke="#548687"
        stroke-width="1"
      />
    </svg>
    <span>Yazoo Backwater Study Area</span>
  </div>
  <div class="legend-item">
    <svg width="26" height="20">
      <circle
        cx="15"
        cy="10"
        r="8"
        fill="#F1B82D"
        stroke="#000000"
        stroke-width="2"
      />
    </svg>
    <span>Control structures</span>
  </div>
</div>

<style lang="scss">
  .legend {
    margin: 1rem 0;
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;

    .legend-item {
      display: flex;
      align-items: center;
      gap: 0.15rem;
      font-size: 0.9rem;

      svg {
        flex-shrink: 0;
      }
    }
  }
</style>
