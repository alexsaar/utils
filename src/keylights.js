#!/usr/bin/env node

const http = require('http');
const commander = require('commander');

commander
  .version('0.0.1', '-v, --version')
  .usage('[OPTIONS]...')
  .option('-o, --on <value>', 'Turn lights on/off.')
  .option('-u, --up <value>', 'Turn lights up by provided value.')
  .option('-d, --down <value>', 'Turn lights down by provided value.')
  .parse(process.argv);

const opts = commander.opts();

const data = { 'lights':[
    { 
        'brightness':10,
        'temperature':250,
        'on':1
    }],
    'numberOfLights':1
};

function setLightStatus(host, on, brightness) {
    on = (typeof opts.on === 'undefined') ? !on : Number(opts.on);
    brightness = (typeof opts.up === 'undefined') ? brightness : brightness + Number(opts.up);
    brightness = (typeof opts.down === 'undefined') ? brightness : brightness - Number(opts.down);

    data.lights[0].on = on;
    data.lights[0].brightness = brightness;

    const body = JSON.stringify(data);

    let req = http.request({
        host:host, port:9123, method:'PUT',
        path:'/elgato/lights', 
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(body)
        }}, (res) => {
            res.on('data', (chunk) => {
                console.log(`BODY: ${chunk}`);
            });
        });

    req.write(body);
    req.end();
}

function toggleLight(res) {
    let data = "";

    res.on("data", (chunk) => {
        data += chunk;
    });

    res.on("end", () => {
        try {
            const json = JSON.parse(data);
            setLightStatus(res.req.host, 
                json.lights[0].on,
                Number(json.lights[0].brightness));
        } catch (error) {
            console.error(error.message);
        };
    });
}

http.get('http://elgato-key-light:9123/elgato/lights', toggleLight);
http.get('http://elgato-key-light-air:9123/elgato/lights', toggleLight);
