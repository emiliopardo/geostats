import Geostats from 'facade/geostats';

const map = M.map({
  container: 'mapjs',
  controls: ['panzoombar','scale','location','layerswitcher','mouse']
});

const mp = new Geostats('parametro 1');
map.addPlugin(mp);

const add = new M.plugin.AddLayers();
map.addPlugin(add);


