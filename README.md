# Sound-boart

Sound-boart is a discord bot that allows you to upload short sound clips and playing them in your Discord channel. It also contains features such as listing and categorising these sounds, and setting a sound that will play whenever you join a voice channel.

All sounds uploaded only exist in the context of the Discord server you upload them within. This means that you cannot play a sound that is only uploaded on Server1 when in a voice channel belonging to Server2.

If you want to add sound-boart to your Discord server, use the following link: https://discord.com/api/oauth2/authorize?client_id=682259204790157375&permissions=36711680&scope=bot

# How to use the bot

Below is a list explaining the different commands available.

## Play sound

Plays a sound by the name specified if it exists. Use like this: $\<sound-name\>. Can also be used to play multiple sound consecutively (at most 3), like this: ```$<sound_name1> <sound_name2> <sound_name3>```

## Upload sound

Uploads a sound to the server. The sound can then be referenced and played by the name you specify in this command (not the name of the file you upload). The file should be sent as an attachment to the message you send with the upload command. The current size limit is 5MB. Mind that only .mp3 files are valid. Use like this: ```$up <sound-name>```

## Rename sound

Renames a sound. Use like this: ```$rename <sound-name> <new-sound-name>```

## Delete sound

Deletes a sound. Use like this: ```$delete <sound-name>```

## List sounds

Lists all sounds available for the server. Use like this: ```$list```

## Search for sounds

Searches for sounds containing the given query string. Use like this: ```$find <query_string>```

## Set greeting sound

Sets the sound to be played when you join a voice channel. Use like this: ```$set-greet <sound-name>```

## Remove greeting sound

Clears your greeting sound if you have specified one (does not delete the sound itself). Use this this: ```$remove-greet```

## Tag sound

Tags a sound with a name. Can be used for categorizing sounds so they can easily be found. Use like this: ```$tag <sound-name> <tag-name>```

## Rename tag

Renames a tag. Use like this: ```$rename-tag <tag-name> <new-tag-name>```

## Delete tag

Deletes a tag (not the sounds within the tag). Use like this: ```$delete <tag-name>```

## List tags

Lists all tags. Use like this: ```$tags```

## List sounds with specific tag

Lists all sounds tagged with a specific tag. Use like this: ```$tagged <tag-name>```

# Running the bot yourself

Running the bot yourself is pretty simple. First, clone the repo by writing `git clone git@github.com:sunero4/sound-boart.git` in a terminal or using your git client of choice.

Then, rename the _sampleConfig.ts_ file to _config.ts_ and replace the relevant values for your Discord bot token and the directories to store data.

After this, assuming you have installed node.js on your machine, it should be as simple as running the following commands:

- ```npm install```.
- ```npm run build``` to run the Typescript compiler.
- `node ./dist/app.js` (or `npm start` assuming you have nodemon installed) and the bot should be up and running.

Alternatively, if you have Docker and ```docker-compose``` installed, you can simply run ```docker-compose up```. Make sure to specify the sounds and settings directories to match the path used for the volume in the ```docker-compose.yml``` file (at least if you wish to persist the data).
