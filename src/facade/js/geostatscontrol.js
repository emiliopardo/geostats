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
    this.csvFirstRow = null;
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
    }

    this.file.disabled = false;
  }

  setMetodo(env, metodo) {
    let nbClass = 5;
    switch (metodo) {
      case "quantile":
        this.uValues=this.serie.getClassQuantile(nbClass);
        break;
      case "uniqueValues":
        this.uValues=this.serie.getClassUniqueValues(nbClass);
        break;
      case "equalsIntervals":
        this.uValues=this.serie.getClassEqInterval(nbClass);
        break;
      case "standarDesviation":
        this.uValues=this.serie.getClassStdDeviation(nbClass);
        break;
      case "arithmeticProgression":
        this.uValues=this.serie.getClassArithmeticProgression(nbClass);
        break;
      case "geometricProgression":
        this.uValues=this.serie.getClassEqInterval(nbClass);
        break;
      case "naturalBreaksJenks":        
        this.uValues=this.serie.getClassJenks(nbClass);
        break;
      default:
        break;
    }
    //console.log(this.serie);
    console.log(this.uValues);
    //console.log(this.serie["bounds"]);
    //console.log(this.serie["ranges"]);
    this.load.disabled = false;
  }

  previewDataset(dataset) {
    this.csvFirstRow = dataset.data[0];
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
      this.setLinkColumn(this.csvFirstRow, false) +
      "</select>\n" +
      "</div>\n" +
      "<div id='divDataColumn'>\n" +
      "<label id='labelSelectDataColumn' class='geostats-input-label-inline' for='SelectDataColumn'>Seleccione variable</label>\n" +
      "<select class='geostats-select' name='SelectDataColumn' id='SelectDataColumn'>\n" +
      this.setLinkColumn(this.csvFirstRow, false) +
      "</select>" +
      "</div>\n" +
      "</div>\n";
    M.dialog.info(html, "Previsualización archivo " + this.file.files[0].name);

    let csvHeaderValue = document.getElementById("csvHeader");
    let selectorLinkColumn = document.getElementById("SelectLinkColumn");
    let selectorDataColumn = document.getElementById("SelectDataColumn");

    selectorLinkColumn.addEventListener("change", () => {
      this.linkField = selectorLinkColumn.value.toString();
      let dataColumnOptions = document
        .getElementById("SelectDataColumn")
        .getElementsByTagName("option");
      for (var i = 0; i < dataColumnOptions.length; i++) {
        dataColumnOptions[i].value == this.linkField
          ? (dataColumnOptions[i].disabled = true)
          : (dataColumnOptions[i].disabled = false);
      }
    });
    selectorDataColumn.addEventListener("change", () => {
      this.dataField = selectorDataColumn.value.toString();
      let linkColumnOptions = document
        .getElementById("SelectLinkColumn")
        .getElementsByTagName("option");
      for (var i = 0; i < linkColumnOptions.length; i++) {
        linkColumnOptions[i].value == this.dataField
          ? (linkColumnOptions[i].disabled = true)
          : (linkColumnOptions[i].disabled = false);
      }
    });
    csvHeaderValue.addEventListener("change", () => {
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
        this.csvFirstRow,
        csvHeaderValue.checked
      );
      dataColumn.innerHTML = this.setLinkColumn(
        this.csvFirstRow,
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
    if (dataset.errors.length > 0) {
      this.renderDatasetErrors(dataset.errors);
    } else {
      let dataValue = [];
      let linkValue = [];
      this.renderDatasetMetadata(dataset);
      let y = 0;
      if (this.csv_header) {
        y = 1;
      }
      for (let i = y; i < dataset.data.length; i++) {
        let obj = dataset.data[i];
        dataValue.push(obj[this.dataField]);
        linkValue.push(obj[this.linkField]);
      }

      this.serie = new geostats(dataValue);
      //this.uValues = this.serie.getClassUniqueValues();
    }
  }

  renderDatasetMetadata(dataset) {
    let rowCount = dataset.data.length;
    let delimiter = dataset.meta.delimiter;
    let linebreak;
    if (dataset.meta.linebreak === "\r") {
      linebreak = "\\r";
    }
    if (dataset.meta.linebreak === "\n") {
      linebreak = "\\n";
    }
    if (dataset.meta.linebreak === "\r\n") {
      linebreak = "\\r\\n";
    }

    let linkColumn;
    let dataColumn;
    if (this.csv_header) {
      linkColumn = this.linkField;
      dataColumn = this.dataField;
    }
    if (!this.csv_header) {
      linkColumn = "columna " + (parseInt(this.linkField) + 1);
      dataColumn = "columna " + (parseInt(this.dataField) + 1);
    }

    let html =
      "<div>\n" +
      "<table class='table-container' width='100%' role='table' id='dataPreviewTable'>\n" +
      "<tbody>\n" +
      "<tr class='flex-table header' role='rowgroup'>\n" +
      "<td class='errorMessage flex-row first bold' role='cell'>Registros</td>" +
      "<td class='errorMessage flex-row' role='cell'>" +
      rowCount +
      "</td>\n" +
      "</tr>\n" +
      "<tr class='flex-table header' role='rowgroup'>\n" +
      "<td class='errorMessage flex-row first bold' role='cell'>Delimitador</td>" +
      "<td class='errorMessage flex-row' role='cell'>" +
      delimiter +
      "</td>\n" +
      "</tr>\n" +
      "<tr class='flex-table header' role='rowgroup'>\n" +
      "<td class='errorMessage flex-row first bold' role='cell'>Salto de linea</td>" +
      "<td class='errorMessage flex-row' role='cell'>" +
      linebreak +
      "</td>\n" +
      "</tr>\n" +
      "<tr class='flex-table header' role='rowgroup'>\n" +
      "<td class='errorMessage flex-row first bold' role='cell'>Campo de enlace</td>\n" +
      "<td class='errorMessage flex-row' role='cell'>\n" +
      linkColumn +
      "</td>\n" +
      "</tr>\n" +
      "<tr class='flex-table header' role='rowgroup'>\n" +
      "<td class='errorMessage flex-row first bold' role='cell'>Campo de datos</td>\n" +
      "<td class='errorMessage flex-row' role='cell'>\n" +
      dataColumn +
      "</td>\n" +
      "</tr>\n" +
      "</tbody>\n" +
      "</table>\n" +
      "</div>\n";
    M.dialog.success(
      html,
      "Archivo " + this.file.files[0].name + " cargado con éxito"
    );
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
    M.dialog.error(
      html,
      "Error al procesar el archivo " + this.file.files[0].name
    );
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
