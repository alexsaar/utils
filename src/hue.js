#!/usr/bin/env node

require('dotenv').config();

const axios = require('axios');
const commander = require('commander');

commander
  .version('0.0.1', '-v, --version')
  .usage('[OPTIONS]...')
  .option('-o, --on <value>', 'Turn lights on/off.')
  .option('-l, --lights <value...>', 'Name of lights to turn on.')
  .parse(process.argv);

const opts = commander.opts();

const url = `http://${process.env.HUE_BRIDGE}/api/${process.env.HUE_USER}/lights/`;

const getLights = async () => {
    try {
        return axios.get(url);
    } catch (err) {
        console.error(err);
    }
};

const toggleLight = async (lights, on) => {
    const status = await getLights();
    
    for (const [id, light] of Object.entries(status.data)) {
        lights.forEach(function(lName){
            if (light.name == lName) {
                on = (typeof on === 'undefined') ? !light.state.on : Boolean(Number(on));
                try {
                    return axios.put(url + `${id}/state`, { on });
                } catch (err) {
                    console.error(err);
                }
            }
        });
    }
};

toggleLight(opts.lights, opts.on);
