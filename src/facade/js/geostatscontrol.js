/* eslint-disable no-console */
/**
 * @module M/control/GeostatsControl
 */

import GeostatsImplControl from "impl/geostatscontrol";
import template from "templates/geostats";
import Papa from "papaparse";
import geostats from "geostats";

export default class GeostatsControl extends M.Control {
  /**
   * @classdesc
   * Main constructor of the class. Creates a PluginControl
   * control
   *
   * @constructor
   * @extends {M.Control}
   * @api stable
   */
  constructor(secciones) {
    // 1. checks if the implementation can create PluginControl
    if (M.utils.isUndefined(GeostatsImplControl)) {
      M.exception(
        "La implementación usada no puede crear controles GeostatsControl"
      );
    }
    // 2. implementation of this control
    const impl = new GeostatsImplControl();
    super(impl, "Geostats");

    this.secciones_ = secciones;
    this.service_url = null;
    this.csv_file = null;
    this.mvt = null;
    this.serie = null;
    this.uValues = null;
    this.colorValues = null;
    this.elment = null;
  }

  /**
   * This function creates the view
   *
   * @public
   * @function
   * @param {M.Map} map to add the control
   * @api stable
   */
  createView(map) {
    let templateVars = { vars: { secciones: this.secciones_ } };

    return new Promise((success, fail) => {
      const html = M.template.compileSync(template, templateVars);
      this.element = html;
      this.addEvents(html);
      success(html);
    });
  }

  /**
   * This function load mvt layer
   *
   * @public
   * @function
   * @param {url}
   * @api stable
   */

  addEvents(html) {
    this.selectorCapa = html.querySelector("select#SelectCapa");
    this.selectorMetodo = html.querySelector("select#SelectMetodo");
    this.file = html.querySelector("input#SelectedFile");
    this.load = html.querySelector("button#loadButton");
    this.csvHeader = html.querySelector("input#csvHeader")
    this.selectorCapa.addEventListener("change", (evt) =>
      this.setServiceURL(evt, this.selectorCapa.value)
    );
    this.file.addEventListener("change", (evt) =>
      this.setCSVFile(evt, this.file.value)
    );
    this.selectorMetodo.addEventListener("change", (evt) =>
      this.setMetodo(evt, this.selectorMetodo.value)
    );
    this.load.addEventListener("click", (evt) => this.loadLayer());
  }

  /**
   * This function is called on the control activation
   *
   * @public
   * @function
   * @api stable
   */
  activate() {
    // calls super to manage de/activation
    super.activate();
    this.getImpl().activate(this.map_);
  }
  /**
   * This function is called on the control deactivation
   *
   * @public
   * @function
   * @api stable
   */
  deactivate() {
    // calls super to manage de/activation
    super.deactivate();
    this.getImpl().deactivate(this.map_);
  }
  /**
   * This function gets activation button
   *
   * @public
   * @function
   * @param {HTML} html of control
   * @api stable
   */
  getActivationButton(html) {
    return html.querySelector(".m-geostats button");
  }

  /**
   * This function compares controls
   *
   * @public
   * @function
   * @param {M.Control} control to compare
   * @api stable
   */
  equals(control) {
    return control instanceof GeostatsControl;
  }

  // Add your own functions

  setCSVFile(evt, file) {
    this.csv_file = file;
    if (this.csv_file) {
      let files = this.file.files;
      Papa.parse(files[0], {
        header: true,
        dynamicTyping: true,
        complete: (results) => {
          this.parseDataset(results);
        },
      });
      this.selectorMetodo.disabled = false;
    }
  }

  setServiceURL(evt, url) {
    this.service_url = url;

    const estilo2 = new M.style.Polygon({
      fill: {
        color: "#7c7c7c",
        opacity: 0.9,
      },
      stroke: {
        color: "#FFFFFF",
        opacity: 0.9,
        width: 0.5,
      },
    });

    if (this.service_url) {
      if (this.mvt) {
        this.map_.removeMVT(this.mvt);
      }
      this.mvt = new M.layer.MVT({
        url: this.service_url,
        name: "Capa MVT",
        projection: "EPSG:3857",
      });
      this.map_.addLayers(this.mvt);
      this.mvt.applyStyle_(estilo2);

      // this.getImpl()
      // .loadMVT("Capa MVT", url)
      // .then((result) => {
      //   this.mvt = result;
      //   let estilo = new ol.style.Style({
      //     fill: new ol.style.Fill({
      //       color: "rgba(124, 124, 124,0.9)",
      //     }),
      //     stroke: new ol.style.Stroke({
      //       color: "rgba(255, 255, 255,0.9)",
      //       width: 0.5,
      //       lineCap: "round",
      //     }),
      //   });
      //   let layerOL = this.mvt.getImpl().getOL3Layer();
      //   layerOL.setStyle(estilo);
      //   this.map_.addLayers(this.mvt);
      // });
    }

    this.file.disabled = false;
    this.csvHeader.disabled = false;
  }

  setMetodo(env, metodo) {
    console.log(metodo);
    this.load.disabled = false;
  }

  parseDataset(dataset) {
    if (dataset.errors.length > 0) {
      this.renderDatasetErrors(dataset.errors);
    } else {
      this.renderDatasetMetadata(dataset.meta);
    }

    let municipios = [];

    for (var i = 0; i < dataset.data.length; i++) {
      var obj = dataset.data[i];
      municipios.push(obj.municipio);
    }
    this.serie = new geostats(municipios);
    this.uValues = this.serie.getClassUniqueValues();
  }

  renderDatasetMetadata(datasetMetadata) {
    this.infoResults = this.element.querySelector("div#parseResults");
    let html =
      "<p>delimiter: " +
      datasetMetadata.delimiter +
      " Campos: " +
      datasetMetadata.fields +
      " Salto de Linea: " +
      datasetMetadata.linebreak +
      "</p>";
    this.infoResults.innerHTML = html;
    M.dialog.success(html,'Archivo cargado con éxito');
  }

  renderDatasetErrors(datasetErrorsMessage) {
    let html =
      "<table class='table-container' width='100%' role='table' aria-label='Destinations'>\n" +
      "<caption>Day Trip Tours</caption>\n" +
      "<thead>\n" +
      "<tr class='flex-table header' role='rowgroup'>\n" +
      "<th class='flex-row first' role='columnheader'>line</th>\n" +
      "<th class='flex-row' role='columnheader'>code</th>\n" +
      "<th class='flex-row' role='columnheader'>message</th>\n" +
      "</tr>\n" +
      "</thead>\n" +
      "<tbody>\n";
    for (let index = 0; index < datasetErrorsMessage.length; index++) {
      html +=
        "<tr class='flex-table row' role='rowgroup'>\n" +
        "<td class='errorMessage flex-row first' role='cell'><span class='flag-icon flag-icon-gb'></span>" +
        datasetErrorsMessage[index].row +
        "</td>\n" +
        "<td class='errorMessage flex-row' role='cell'>" +
        datasetErrorsMessage[index].code +
        "</td>\n" +
        "<td class='errorMessage flex-row' role='cell'>" +
        datasetErrorsMessage[index].message +
        "</td>\n" +
        "</tr>\n";
    }
    html += "</tbody>\n" + "</table>";
    M.dialog.error(html, "Error al procesar el archivo");
  }

  getRandomColor() {
    var letters = "0123456789ABCDEF";
    var color = "#";
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  loadLayer() {
    //this.activate();
    this.colorValues = [];
    for (let index = 0; index < this.uValues.length; index++) {
      let randomColor = this.getRandomColor();
      this.colorValues.push(randomColor);
    }
    this.serie.setColors(this.colorValues);

    let bounds = this.serie.bounds;
    let colors = this.serie.colors;

    this.mvt.applyStyle_(
      new M.style.Polygon({
        fill: {
          color: function (feature, map) {
            let feature_name = feature.getAttribute("municipio");
            let index_number = bounds.indexOf(feature_name);
            // Definimos una simbologia en funcion del valor de un atributo
            return colors[index_number];
          },
          opacity: 0.9,
        },
        stroke: {
          color: "#000",
          width: 0.5,
          opacity: 0.9,
        },
      })
    );
  }
}
