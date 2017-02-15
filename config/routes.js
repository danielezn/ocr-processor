import express from 'express';
import baseManager from './base';
import nconf from 'nconf';
import PATH from 'path';
import bodyParser from 'body-parser';
// import redis from 'redis'
import Converter from '../models/converter'


// const ocrClient = redis.createClient()
// ocrClient.subscribe('ocr-request')

const ROOT = '../';
const defaultConfig = PATH.resolve(__dirname, ROOT, 'config/default.json');
nconf.argv().env().file({file: defaultConfig}).defaults({ENV: 'development'});

// ocrClient.on('message', function(channel, mention){});

const routeManager = Object.assign({}, baseManager, {
    configureDevelopmentEnv(app) {
        const api = this.handlerApiRouter();
        app.use( bodyParser.json() );
        app.use(bodyParser.urlencoded({
          extended: true
        }));
        app.use('/api', api);
        app.use('/download', express.static('files'));
    },
    handlerApiRouter(app) {
        const router = express.Router();
        router.post('/recognize-text', (req, res) => {
            let converter = new Converter()
            const document_url = converter.processDocument(req.headers.host, req.body.document_url, req.body.callback_url)
            res.json({status: 'process', document_url: document_url})
        });
        return router;
    },
});

export default routeManager;