// Contains the communication commands

// Function that builds the module and returns the built object
var CMD = (function(){
	// This is the module itself we are building
	var CMD = {};

	CMD.CMD_CMD = "cmd";
	CMD.CMD_JOIN = "join";

	// "Base class"
	CMD.Cmd = function(){
		this.cmd = CMD.CMD_CMD;
	}

	// Join class of communication commands
	CMD.Join = function(who) {
		// Properties
		this.cmd = CMD.CMD_JOIN;
		this.who = who;
	}

	// Return the created module
	return CMD;
}());
