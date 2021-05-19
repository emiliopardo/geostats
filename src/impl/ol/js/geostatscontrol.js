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
}
