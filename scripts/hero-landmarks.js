/* Mirrors iOS PersonalHeatmapCityLights / PersonalHeatmapPlaceLabels. */
window.PMHeroLandmarks = {
  add(map, data, dark, language) {
    map.addSource("pm-city-lights", {
      type: "geojson",
      data: data.lights,
      cluster: true,
      clusterRadius: 36,
      clusterMaxZoom: 9,
    });
    const fade = (opacity) => [
      "interpolate",
      ["linear"],
      ["zoom"],
      0,
      opacity,
      7.4,
      opacity,
      8.4,
      0,
    ];
    for (const [suffix, radius, blur, opacity, color] of [
      ["halo", 22, 0.9, dark ? 0.5 : 0.26, "#ff590f"],
      ["glow", 9, 0.45, dark ? 0.75 : 0.5, "#ff7a1f"],
      ["core", 3.8, 0, 1, dark ? "#ffc963" : "#d64a0a"],
    ])
      map.addLayer({
        id: `pm-city-lights-${suffix}`,
        type: "circle",
        source: "pm-city-lights",
        maxzoom: 8.4,
        paint: {
          "circle-radius": radius,
          "circle-blur": blur,
          "circle-color": color,
          "circle-opacity": fade(opacity),
          "circle-pitch-alignment": "viewport",
          "circle-pitch-scale": "viewport",
        },
      });
    const canvas = document.createElement("canvas");
    canvas.width = 48;
    canvas.height = 60;
    const ctx = canvas.getContext("2d");
    ctx.scale(2, 2);
    ctx.fillStyle = "#ff6b1a";
    ctx.beginPath();
    ctx.roundRect(11, 19, 2, 10, 1);
    ctx.fill();
    ctx.fillStyle = dark ? "rgba(26,26,26,.96)" : "rgba(255,255,255,.96)";
    ctx.beginPath();
    ctx.roundRect(1, 1, 22, 22, 5);
    ctx.fill();
    ctx.strokeStyle = "rgba(255,107,26,.6)";
    ctx.lineWidth = 0.75;
    ctx.stroke();
    map.addImage("pm-place-sign", ctx.getImageData(0, 0, 48, 60), {
      pixelRatio: 2,
      stretchX: [
        [12, 22],
        [26, 36],
      ],
      stretchY: [[10, 34]],
      content: [12, 10, 36, 36],
    });
    const places = data.places[language] || data.places.en;
    for (const country of [true, false]) {
      const id = country ? "pm-place-countries" : "pm-place-cities";
      const opacity = country
        ? ["interpolate", ["linear"], ["zoom"], 0, 1, 1.2, 1, 2, 0]
        : ["interpolate", ["linear"], ["zoom"], 1.4, 0, 2, 1, 8.4, 1, 9.4, 0];
      map.addSource(id, {
        type: "geojson",
        data: places[country ? "countries" : "cities"],
      });
      map.addLayer({
        id,
        type: "symbol",
        source: id,
        minzoom: country ? 0 : 1.4,
        maxzoom: country ? 2 : 9.4,
        layout: {
          "text-field": ["get", "name"],
          "text-font": ["DIN Pro Medium", "Arial Unicode MS Regular"],
          "text-size": country ? 12 : 11,
          "text-letter-spacing": country ? 0.06 : 0.02,
          "text-max-width": country ? 9 : 10,
          "text-offset": [0, country ? -0.4 : -0.7],
          "text-padding": country ? 8 : 5,
          "symbol-sort-key": ["get", "priority"],
          "text-pitch-alignment": "viewport",
          "text-rotation-alignment": "viewport",
          "icon-image": "pm-place-sign",
          "icon-text-fit": "both",
          "icon-text-fit-padding": [2, 5, 2, 5],
          "icon-pitch-alignment": "viewport",
          "icon-rotation-alignment": "viewport",
        },
        paint: {
          "text-color": dark ? "#f5f5f5" : "#262626",
          "text-opacity": opacity,
          "icon-opacity": opacity,
        },
      });
    }
  },
  language(map, data, language) {
    const places = data.places[language] || data.places.en;
    for (const kind of ["countries", "cities"])
      map.getSource(`pm-place-${kind}`)?.setData(places[kind]);
  },
};
