/* eslint-disable no-console */
/**
 * @module M/control/GeostatsControl
 */

import GeostatsImplControl from "impl/geostatscontrol";
import template from "templates/geostats";
import templateDatasetErrors from "templates/templateDatasetErrors";
import templateDatasetMetadata from "templates/templateDatasetMetadata";
import templateDatasetInfo from "templates/templateDatasetInfo";
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
    this.parseResults = html.querySelector("div#parseResults");
    this.legend = html.querySelector("div#legend");
    this.selectorCapa.addEventListener("change", () =>
      this.setServiceURL(this.selectorCapa.value)
    );
    this.file.addEventListener("change", () =>
      this.preLoadCSVFile(this.file.value)
    );
    this.csvLoadButton.addEventListener("click", () =>
      this.loadCSVFile(this.file.value)
    );
    this.selectorMetodo.addEventListener("change", () =>
      this.setMetodo(this.selectorMetodo.value)
    );
    this.load.addEventListener("click", () => this.loadLayer());
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

  preLoadCSVFile(file) {
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

  loadCSVFile(file) {
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

  setServiceURL(url) {
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

  setMetodo(metodo) {
    let nbClass = 5;
    let colors = chroma
      .scale("YlGnBu")
      .domain([this.serie.min(), this.serie.max()], nbClass)
      .colors();
    switch (metodo) {
      case "quantile":
        this.uValues = this.serie.getClassQuantile(nbClass);
        break;
      case "uniqueValues":
        this.uValues = this.serie.getClassUniqueValues(nbClass);
        for (let index = 0; index < this.uValues.length; index++) {
          colors.push(chroma.random().hex());
        }
        break;
      case "equalsIntervals":
        this.uValues = this.serie.getClassEqInterval(nbClass);
        break;
      case "standarDesviation":
        this.uValues = this.serie.getClassStdDeviation(nbClass);
        break;
      case "arithmeticProgression":
        this.uValues = this.serie.getClassArithmeticProgression(nbClass);
        break;
      case "geometricProgression":
        this.uValues = this.serie.getClassEqInterval(nbClass);
        break;
      case "naturalBreaksJenks":
        this.uValues = this.serie.getClassJenks(nbClass);
        break;
      default:
        break;
    }
    this.serie.setColors(colors);
    this.legend.innerHTML = this.serie.getHtmlLegend(colors, "Leyenda", 0);
    this.load.disabled = false;
  }

  previewDataset(dataset) {
    this.csvFirstRow = dataset.data[0];
    let firstRow = "";
    let html =
      "<div>\n" +
      "<table class='table-container geostats-font-small' width='100%' role='table' id='dataPreviewTable'>\n" +
      "<tbody>\n";
    for (let y = 0; y < dataset.data.length; y++) {
      html +=
        "<tr class='flex-table header' role='rowgroup'>\n" +
        "<td class='geostats-td flex-row first' role='cell'>" +
        (y + 1) +
        "</td>\n" +
        "<td class='geostats-td flex-row' role='cell'>\n" +
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

    // let data=[]
    // for (let z = 0; z < columns.length; z++) {
    //   if (header) {
    //     data.push(columns[z]);
    //   } else {
    //     data.push("columna "+(z+1));
    //   }
    // }
    // console.log(data);
    return html;
  }

  parseDataset(dataset) {
    if (dataset.errors.length > 0) {
      this.renderDatasetErrors(dataset.errors);
    } else {
      this.dataValue = [];
      this.linkValue = [];
      this.renderDatasetMetadata(dataset);
      let y = 0;
      if (this.csv_header) {
        y = 1;
      }
      for (let i = y; i < dataset.data.length; i++) {
        let obj = dataset.data[i];
        this.dataValue.push(obj[this.dataField]);
        this.linkValue.push(obj[this.linkField]);
      }

      this.serie = new geostats(this.dataValue);
      this.renderDataSetInfo();
    }
  }

  renderDataSetInfo() {
    let templateVars = {
      vars: {
        min: this.serie.min(),
        max: this.serie.max(),
        mean: this.serie.mean(),
        median: this.serie.median(),
        variance: this.serie.variance(),
        cov: this.serie.cov(),
        stddev: this.serie.stddev()
      },
    }; 
    let html = M.template.compileSync(templateDatasetInfo, templateVars);
    this.parseResults.innerHTML = html.outerHTML;
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
      rowCount = dataset.data.length - 1;
      linkColumn = this.linkField;
      dataColumn = this.dataField;
    }
    if (!this.csv_header) {
      linkColumn = "columna " + (parseInt(this.linkField) + 1);
      dataColumn = "columna " + (parseInt(this.dataField) + 1);
    }

    let templateVars = {
      vars: {
        rowCount: rowCount,
        delimiter: delimiter,
        linebreak: linebreak,
        linkColumn: linkColumn,
        dataColumn: dataColumn,
      },
    };
    let html = M.template.compileSync(templateDatasetMetadata, templateVars);
    let htmlMetadataTable = html.outerHTML;
    M.dialog.success(
      htmlMetadataTable,
      "Archivo " + this.file.files[0].name + " cargado con éxito"
    );
  }

  renderDatasetErrors(datasetErrorsMessage) {
    let templateVars = { vars: { datasetErrors: datasetErrorsMessage } };
    let html = M.template.compileSync(templateDatasetErrors, templateVars);
    let htmlErrorTable = html.outerHTML;
    M.dialog.error(
      htmlErrorTable,
      "Error al procesar el archivo " + this.file.files[0].name
    );
  }

  loadLayer() {
    let selectedMethod = this.selectorMetodo.value;
    let color = this.serie.colors;
    let serie = this.serie;
    let linkValue = this.linkValue;
    let dataValue = this.dataValue;
    this.mvt.applyStyle_(
      new M.style.Polygon({
        fill: {
          color: (feature) => {
            let feature_id = feature.getAttribute("codsecc");
            let indexLinkValue = linkValue.indexOf(parseInt(feature_id));

            let selectedColor = null;

            if (indexLinkValue != -1 && selectedMethod != "uniqueValues") {
              selectedColor =
                color[serie.getRangeNum(dataValue[indexLinkValue])];
            }

            if (indexLinkValue != -1 && selectedMethod == "uniqueValues") {
              let bounds = serie.bounds;
              let value = dataValue[indexLinkValue];
              let indexBounds = bounds.indexOf(value);
              selectedColor = color[indexBounds];
            }
            // console.log(
            //   "feature_id: " +
            //     feature_id +
            //     " esta en posición linkValue: " +
            //     indexLinkValue +
            //     " valor: " +
            //     dataValue[indexLinkValue] +
            //     " color: " +
            //     selectedColor
            // );
            return selectedColor;
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