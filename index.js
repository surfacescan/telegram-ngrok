var request = require('request');
var config = require('config');
var botToken = config.get('Telegram.bot.token');

var TelegramBot = require('node-telegram-bot-api'),
    // Be sure to replace YOUR_BOT_TOKEN with your actual bot tokenon this line.
    telegram = new TelegramBot(botToken, { polling: true });

telegram.on("text", (message) => {
  if(message.text.toLowerCase().indexOf("/ngrok") === 0){


  request('http://127.0.0.1:4042/api/tunnels/', function (error, response, body) {
    console.log('error:', error); // Print the error if one occurred
    console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
    //console.log('body:', body);

    var result = JSON.parse(body);
    var tunnel_text = "";
    for(var t in result.tunnels) {
         console.log(result.tunnels[t].name +':'+ result.tunnels[t].public_url);
    }
    for(var t in result.tunnels) {
         tunnel_text += '🚆' + result.tunnels[t].name +' : '+ result.tunnels[t].public_url + "\n";
    }

 
    if( error && error.code =="ECONNREFUSED"){
       telegram.sendMessage(message.chat.id, "error: `" + error.code + "` - ngrok running?",
           {
             parse_mode: "markdown" 
           }
           
           );
    }
    else{
       telegram.sendMessage(message.chat.id, "*Ngrok Tunnels* \n" + tunnel_text,
           {
              parse_mode: "markdown"
           }
           
           );
    }

    });
    
  }

});
