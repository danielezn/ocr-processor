import fs from 'fs'
import request from 'request'
import crypto from 'crypto'
import pdf_extract from 'pdf-extract';

const ROOT = 'files'
const options = {type: 'ocr'}

class Converter {

	generateRandomUuid(){
		return crypto.randomBytes(Math.ceil(20/2)).toString('hex').slice(0,20);
	}

	processDocument(host, document_url, callback_url){
		var self = this
		const document_name = this.generateRandomUuid();
		const document_file = document_name + '.pdf'
		const document_folder = ROOT + '/' + document_name
		const document_path = document_folder + '/' + document_file
		fs.mkdir(document_folder)
		var pdf_file = fs.createWriteStream(document_path)
		request.get(document_url)
			   .pipe(pdf_file);
		pdf_file.on('finish', function(){
			self.ocrProcess(document_path, callback_url, self.responseCallback);
		})
		return host + '/download/' + document_name + '/' + document_name + '.pdf'
	}

	responseCallback(document_path, callback_url, message){
		request.post(callback_url, {status: message, document_url: document_path});
	}

	ocrProcess(document_path, callback_url, callback){
		var processor = pdf_extract(document_path, options, function(err) {
		  if (err) {
		    return err;
		  }
		});
		processor.on('complete', function(data) {
		  callback(document_path, callback_url, 'completed');
		});
		processor.on('error', function(err) {
		  callback(document_path, callback_url, 'error');
		});
	}
}

export default Converter;