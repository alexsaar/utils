const http = require('http');
const commander = require('commander');

commander
  .version('0.0.1', '-v, --version')
  .usage('[OPTIONS]...')
  .option('-o, --on <value>', 'Turn lights on/off.')
  .parse(process.argv);

const opts = commander.opts();

function setLightStatus(host, on) {
    on = (typeof opts.on === 'undefined') ? !on : Number(opts.on);
    
    const data = { 'lights':[
        { 
            'brightness':10,
            'temperature':250,
            'on':on 
        }],
        'numberOfLights':1
    };
    const body = JSON.stringify(data);

    let req = http.request({
        host:host, 
        port:9123, 
        path:'/elgato/lights', 
        method:'PUT',
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
            setLightStatus(res.req.host, JSON.parse(data).lights[0].on);
        } catch (error) {
            console.error(error.message);
        };
    });
}

http.get('http://elgato-key-light:9123/elgato/lights', toggleLight);
http.get('http://elgato-key-light-air:9123/elgato/lights', toggleLight);
