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
    year: 2000,
    service: "http://localhost:8080/data/secciones_censales_2000/{z}/{x}/{y}.pbf",
  },
  {
    year: 2001,
    service: "http://localhost:8080/data/secciones_censales_2001/{z}/{x}/{y}.pbf",
  },
  {
    year: 2002,
    service: "http://localhost:8080/data/secciones_censales_2002/{z}/{x}/{y}.pbf",
  },
  {
    year: 2003,
    service: "http://localhost:8080/data/secciones_censales_2003/{z}/{x}/{y}.pbf",
  },
  {
    year: 2004,
    service: "http://localhost:8080/data/secciones_censales_2004/{z}/{x}/{y}.pbf",
  },
  {
    year: 2005,
    service: "http://localhost:8080/data/secciones_censales_2005/{z}/{x}/{y}.pbf",
  },
  {
    year: 2006,
    service: "http://localhost:8080/data/secciones_censales_2006/{z}/{x}/{y}.pbf",
  },
  {
    year: 2007,
    service: "http://localhost:8080/data/secciones_censales_2007/{z}/{x}/{y}.pbf",
  },
  {
    year: 2008,
    service: "http://localhost:8080/data/secciones_censales_2008/{z}/{x}/{y}.pbf",
  },
  {
    year: 2009,
    service: "http://localhost:8080/data/secciones_censales_2009/{z}/{x}/{y}.pbf",
  },
  {
    year: 2010,
    service: "http://localhost:8080/data/secciones_censales_2010/{z}/{x}/{y}.pbf",
  },
  {
    year: 2011,
    service: "http://localhost:8080/data/secciones_censales_2011/{z}/{x}/{y}.pbf",
  },
  {
    year: 2012,
    service: "http://localhost:8080/data/secciones_censales_2012/{z}/{x}/{y}.pbf",
  },
  {
    year: 2013,
    service: "http://localhost:8080/data/secciones_censales_2013/{z}/{x}/{y}.pbf",
  },
  {
    year: 2014,
    service: "http://localhost:8080/data/secciones_censales_2014/{z}/{x}/{y}.pbf",
  },
  {
    year: 2015,
    service: "http://localhost:8080/data/secciones_censales_2015/{z}/{x}/{y}.pbf",
  },
  {
    year: 2016,
    service: "http://localhost:8080/data/secciones_censales_2016/{z}/{x}/{y}.pbf",
  },
  {
    year: 2017,
    service: "http://localhost:8080/data/secciones_censales_2017/{z}/{x}/{y}.pbf",
  },
  {
    year: 2018,
    service: "http://localhost:8080/data/secciones_censales_2018/{z}/{x}/{y}.pbf",
  },
  {
    year: 2019,
    service: "http://localhost:8080/data/secciones_censales_2019/{z}/{x}/{y}.pbf",
  },
  {
    year: 2020,
    service: "http://localhost:8080/data/secciones_censales_2020/{z}/{x}/{y}.pbf",
  },
];

const mp = new Geostats(secciones_censales);
map.addPlugin(mp);

const add = new M.plugin.AddLayers();
map.addPlugin(add);
