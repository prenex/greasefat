// Minimal publish-subscribe communications modul
// just wanted to put all these at a place so that
// it can be exchanged later easily if pubnub dies
//
// Rem.: Currently needs pubnub

// Function that builds the module and returns the built object
var COM = (function(){
	// This is the module itself we are building
	var COM = {};

	// Initialize the PUBNUB communication
	var gametopic = PUBNUB.init({
		publish_key: 'pub-c-6036e039-6cec-46af-8961-389cc5ca156d',
		subscribe_key: 'sub-c-f5954296-c1c0-11e5-b684-02ee2ddab7fe'
	});
	var chName;


	// Subscribing to the communication channel
	COM.subscribe = function(desc){
		// Save the channel name
		chName = desc.channel;
		// And just use pubnub
		gametopic.subscribe({
			channel: desc.channel,
			message: desc.message,
			connect: desc.connect
		});
	};

	// Publishing a message over the channel
	COM.publish = function(msg){
		console.log("publish: " + msg);
		// Just use pubnub with the saved channel name
		gametopic.publish({
			channel: chName,
			message: msg
		});
	};

	// Return the created module
	return COM;
}());
