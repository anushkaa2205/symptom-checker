document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("token");

    if (!token) {
        alert("You must login first");
        window.location.href = "/login";
        return;
    }

    console.log("User is authenticated");
});