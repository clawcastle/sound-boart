# sound-boart
Simple Discord bot for playing user-uploaded sounds via text commands.
To build and run locally, simply run docker build and provide the required parameters for connecting to Azure Blob Storage (for storing the .mp3 files) and potentially the credentials for the Google Drive API (only needed for the suggestion functionality).
Alternatively the project can also be run on node, by providing the required parameters through the process.env variable.
