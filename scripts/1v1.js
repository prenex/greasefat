// Holds the current hand of the user (TODO: just prefilled with bogus data to see the structure)
//var hand = [{value:7, color:0}, {value:11, color:1}, {value:11, color:3}, {value:14, color:2}]
var hand = [null, null, null, null];
var FULL_HAND_COUNT = 4; // constant
// Holds the hand of the enemy - useful for 
var ehand = [null, null, null, null];
var eHandCount = 4;

var down = [{value:7, color:0}, {value:14, color:0}, null, null, null, null, null, {value:8, color:2}];

// Holds the whole deck
var deck = [];

// The widht and heigth of the sprites
var cardWidth = 59;
var cardHeigth = 92;

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

// Called in the onLoad event of the body of the 1v1.html
function loaded(){

	// Subscribing to the game topic (communication channel)
	COM.subscribe({
		channel: chName,
		message: onMessage,
		connect: join
	});

	// Notification about joining the game called when connection is established
	function join() {
		// The game state should be reseted
		resetGame();
		// Other player should see that I have joined the game...
		//COM.publish({cmd:"join", who:params.player});
		console.log(new CMD.Join(params.player));
		COM.publish(new CMD.Join(params.player));
	}
}

function resetGame() {
        // Remove cards from the hand
        for(i = 0; i < 4; ++i){
                hand[i] = null;
        }   
        // Reset the deck
        deck = []; 
        // Create a shuffled deck of 32 cards
        createShuffledDeck();
        // Reset the cards down on the table
        down = []; 
}

function createShuffledDeck() {
        // Go over all the four colors
        for(c = 0; c < 4; ++c) {
                // With all the 7..14 values each
                for(v = 7; v < 15; ++v) {
                        // and create a card representation
                        deck.push({value:v, color:c});
                }   
        }   
        // After the deck is created, shuffle all the cards
        shuffle(deck);
}

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

// The main onMessage event handler function for the game topic
function onMessage(msg) {
	// TODO: Handle messages according to the protocol of the game!
	console.log(msg);

	if(msg.cmd == CMD.CMD_JOIN){
		console.log("<" + msg.who + "> joined to the game!");
		console.log("player: " + params.player);
		console.log("enemy: " + params.enemy);
	}
}

// Draw for all possible positions
// TODO: Handle cases close to the end!
function drawCards() {
	console.log("drawcards");
	for(i = 0; i < 4; ++i){
		if(hand[i] == null){
			draw(i);
		}
	}
}

// Draw a card to the given index of our hand
function draw(cardIndex) {
	hand[cardIndex] = deck.pop();
}

// Removes the cards drawn by the enemy from the deck of our JS model.
// This is necessary as our deck should be in sync with theirs...
function eDrawCards(cards) {
// TODO: Add to eHand
	console.log("eDrawCards");
	// Filter deck to contain only those cards
	deck = deck.filter(function(deckCard){
		// for which every drawn card is different
		return cards.every(function(drawnCard){
			return (drawnCard.value != deckCard.value)
				&& (drawnCard.color != deckCard.color);
		});
	});
}

// Puts down the given card from the hand
// The function also updated the hand and the down
function putDown(index){
	card = hand[index];
	down.push(card);
	hand[index] = null;
	updateHand();
	updateDown();
}

// Should be called when we get to know that the enemy did put down
// a card. This puts it down, updates down and also gets the card
function ePutDown(card) {
// TODO: Remove from eHand!!!
	// "Remove" a card from the upper enemy cards
	--eHandCount;
	// push the given card down
	down.push(card);
	// update relevant things
	updateEHand();
	updateDown();
}

// This function is used to update the hand of the player:
// - The hand array will be used to change css sprites!
function updateHand() {
	$("div#hand div.card").each(function(index){
		var card = hand[index];
		updateDivCardWith($(this), card);
	});
}

// Updates the enemy hand according to eHandCount
function updateEHand() {
	$("div#ehand div.ecard").each(function(index){
		console.log("i.eHandCount:" + index + "." + eHandCount);
		if(index < eHandCount){
			$(this).css({"display":"block"});
		} else{
			$(this).css({"display":"none"});
		}
	});
}

function updateDown() {
	$("div#down div.card").each(function(index){
		var card = down[index];
		console.log(card);
		updateDivCardWith($(this), card);
	});
}

function updateDivCardWith(div, card) {
	if(card != null) {
		// If the card is not null, show the proper sprite
		// (and re-enable display:block)
		var y = card.color * cardHeigth;
		var x = (14 - card.value) * cardWidth;
		var pos = -x + "px " + y + "px";
		console.log(pos);
		// TODO: update the card
		div.css({
			"display":"block",
			"background-position":pos,
		});
	} else {
		// If the card is null, we should not show it!
		div.css({
			"display":"none",
		});
	}
}

// Prints cards of the given array onto the JS console...
// For ex.: printCards(hand);
function printCards(cards){
	for(i = 0; i < cards.length; ++i) {
		console.log("(" + cards[i].value + ", " + cards[i].color + ")");
	}
}
