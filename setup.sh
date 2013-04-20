# Install dependencies
sudo apt-get update
sudo apt-get install tightvncserver
sudo apt-get install alsa-utils ntpdate mpg123

# Replace "1360x700" with your favorite resolution
vncserver -geometry 1360x700 :1

# By default the sound is not activated, and once activated it plays via the HDMI port
sudo modprobe snd_bcm2835
sudo amixer cset numid=3 1

# Install Raspberry DJ ===============================================================================
sudo apt-get install node-js

# Run when ready to rock'n'roll
node server.js

# Install Jukebox ====================================================================================
sudo apt-get install python-virtualenv libshout3 libshout3-dev pkg-config python-dev
sudo pip install virtualenv
virtualenv --no-site-packages jukebox
cd jukebox
bin/pip install jukebox
bin/jukebox jukebox_setup
bin/jukebox syncdb

# Run when ready to rock'n'roll
bin/jukebox jukebox_mpg123 --start

# Replace 10.10.0.45 with your hostname
bin/jukebox runserver 10.10.0.45:10080

# Replace "KEY" with your USB dongle name
bin/jukebox jukebox_index --path=/media/KEY

# There is a daemon to watch the music directory for changes and add them to the library
bin/jukebox jukebox_watch --path=/media/KEY