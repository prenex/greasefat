// JS "enum" representing the state of the game
var GameState = Object.freeze({ "WAITING":1, "CAN_DRAW":2, "WAIT_FOR_DRAW":3,
				"CAN_PUT":4, "CAN_PUT_OR_LOSE":5, "WAIT_FOR_PUT":6, "WAIT_FOR_PUT_OR_LOSE_OR_WIN":7, "CAN_WIN":8})
// The variable that is holding the current game state
var currentState = GameState.WAITING;
var attacking = false; // true when we are attacker, false when defending
var previousState = null;

// Holds the current hand of the user (TODO: just prefilled with bogus data to see the structure)
//var hand = [{value:7, color:0}, {value:11, color:1}, {value:11, color:3}, {value:14, color:2}]
var hand = [null, null, null, null];
var FULL_HAND_COUNT = 4; // constant
// Holds the hand of the enemy - useful for handling reconnections...
var ehand = [null, null, null, null];
var eHandCount = 4;

// The cards currently down on the table
var down = [null, null, null, null, null, null, null, null];

// Holds the whole deck
var deck = [];

// The widht and heigth of the sprites
var cardWidth = 59;
var cardHeigth = 92;

// Extract the 'GET' parameters as an associative array - we need the player and the enemy
var params = GET.parameters();
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
		// Other player should see that I have joined the game...
		//COM.publish({cmd:"join", who:params.player});
		COM.publish(new CMD.Join(params.player));
	}
}

function newGameState() {
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

function newGame() {
	newGameState();
	updateGUI();
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
	// Handle messages by 'me' - those should not make any effect!
	if(msg.who == params.player){
		return;
	}

	// Handle messages according to the protocol of the game, first log it out.
	console.log("onMessage(..):");
	console.log(msg);
	if(msg.cmd == CMD.CMD_JOIN){
		// See if we are waiting for a player to come and got a join
		if(currentState == GameState.WAITING) {
			// Start a new game
			console.log("<" + msg.who + "> joined to the game!");
			console.log("player: " + params.player);
			console.log("enemy: " + params.enemy);
			newGame();
			console.log("A new game has been started - you can draw cards...");
			// And set the game state so that we can draw cards
			updateCurrentState(GameState.CAN_DRAW);
			// In this case we start as an attacker!
			attacking = true;
			// Notify other player about your game start
			COM.publish(new CMD.Started(params.player));
		} else {
			// TODO: fix issues because of re-connection ;-)
			console.log("ERROR: someone joined an already going game!");
		}
	}

	if(msg.cmd == CMD.CMD_STARTED){
		if(currentState == GameState.WAITING){
			// If we come here that means that the other has started the game
			// and then we should start our game too and wait for her to draw her cards
			newGame();
			updateCurrentState(GameState.WAIT_FOR_DRAW);
			// In this case we start as a defender!
			attacking = false;
		}
	}

	if(msg.cmd == CMD.CMD_DREW){
		if(currentState == GameState.WAIT_FOR_DRAW){
			// Handle the enemy drawing her cards
			eDrawCards(msg.cards);
			// Change state according to the earlier one
			if(previousState == GameState.CAN_DRAW){
				// If the previous local state was the can-draw
				// we have drawn the cards earlier then the enemy
				// in this case we update to the can-put state...
				// (message is her reaction to our drew...)
				updateCurrentState(GameState.CAN_PUT);
			}else{
				// otherwise the enemy had drawn earlier than us
				// And we can react to their drew by drawing our cards
				updateCurrentState(GameState.CAN_DRAW);
			}
		}
	}

	if(msg.cmd == CMD.CMD_PUT){
		if(currentState == GameState.WAIT_FOR_PUT || currentState == GameState.WAIT_FOR_PUT_OR_LOSE_OR_WIN){
			// Handle the enemy putting down a card of hers
			ePutDown(msg.card);
			if(attacking){
				//TODO: Check if we have won this battle here
				// and transition to CAN_WIN when it happened.

				// When we are an attacker and the defender has put
				// down her cards, then we can decide if we put down
				// more, just lose or if we are winning. The latest is 
				// decided by the game rules, but technically that is
				// also a state that this client should notify the 
				// other about (just like when we choose to lose).
				updateCurrentState(GameState.CAN_PUT_OR_LOSE);
			}else{
				// If we are defending we can put, but we cannot win/lose
				// we HAVE TO put a card and win/lose will be determined
				// by the other clients actions afterwards
				updateCurrentState(GameState.CAN_PUT);
			}
		}
	}
}

// Changes the game-state to the given one
// Method is extracted early so that later logic can came in (like state-checks, previous states etc.)
function updateCurrentState(nextState) {
	previousState = currentState;
	currentState = nextState;
	console.log("State has been changed from " + previousState + " to " + currentState);
	// TODO: show the user what she can do
}

// Draw for all possible positions
// TODO: Handle cases close to the end!
function drawCards() {
	if(currentState == GameState.CAN_DRAW){
		var drawnCards = [];
		console.log("drawcards");
		// Do the draw of the cards
		for(i = 0; i < 4; ++i){
			if(hand[i] == null){
				draw(i, hand);
				drawnCards.push(hand[i]);
			}
		}

		// Update game state according to the previous state
		if(previousState == GameState.WAIT_FOR_DRAW){
			// In case previously we were waiting for the other to draw theirs
			// now we should wait for them to put a card down (to keep order)
			updateCurrentState(GameState.WAIT_FOR_PUT);
		}else{
			// Otherwise we are the first who did draw cards
			// and we now have to wait until the other draws her cards.
			updateCurrentState(GameState.WAIT_FOR_DRAW);
		}

		// Send message about what we did draw
		// this is necessary to remove it from their deck
		COM.publish(new CMD.Drew(params.player, drawnCards));
	}else{
		console.log("Current state:" + currentState + " do not enable drawing cards.");
	}
}

// Draw a card to the given index of our hand
function draw(cardIndex, hand) {
	hand[cardIndex] = deck.pop();
}

// Removes the cards drawn by the enemy from the deck of our JS model.
// This is necessary as our deck should be in sync with theirs...
// TODO: This function has a side-effect on the "cards" parameter
// - it gets removed if adding is successful!
function eDrawCards(cards) {
	console.log("eDrawCards");
	// Filter deck to contain only those cards
	deck = deck.filter(function(deckCard){
		// for which every drawn card is different
		return cards.every(function(drawnCard){
			return (drawnCard.value != deckCard.value)
				&& (drawnCard.color != deckCard.color);
		});
	});

	// Add the cards to the local representation
	for(i = 0; i < 4; ++i){
		if(ehand[i] == null){
			ehand[i] = cards.pop();
		}
	}
}

// Helper function for validating rules of the game when putting cards
// Returns true if the card can be put down on "down" according
// to the rules of the game and the current state of the game.
function isValidPut(card){
	if(attacking){
		// The attacker should always put only when the rules enable her!
		if(down.length != 0){
			// In case there is something on the desk
			// she can put only a card with the same value (or seven!)
			downCard = down[down.length - 1];
			if(card.value == 7 || downCard.value == card.value){
				return true;
			}else{
				return false;
			}
		}else{
			// The attacker can put down anything when the length is zero
			// as that means he is putting down the first card in this battle
			return true;
		}
	}else{
		// The defender can always put anything she wants. She HAS to put...
		return true;
	}
}

// Puts down the given card from the hand if it is possible
// The function also updates GUI, state and send messages
function putDown(index){
	if(currentState == GameState.CAN_PUT || currentState == GameState.CAN_PUT_OR_LOSE){
		// Extract the selected card by the given index
		card = hand[index];

		// Check if the card can be put on the top of "down"
		if(isValidPut(card)){
			return;
		}

		// Put down the card from our hand
		down.push(card);
		hand[index] = null;
		updateGUI();

		if(attacking) {
			// After we have put down our card, we need
			// to wait for her to put down hers (when we attack)
			updateCurrentState(GameState.WAIT_FOR_PUT);
		}else{
			// Otherwise we wait until she put or lose or win
			// when we are a defender player. We have just reacted to
			// their attacking card right now with ours...
			updateCurrentState(GameState.WAIT_FOR_PUT_OR_LOSE_OR_WIN);
		}

		// Send the message that we have put down this card
		COM.publish(new CMD.Put(params.player, card));
	}else{
		console.log("Current state:" + currentState + " do not enable putting down cards.");
	}
}

// Should be called when we get to know that the enemy did put down
// a card. This puts it down and updates GUI
function ePutDown(card) {
	// Remove from eHand!!!
	for(i = 0; i < 4; ++i){
		// Search the element with the same value and color and make it null
		if(ehand[i] != null && ehand[i].value == card.value && ehand[i].color == card.color){
			ehand[i] = null;
		}
	}
	// "Remove" a card from the upper enemy cards
	--eHandCount;
	// push the given card down
	down.push(card);
	// update relevant things
	updateGUI();
}

// This method updates everything on the GUI
function updateGUI() {
	updateHand();
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
		//console.log("i.eHandCount:" + index + "." + eHandCount);
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
