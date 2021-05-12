import Geostats from 'facade/geostats';

const map = M.map({
  container: 'mapjs',
});

const mp = new Geostats();

map.addPlugin(mp);
