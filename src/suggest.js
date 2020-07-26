const { google } = require("googleapis");
const { config } = require("./config");

const { googleDrive } = config;

const googleAuth = new google.auth.JWT(
  googleDrive.clientEmail,
  null,
  googleDrive.privateKey,
  googleDrive.scopes
);

exports.makeSuggestion = async (
  suggestionText,
  suggestedBy,
  onSucces = () => {},
  onError = (err) => {
    console.log(err);
  }
) => {
  try {
    const docsClient = google.docs({
      version: "v1",
      auth: googleAuth,
    });

    await docsClient.documents.batchUpdate({
      documentId: googleDrive.suggestionDocumentId,
      requestBody: {
        requests: [
          {
            insertText: {
              text: `${suggestedBy}: \n ${suggestionText} \n \n`,
              location: {
                index: 1,
              },
            },
          },
        ],
      },
    });

    onSucces();
  } catch (err) {
    onError(err);
    //print error message to user
  }
  //print success message to user
};
