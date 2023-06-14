console.log("Included onUnload.js sucessfully");
window.onbeforeunload = function () {
    fetch('/destroySession');
};