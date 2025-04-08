<script>
  import Window from "./components/Window.svelte";
  import Map from "./components/Map.svelte";
  import Legend from "./components/Legend.svelte";
  // Handle responsive iframes for embeds
  import pym from "pym.js";

  new pym.Child({
    polling: 500,
  });

  function getUrlParameter(name) {
    const params = new URLSearchParams(window.location.search);
    return params.get(name);
  }

  let includeCredit = getUrlParameter("credit") != "false";
</script>

<Window />
<!-- Outer div must have class 'chart-container' don't change -->
<div class="chart-container">
  <h1 class="headline">New pumping station approved for Mississippi Delta</h1>

  <p class="dek">
    The Army Corps' Yazoo Pumps project aims to reduce chronic flooding in the
    backwater area, but environmentalists warn it could damage 90,000 acres of
    wetlands.
  </p>
  <p class="sr-only">
    Map of the Yazoo Backwater Study Area in the Mississippi Delta, showing
    locations of control structures including the Steele Bayou drainage flood
    gate. The map highlights the area affected by the Army Corps' Yazoo Pumps
    project, which aims to reduce flooding but could impact 90,000 acres of
    wetlands. An inset shows the location of the study area within Mississippi.
  </p>

  <div id="g-viz">
    <Legend />
    <Map />
  </div>

  {#if includeCredit}
    <div class="credit">
      Data: <a
        href="https://www.mvk.usace.army.mil/Missions/Programs-and-Project-Management/Yazoo-Backwater/"
        target="_blank">U.S. Army Corps of Engineers</a
      >; Graphic by Jared Whalen /
      <a target="_blank" href="https://agwaterdesk.org/">Ag & Water Desk</a>
    </div>
  {/if}
</div>

<style lang="scss">
  .chart-container {
    max-width: 800px;
    width: 100%;
    padding: 0.5rem;

    #g-viz {
      width: 100%;
    }
  }
</style>
