// 通信， 和 tab 页之间通信， 不是多个 js 之间
chrome.runtime.onMessage.addListener(
  function (request, sender, sendResponse) {
    console.log(sender.tab ?
      "from a content script:" + sender.tab.url :
      "from the extension");
    if (request.greeting === "hello")
      sendResponse({
        farewell: "goodbye"
      });
  }
)