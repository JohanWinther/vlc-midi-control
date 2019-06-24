var JZZ = require('jzz');
var config = require("./config.json");
var request = require('request');
var exec = require('child_process').exec;

function createRequestURL(command) {
  let url = 'http://:' + config.vlc.password + '@' + config.vlc.server +'/requests/playlist.json';
  url += command ? `?command=${command}`:'';
  return url
}

function playVideo(id) {
  request.get({url:createRequestURL(), json:true}, function (e, r, playlist) {
    if (playlist) {
      if (playlist.children[0].children[id]) {
        let vidID = playlist.children[0].children[id].id;
        request.get(createRequestURL(`pl_play&id=${vidID}`));
      } else {
        console.warn(`There is no video #${id+1}!`);
      }
    } else {
      console.error('VLC is not running!');
    }
  });
}

// Open VLC playlist
exec(config.vlc.playlist);
request.get(createRequestURL('pl_pause'));

// Listen for MIDI events
JZZ().or('Cannot start MIDI engine!')
.openMidiIn(config.midi.port).or('Cannot open MIDI port named: '+config.midi.port)
.connect(function(event){
  let channel = event["0"]-191;
  let program = event["1"];
  console.log(`Channel: ${channel}, Program Bank: ${program}`);
  if (1<=channel && channel<=16) {
    let value = 128*(channel-1) + program;
    console.log(`Parsing as video #${value+1}`);
    playVideo(value);
  }
}).and('Everything is up and running! Waiting for input..');