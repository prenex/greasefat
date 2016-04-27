// Contains the communication commands

// Function that builds the module and returns the built object
var CMD = (function(){
	// This is the module itself we are building
	var CMD = {};

	// Command differentiators
	CMD.CMD_CMD = "cmd";
	CMD.CMD_JOIN = "join";
	CMD.CMD_STARTED = "started";
	CMD.CMD_DREW = "drew";
	CMD.CMD_PUT = "put";
	CMD.CMD_LOSE = "lose";
	CMD.CMD_WIN = "win";

	// "Base class"
	CMD.Cmd = function(){
		this.cmd = CMD.CMD_CMD;
	}

	// Someone has joined the game channel
	CMD.Join = function(who) {
		// Properties
		this.cmd = CMD.CMD_JOIN;
		this.who = who;
	}

	// Someone has started the game (he is now at drawing cards)
	// We should start a game too and wait until he draws his cards
	CMD.Started = function(who) {
		// Properties
		this.cmd = CMD.CMD_STARTED;
		this.who = who;
	}

	// The other player drew up cards
	CMD.Drew = function(who, cards) {
		// Properties
		this.cmd = CMD.CMD_DREW;
		this.who = who;
		this.cards = cards;
	}

	// The other player has put down a card
	CMD.Put = function(who, card) {
		// Properties
		this.cmd = CMD.CMD_PUT;
		this.who = who;
		this.card = card;
	}

	// The other player has chosen to lose this battle
	CMD.Lose = function(who) {
		// Properties
		this.cmd = CMD.CMD_LOSE;
		this.who = who;
	}

	// The other player has won this battle according to the rules
	CMD.Win = function(who, isGameEnded, isLastSevenStrike) {
		// Properties
		this.cmd = CMD.CMD_WIN;
		this.who = who;
		this.isGameEnded = isGameEnded;
		this.isLastSevenStrike = isLastSevenStrike;
	}

	// Return the created module
	return CMD;
}());
