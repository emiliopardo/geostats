/* eslint-disable no-console */

/**
 * @module M/impl/control/GeostatsControl
 */
export default class GeostatsControl extends M.impl.Control {
  /**
   * This function adds the control to the specified map
   *
   * @public
   * @function
   * @param {M.Map} map to add the plugin
   * @param {HTMLElement} html of the plugin
   * @api stable
   */
  addTo(map, html) {
    this.facadeMap = map;
    // super addTo - don't delete
    super.addTo(map, html);
  }

  activate() {
    M.dialog.info("Cargo Datos");
  }

  // Ocurre al desactivar
  deactivate() {
    M.dialog.info("Bye World!");
  }

  loadMVT(layerName, url_service) {
    return new Promise((resolve) => {
      const layer = new M.layer.MVT({
        url: url_service,
        name: layerName,
        projection: "EPSG:3857",
      });
       
      this.facadeMap.addLayers(layer);
      resolve(layer);
    });
  }
}
