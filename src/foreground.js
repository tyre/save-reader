import Readability from "readability";

browser.runtime.onMessage.addListener(request => {
  console.log("Received message: ", request)
  // If the message is not from our background script, don't do anything.
  // It's a felony to open other people's mail!
  if (request.from != "save-reader") {
    return;
  }

  // Clone the current document for processing. If we don't do this, it will
  // alter the current DOM tree. We don't want to switch to readability mode
  // in the browser.
  var documentClone = document.cloneNode(true);
  var readability = new Readability(documentClone);
  var readableDocument= readability.parse();

  readableDocument.url = window.location.href;

  // Return the parsed document to the sender of the message.
  return Promise.resolve({
    from: "save-reader",
    message: "parsed-document",
    document: readableDocument
  });
});
