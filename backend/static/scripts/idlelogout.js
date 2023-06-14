// Set the timeout duration (in milliseconds)
const TIMEOUT_DURATION = 10000; // 10 minutes

// Set the URL to redirect the user to after logging out
const LOGOUT_URL = "/login";

// Initialize the idle time variable
let idleTime = 0;

// Increment the idle time counter every minute
const idleInterval = setInterval(incrementIdleTime, 60000);

// Reset the idle time counter on user activity
document.addEventListener("mousemove", resetIdleTime);
document.addEventListener("keydown", resetIdleTime);

console.log("Idle logout script loaded");

// Function to increment the idle time counter
function incrementIdleTime() {
    idleTime += 1;
    if (idleTime >= TIMEOUT_DURATION / 60000) {
        logout();
    }
}

// Function to reset the idle time counter
function resetIdleTime() {
    idleTime = 0;
}

// Function to log out the user
function logout() {
    console.log("Logging out due to inactivity");
    clearInterval(idleInterval);
    fetch('/destroySession')
        .catch((error) => {
            // Handle the error here
            console.error('Error destroying session:', error);
        });

    window.location.href = LOGOUT_URL;
}
