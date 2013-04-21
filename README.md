Jukebox Pi
==

Transform your Raspberry Pi into a cool Jukebox Pi.

Instructions
-

You may edit server.js to change default port (8888) and media location (/media/KEY).
Just point it to a folder on a flash drive or networks containing MP3s browse to http://10.10.0.45:8888 to select the first song.
And the party begins !!!

See setup.sh for step-by-step SSH commands (default user:password - pi:raspberry).

For convenience, use a VNC client. Connect to 10.10.0.45:1 (where 10.10.0.45 is your Raspberry's IP).


What if I want more features?
-

You may try Jukebox (written in Python). But it is SLOW on Raspberry and buggy!

You'll need an application on FB for the authentication of Jukebox visitors.
Be sure to activate "Website login with FaceBook" and set the URL (host and port) exacly as you'll configure it later.
https://developers.facebook.com/apps/

Based on the guide:
http://ziade.org/2012/07/01/a-raspberry-pi-juke-box-how-to/

Powered by:
https://github.com/lociii/jukebox
