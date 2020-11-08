'use strict';
 
const functions = require('firebase-functions');
const {WebhookClient} = require('dialogflow-fulfillment');
const {Card, Suggestion} = require('dialogflow-fulfillment');
const axios=require("axios");
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey("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");
 
process.env.DEBUG = 'dialogflow:debug'; // enables lib debugging statements
 
exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {
  const agent = new WebhookClient({ request, response });
	
  function crearTramite(agent){
    let email=agent.parameters["email"];
  	let DNI=agent.parameters["DNI"];
    let Nombres=agent.parameters["Nombres"];
    let Apellidos=agent.parameters["Apellidos"];
    let Archivo=agent.parameters["Archivo"];
    let NroSeguimiento=Date.now();
    let Estado="PENDIENTE";
    axios.post("https://sheet.best/api/sheets/d3dcf808-5f26-448d-ab13-3b23f8a5b08e",{DNI,Nombres,Apellidos,Archivo,NroSeguimiento,Estado});
    const msg = {
  to: email, // Change to your recipient
  from: 'victorjuanjf@jfbots.com',
  templateId:"d-5d968c5f54fd49a8ad9400be5b05583a",
  dynamic_template_data:{DNI,Nombres,Apellidos,Archivo,NroSeguimiento}
				};
	sgMail.send(msg);
    
    agent.add("Tu trámite fue registrado exitosamente ... ");
    agent.add("Tu número de seguimento del trámite es: "+NroSeguimiento);
  }
  
  async function consultarTramite(agent){
  	let NroSeguimiento=agent.parameters["NroSeguimiento"];
    let respuesta=await axios.get("https://sheet.best/api/sheets/d3dcf808-5f26-448d-ab13-3b23f8a5b08e/NroSeguimiento/"+NroSeguimiento);
  	let tramites=respuesta.data;
    if(tramites.length>0){
    	let tramite=tramites[0];
      	agent.add("El estado de tu trámite es: "+tramite.Estado);
    } else {
    agent.add("El número de seguimiento que colocaste no existe ...");
    }  
  }
  
  let intentMap = new Map();
  intentMap.set('Tramites.crear', crearTramite);
  intentMap.set('Tramites.consultar', consultarTramite);
  agent.handleRequest(intentMap);
});