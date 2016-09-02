# greasefat
A javascript+html5 only implementation of the Hungarian card game "greasefat" alias "zsirozas".

Short description
-----------------

This is a 1v1 multiplayer implementation of a well known Hungarian game "Zsírozás" that is played with Hungarian cards ("Magyar kártya"). 
With that kind of deck a lot of unique games can be played but I have chosen this as my loved one liked it a lot too!

The game is written in pure javascript and html5 without having a service backend and uses pubnub for the communication.
The communication is stateless and can be changed to something else as it is separated from the code.

The architecture follows sheer simplicity.

How to play
-----------

1.) Open this link (or your installation link)
      http://ballmerpeak.web.elte.hu/greasefat/
2.) The short rules are written down on this page
3.) Enter your nickname and the nickname of your friend who will be your enemy
4.) Start playing and wait for your arranged partner to arrive in the room.

You can arrange the games through any media you wish: facebook, skype, telephone or using your mouth whatsoever!
If you want a rematch or a new game, just repeat from step 1 - it is that easy!

How to run your own server
--------------------------

1.) Clone the repository at a place where you can host the files
2.) Exchange the authentication values for pubnub so that it uses your free account (if everyone uses mine, no messages will be sent over time on both so don't do it for your own servers sake)
3.) The server is hosted

Added extra:
* It is very easy to see how the game starts after the lobby. It is just about going to / redirecting to the proper URL.
* This means, that you can make your own lobby application on top of this instead of using the simple lobby I provide. This is very easy and you can use whatever technologies you want for it even without touching any part of this code!
