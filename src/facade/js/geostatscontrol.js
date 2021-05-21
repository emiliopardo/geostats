/* eslint-disable no-console */
/**
 * @module M/control/GeostatsControl
 */

import GeostatsImplControl from "impl/geostatscontrol";
import template from "templates/geostats";
import Papa from "papaparse";
import geostats from "geostats";
import chroma from "chroma-js";

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
    this.csv_header = false;
    this.mvt = null;
    this.serie = null;
    this.uValues = null;
    this.colorValues = null;
    this.elment = null;
    this.linkField = null;
    this.dataField = null;
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
    this.csvLoadButton = html.querySelector("input#csvLoadButton");
    this.load = html.querySelector("button#loadButton");
    this.selectorCapa.addEventListener("change", (evt) =>
      this.setServiceURL(evt, this.selectorCapa.value)
    );
    this.file.addEventListener("change", (evt) =>
      this.preLoadCSVFile(evt, this.file.value)
    );
    this.csvLoadButton.addEventListener("click", (evt) =>
      this.loadCSVFile(evt, this.file.value)
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

  preLoadCSVFile(evt, file) {
    console.log(evt);
    this.csv_file = file;
    if (this.csv_file) {
      let files = this.file.files;
      Papa.parse(files[0], {
        header: false,
        preview: 3,
        dynamicTyping: true,
        complete: (results) => {
          this.previewDataset(results);
        },
      });
      this.csvLoadButton.disabled = false;
    }
  }

  loadCSVFile(evt, file) {
    this.csv_file = file;
    if (this.csv_file) {
      let files = this.file.files;
      Papa.parse(files[0], {
        header: this.csv_header,
        preview: 0,
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
  }

  setMetodo(env, metodo) {
    console.log(metodo);
    this.load.disabled = false;
  }

  previewDataset(dataset) {
    const columns = dataset.data[0];
    let firstRow = "";
    let html =
      "<div>\n" +
      "<table class='table-container' width='100%' role='table' id='dataPreviewTable'>\n" +
      "<tbody>\n";
    for (let y = 0; y < dataset.data.length; y++) {
      html +=
        "<tr class='flex-table header' role='rowgroup'>\n" +
        "<td class='errorMessage flex-row first' role='cell'>" +
        (y + 1) +
        "</td>\n" +
        "<td class='errorMessage flex-row' role='cell'>\n" +
        dataset.data[y] +
        "</td>\n";
    }
    html +=
      "</tbody>\n" +
      "</table>\n" +
      "</div>\n" +
      "<div>\n" +
      "<li class='geostats-li'>\n" +
      "<input class='geostats-input-checkbox' type='checkbox' name='csvHeader' id='csvHeader' />\n" +
      "<label id='labelcsvHeader' class='geostats-input-label-inline' for='csvHeader'>El CSV incluye Cabecera</label>\n" +
      "</li>\n" +
      "</div>\n" +
      "<div id='csvParameters'>\n" +
      "<div id='divLinkColumn'>\n" +
      "<label id='labelSelectLinkColumn' class='geostats-input-label-inline' for='SelectLinkColumn'>Seleccione el campo de enlace</label>\n" +
      "<select class='geostats-select' name='SelectLinkColumn' id='SelectLinkColumn'>\n" +
      this.setLinkColumn(columns, false) +
      "</select>\n" +
      "</div>\n" +
      "<div id='divDataColumn'>\n" +
      "<label id='labelSelectDataColumn' class='geostats-input-label-inline' for='SelectDataColumn'>Seleccione variable</label>\n" +
      "<select class='geostats-select' name='SelectDataColumn' id='SelectDataColumn'>\n" +
      this.setLinkColumn(columns, false) +
      "</select>" +
      "</div>\n" +
      "</div>\n";
    M.dialog.info(html, "Previsualización archivo " + this.file.files[0].name);

    let csvHeaderValue = document.getElementById("csvHeader");
    let selectorLinkColumn = document.getElementById("SelectLinkColumn");
    let selectorDataColumn = document.getElementById("SelectDataColumn");

    selectorLinkColumn.addEventListener("change", () => {
      this.linkField = selectorLinkColumn.value;
      console.log(this.linkField);
    });
    selectorDataColumn.addEventListener("change", () => {
      this.dataField = selectorDataColumn.value;
      console.log(this.dataField);
    });
    csvHeaderValue.addEventListener("click", () => {
      let linkColumn = document.getElementById("SelectLinkColumn");
      let dataColumn = document.getElementById("SelectDataColumn");
      let table = document.getElementById("dataPreviewTable");

      if (csvHeaderValue.checked) {
        firstRow = table.rows[0];
        firstRow.classList.toggle("bold");
        this.csv_header = true;
      } else {
        firstRow.classList.toggle("bold");
      }
      linkColumn.innerHTML = this.setLinkColumn(
        columns,
        csvHeaderValue.checked
      );
      dataColumn.innerHTML = this.setLinkColumn(
        columns,
        csvHeaderValue.checked
      );
    });
  }

  setLinkColumn(columns, header) {
    let html =
      "<option value='' selected='selected'>Seleccione una opción...</option>\n";
    for (let z = 0; z < columns.length; z++) {
      if (header) {
        const value = columns[z];
        html += "<option value=" + value + ">" + value + "</option>\n";
      } else {
        html += "<option value=" + z + ">columna " + (z + 1) + "</option>\n";
      }
    }
    return html;
  }

  parseDataset(dataset) {
    console.log(dataset);
    if (dataset.errors.length > 0) {
      this.renderDatasetErrors(dataset.errors);
    } else {
      this.renderDatasetMetadata(dataset.meta);
      //M.dialog.success("Archivo cargado con éxito");
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
    M.dialog.success(html, "Archivo cargado con éxito");
  }

  renderDatasetErrors(datasetErrorsMessage) {
    let html =
      "<table class='table-container' width='100%' role='table'>\n" +
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
        "<td class='errorMessage flex-row first' role='cell'>" +
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

  loadLayer() {
    //this.activate();
    this.colorValues = [];
    for (let index = 0; index < this.uValues.length; index++) {
      this.colorValues.push(chroma.random().hex());
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
