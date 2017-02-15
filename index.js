import express from 'express';
import nconf from 'nconf';
import middlewareManager from './config/middleware';
import routeManager from './config/routes';
import cluster from 'cluster'
import os from 'os'
import http from 'http'
import https from 'https'
import fs from 'fs'



const environment = process.env.ENVIRONMENT
const numCPUs = os.cpus().length;

if(cluster.isMaster){

  for( var i = 0; i < numCPUs; i++ ) {
    cluster.fork();
  }

  cluster.on( 'online', function( worker ) {
    console.log( 'Worker ' + worker.process.pid + ' is online.' );
  });

  cluster.on( 'exit', function( worker, code, signal ) {
    console.log( 'worker ' + worker.process.pid + ' died.' );
    cluster.fork();
  });

}else{
	const app = express();
	middlewareManager.handle(app);
	routeManager.handle(app);
  const server = http.createServer(app)
  // if(environment == 'development'){
  //   const server = http.createServer(app)
  // }else{
  //   const https_options = {
  //     key: fs.readFileSync(process.env.NODE_SSL_KEY),
  //     cert: fs.readFileSync(process.env.NODE_SSL_CERT),
  //     ca: fs.readFileSync(process.env.NODE_SSL_CERT)
  //   }
  //   const server = https.createServer(https_options, app)
  // }
	server.listen(nconf.get('port'), () => {
	    console.log('Ocr node listening: http://' + nconf.get('host') + ':' + nconf.get('port'));
	});
}