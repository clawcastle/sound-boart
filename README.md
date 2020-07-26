# aoe-taunt-bot
Simple Discord bot for playing Age of Empires 2 taunt sounds in a voice channel.
To build and run locally, simply use:

docker build -t {IMAGE NAME} --build-arg token={YOUR DISCORD BOT TOKEN} .  
docker run {IMAGE_NAME}  

Or to run on Node, use (from the base directory):  
SET BOT_TOKEN={YOUR DISCORD BOT TOKEN}  
node ./src/main.js  
