// Holds the current hand of the user (TODO: just prefilled with bogus data to see the structure)
//var hand = [{value:7, color:0}, {value:11, color:1}, {value:11, color:3}, {value:14, color:2}]
var hand = [{value:7, color:0}, null, {value:11, color:3}, {value:14, color:2}]

// The widht and heigth of the sprites
var cardWidth = 59;
var cardHeigth = 92;

// Shuffle and array...
function shuffle(array) {
	var counter = array.length, temp, index;

	// While there are elements in the array
	while (counter > 0) {
		// Pick a random index
		index = Math.floor(Math.random() * counter);

		// Decrease counter by 1
		counter--;

		// And swap the last element with it
		temp = array[counter];
		array[counter] = array[index];
		array[index] = temp;
	}

	return array;
}

// Split the GET parameters into an assoc array
function transformToAssocArray( prmstr ) {
	var params = {};
	var prmarr = prmstr.split("&");
	for ( var i = 0; i < prmarr.length; i++) {
	var tmparr = prmarr[i].split("=");
	params[tmparr[0]] = tmparr[1];
	}
	return params;
}

// Helper function to get the search parameters
function getSearchParameters() {
	  var prmstr = window.location.search.substr(1);
	  return prmstr != null && prmstr != "" ? transformToAssocArray(prmstr) : {};
}

// Get the 'GET' parameters - we need the player and the enemy
var params = getSearchParameters();
console.log("player: " + params.player);
console.log("enemy: " + params.enemy);

// Create the name of the channel: This should be unique to players but the same on both sides...
var player1 = params.player < params.enemy ? params.player : params.enemy;
var player2 = params.player > params.enemy ? params.player : params.enemy;
var chName = "greasefat_" + player1 + "_" + player2;
console.log("channel: " + chName);

// Initialize the PUBNUB communication
var gametopic = PUBNUB.init({
	publish_key: 'pub-c-6036e039-6cec-46af-8961-389cc5ca156d',
	subscribe_key: 'sub-c-f5954296-c1c0-11e5-b684-02ee2ddab7fe'
});


// Called in the onLoad event of the body of the 1v1.html
function loaded(){

	// Subscribing to the game topic (communication channel)
	gametopic.subscribe({
		channel: chName,
		message: onMessage,
		connect: join
	});

	// Notification about joining the game called when connection is established
	function join() {
		// Other player should see that I have joined the game...
		publish({cmd:"join", who:params.player});
	}
}

// Helper function to publish messages on the channel
function publish(msg) {
	gametopic.publish({
		channel: chName,
		message: msg
	});
}

// The main onMessage event handler function for the game topic
function onMessage(msg) {
	// TODO: Handle messages according to the protocol of the game!
	console.log(msg);
}

// This function is used to update the hand of the player:
// - The hand array will be used to change css sprites!
function updateHand(){
	$("div#hand div.card").each(function(index){
		var card = hand[index];
		if(card != null) {
			// If the card is not null, show the proper sprite
			// (and re-enable display:block)
			var y = card.color * cardHeigth;
			var x = (14 - card.value) * cardWidth;
			var pos = -x + "px " + y + "px";
			console.log(pos);
			// TODO: update the card
			$(this).css({
				"display":"block",
				"background-position":pos,
			});
		} else {
			// If the card is null, we should not show it!
			$(this).css({
				"display":"none",
			});
		}
	});
}
