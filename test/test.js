import Geostats from "facade/geostats";

const map = M.map({
  container: "mapjs",
  controls: ["panzoombar", "scale", "location", "layerswitcher", "mouse"],
  layers: [new M.layer.OSM()],
  center: [-543431,4503560],
  zoom: 6,
  projection: "EPSG:3857*m",
});

var secciones_censales = [
  {
    year: 2018,
    service: "http://10.240.2.27/data/secciones2018/{z}/{x}/{y}.pbf",
  },
  {
    year: 2017,
    service: "http://10.240.2.27/data/secciones2017/{z}/{x}/{y}.pbf",
  },
  {
    year: 2016,
    service: "http://10.240.2.27/data/secciones2016/{z}/{x}/{y}.pbf",
  },
];

const mp = new Geostats(secciones_censales);
map.addPlugin(mp);

const add = new M.plugin.AddLayers();
map.addPlugin(add);
