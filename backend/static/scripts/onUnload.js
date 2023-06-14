console.log("Included onUnload.js sucessfully");
window.onbeforeunload = function () {
    fetch('/destroySession')
        .catch((error) => {
            // Handle the error here
            console.error('Error destroying session:', error);
        });

};