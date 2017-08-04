var request = require('request');
var config = require('config');
var os = require('os');
var botToken = config.get('Telegram.bot.token');
var chatId = config.get('Telegram.bot.chat_id');
 
var TelegramBot = require('node-telegram-bot-api'),
    // Be sure to replace YOUR_BOT_TOKEN with your actual bot tokenon this line.
    telegram = new TelegramBot(botToken, { polling: true });

//getting the hostname of the server
var hostname = os.hostname();

// Gathering the IP address of the server //
var ifaces = os.networkInterfaces();
var ifacesDisplay = "";
Object.keys(ifaces).forEach(function (ifname) {
  var alias = 0;

  ifaces[ifname].forEach(function (iface) {
    if ('IPv4' !== iface.family || iface.internal !== false) {
      // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
      return;
    }

    if (alias >= 1) {
      // this single interface has multiple ipv4 addresses
      ifacesDisplay += "💻" + iface.address + "\n";
      console.log(ifname + ':' + alias, iface.address);
    } else {
      // this interface has only one ipv4 adress
      ifacesDisplay += "💻"+  iface.address + "\n";
      console.log(ifname, iface.address);
    }
    ++alias;
  });
});


var ngrokTunnels = {message: "", error: "", number: 0};

function getNgrokTunnels(tunnels){
   

 console.log("starting here"); 

    request('http://127.0.0.1:4042/api/tunnels/', function (error, response, body) {
       console.log('error:', error); // Print the error if one occurred
       console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received

       if( error && error.code =="ECONNREFUSED"){
          tunnels.message = "error: `" + error.code + "` - is ngrok running?";
          tunnels.error = error.code;
          return "err";
       }
       else{
          var result = JSON.parse(body);
       
          for(var t in result.tunnels) {
            console.log(result.tunnels[t].name +':'+ result.tunnels[t].public_url);
            tunnels.message += '🚆' + result.tunnels[t].name +' : '+ result.tunnels[t].public_url + "\n";
          }
       }
       return tunnels;
     });

    console.log("here are the debugged tunnels", tunnels);
}
// Send the initial Telegram payload on intialization //

//getNgrokTunnels(ngrokTunnels);

if(getNgrokTunnels(ngrokTunnels) != "err"){
   telegram.sendMessage(chatId, "*Ngrok Tunnels on *" + hostname +" \n" + ngrokTunnels.message + "\n" + "*IP addresses* \n" + ifacesDisplay,
           {
              parse_mode: "markdown"
           }
       );
}

// Begin processing Telegram events from the Bot //

telegram.on("text", (message) => {
  if(message.text.toLowerCase().indexOf("/ngrok") === 0){


  request('http://127.0.0.1:4042/api/tunnels/', function (error, response, body) {
    console.log('error:', error); // Print the error if one occurred
    console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
    //console.log('body:', body);

    // gathering os details about hostname
    var hostname = os.hostname();

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
       telegram.sendMessage(message.chat.id, "*Ngrok Tunnels on *" + hostname +" \n" + tunnel_text + "\n" + "*IP addresses* \n" + ifacesDisplay,
           {
              parse_mode: "markdown"
           }
           
           );
    }

    });
    
  }

});
