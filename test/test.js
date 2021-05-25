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
    year: "Secciones censales (Año 2000)",
    service: "http://10.240.2.27:8081/data/secciones_censales_2000/{z}/{x}/{y}.pbf",
  },
  {
    year: "Secciones censales (Año 2001)",
    service: "http://10.240.2.27:8081/data/secciones_censales_2001/{z}/{x}/{y}.pbf",
  },
  {
    year: "Secciones censales (Año 2002)",
    service: "http://10.240.2.27:8081/data/secciones_censales_2002/{z}/{x}/{y}.pbf",
  },
  {
    year: "Secciones censales (Año 2003)",
    service: "http://10.240.2.27:8081/data/secciones_censales_2003/{z}/{x}/{y}.pbf",
  },
  {
    year: "Secciones censales (Año 2004)",
    service: "http://10.240.2.27:8081/data/secciones_censales_2004/{z}/{x}/{y}.pbf",
  },
  {
    year: "Secciones censales (Año 2005)",
    service: "http://10.240.2.27:8081/data/secciones_censales_2005/{z}/{x}/{y}.pbf",
  },
  {
    year: "Secciones censales (Año 2006)",
    service: "http://10.240.2.27:8081/data/secciones_censales_2006/{z}/{x}/{y}.pbf",
  },
  {
    year: "Secciones censales (Año 2007)",
    service: "http://10.240.2.27:8081/data/secciones_censales_2007/{z}/{x}/{y}.pbf",
  },
  {
    year: "Secciones censales (Año 2008)",
    service: "http://10.240.2.27:8081/data/secciones_censales_2008/{z}/{x}/{y}.pbf",
  },
  {
    year: "Secciones censales (Año 2009)",
    service: "http://10.240.2.27:8081/data/secciones_censales_2009/{z}/{x}/{y}.pbf",
  },
  {
    year: "Secciones censales (Año 2010)",
    service: "http://10.240.2.27:8081/data/secciones_censales_2010/{z}/{x}/{y}.pbf",
  },
  {
    year: "Secciones censales (Año 2011)",
    service: "http://10.240.2.27:8081/data/secciones_censales_2011/{z}/{x}/{y}.pbf",
  },
  {
    year: "Secciones censales (Año 2012)",
    service: "http://10.240.2.27:8081/data/secciones_censales_2012/{z}/{x}/{y}.pbf",
  },
  {
    year: "Secciones censales (Año 2013)",
    service: "http://10.240.2.27:8081/data/secciones_censales_2013/{z}/{x}/{y}.pbf",
  },
  {
    year: "Secciones censales (Año 2014)",
    service: "http://10.240.2.27:8081/data/secciones_censales_2014/{z}/{x}/{y}.pbf",
  },
  {
    year: "Secciones censales (Año 2015)",
    service: "http://10.240.2.27:8081/data/secciones_censales_2015/{z}/{x}/{y}.pbf",
  },
  {
    year: "Secciones censales (Año 2016)",
    service: "http://10.240.2.27:8081/data/secciones_censales_2016/{z}/{x}/{y}.pbf",
  },
  {
    year: "Secciones censales (Año 2017)",
    service: "http://10.240.2.27:8081/data/secciones_censales_2017/{z}/{x}/{y}.pbf",
  },
  {
    year: "Secciones censales (Año 2018)",
    service: "http://10.240.2.27:8081/data/secciones_censales_2018/{z}/{x}/{y}.pbf",
  },
  {
    year: "Secciones censales (Año 2019)",
    service: "http://10.240.2.27:8081/data/secciones_censales_2019/{z}/{x}/{y}.pbf",
  },
  {
    year: "Secciones censales (Año 2020)",
    service: "http://10.240.2.27:8081/data/secciones_censales_2020/{z}/{x}/{y}.pbf",
  },
];

const mp = new Geostats(secciones_censales);
map.addPlugin(mp);

