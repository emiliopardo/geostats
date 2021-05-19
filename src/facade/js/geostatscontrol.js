/* eslint-disable no-console */
/**
 * @module M/control/GeostatsControl
 */

import GeostatsImplControl from "impl/geostatscontrol";
import template from "templates/geostats";
import Papa from "papaparse";

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
    this.json = null;
    this.mvt = null;

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
    this.selector = html.querySelector("select#SelectCapa");
    this.file = html.querySelector("input#SelectedFile");
    this.load = html.querySelector("button#loadButton");

    this.selector.addEventListener("change", (evt) =>
      this.setServiceURL(evt, this.selector.value)
    );
    this.file.addEventListener("change", (evt) =>
      this.setCSVFile(evt, this.file.value)
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
          this.renderDataset(results);
        },
      });
      this.load.disabled = false;
    }
  }

  setServiceURL(evt, url) {
    this.service_url = url;
    const estilo =new M.style.Polygon({
      fill: {
        color: "green",
      },
      stroke: {
        color: "#fff",
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

      this.mvt.setStyle(estilo);

      this.map_.addLayers(this.mvt);
    }

    this.mvt.on(M.evt.LOAD,(evt)=>{
      alert("se cargo la capa");
    })
    this.file.disabled = false;
  }

  loadLayer() {
    this.activate();
  }

  renderDataset(dataset) {
    this.json = JSON.stringify(dataset, null, 2);
    console.log(this.json);
  }
}
