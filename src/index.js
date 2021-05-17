import M$plugin$Geostats from '/home/epardo/estudiando/geostats/src/facade/js/geostats';
import M$control$GeostatsControl from '/home/epardo/estudiando/geostats/src/facade/js/geostatscontrol';
import M$impl$control$GeostatsControl from '/home/epardo/estudiando/geostats/src/impl/ol/js/geostatscontrol';

if (!window.M.plugin) window.M.plugin = {};
if (!window.M.control) window.M.control = {};
if (!window.M.impl) window.M.impl = {};
if (!window.M.impl.control) window.M.impl.control = {};
window.M.plugin.Geostats = M$plugin$Geostats;
window.M.control.GeostatsControl = M$control$GeostatsControl;
window.M.impl.control.GeostatsControl = M$impl$control$GeostatsControl;
