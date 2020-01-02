browser.browserAction.onClicked.addListener(toolbarOnClickListener);

async function toolbarOnClickListener() {
  console.log("toolbarOnClickListener");
  // First, query for the active tab
  const activeTabs = await browser.tabs.query({
    currentWindow: true,
    active: true
  })

  console.log({ activeTabs })

  // The query returns an array of tabs. Since there can only be one active
  // tab in the current window, we take the first one.
  const currentActiveTab = activeTabs[0];

  // Load the foreground content script. This will inject the message
  // listener.
  const responseFromScript = await browser.tabs.executeScript({
      file: `/dist/foreground.js`
  });

  console.log({responseFromScript});

  // Once the foreground script is loaded, send it a message to parse the
  // document using Readability, then await its response.
  sendMessageToContentScript(currentActiveTab);
}

// Handle a response to a message posted to the foreground script. Make sure
// it is from us and take action based on the message.
async function receiveForegroundResponse(response) {
  console.log("receiveForegroundResponse");
  if (response.from != "save-reader") {
    return;
  }

  if (response.message == "parsed-document") {
    await uploadDocumentToServer(response.document);
  }
}

// Send the active tab a message to parse the current document
async function sendMessageToContentScript(currentActiveTab) {
  console.log("sendMessageToContentScript");
  const response = await browser.tabs.sendMessage(
    currentActiveTab.id,
    {
      from: "save-reader",
      message: "parse"
    }
  );
  receiveForegroundResponse(response);
}

// Send the document to the server for saving/processing. Log as appropriate.
async function uploadDocumentToServer(readableDocument) {
  console.log("uploadDocumentToServer");
  await fetch('http://localhost:8000/stories/', {
    method: 'POST', // or 'PUT'
    headers: {
      'Content-Type': 'application/json',
    },
    body: readableDocumentAsJson(readableDocument),
  })
  .then((response) => response.json())
  .then((data) => {
    console.log('Successfully posted readable story to server:', data);
  })
  .catch((error) => {
    console.error('Error posting readable story to server:', error);
  });
}

// Convert from the `Readability` format to our API format.
function readableDocumentAsJson(readableDocument) {
  return JSON.stringify({
    title: readableDocument.title,
    byline: readableDocument.byline,
    content: readableDocument.content,
    dir: readableDocument.dir,
    excerpt: readableDocument.excerpt,
    text_content: readableDocument.textContent,
    length: readableDocument.length,
    url: readableDocument.url,
  })
}
