document.addEventListener("DOMContentLoaded", function () {
    // Get all elements with the class "genrebtn"
    const buttons = document.querySelectorAll(".genrebtn");

    // Add a click event listener to each genre button
    buttons.forEach(function (button) {
        button.addEventListener("click", function () {
            // Get the genre ID from the button's ID
            console.log("button clicked");
            const genreId = button.id;
            // Redirect to the /genreMovies route with the genre ID as a query parameter
            window.location.href = `/genreMovies?id=${genreId}`;
        });
    });
});
document.addEventListener("DOMContentLoaded", function () {
    // Get all elements with the class "genrebtn"
    const buttons = document.querySelectorAll(".m_id");

    // Add a click event listener to each genre button
    buttons.forEach(function (button) {
        button.addEventListener("click", function () {
            // Get the genre ID from the button's ID
            console.log("button clicked");
            const movieId = button.id;
            // Redirect to the /genreMovies route with the genre ID as a query parameter
            window.location.href = `/movie-details?id=${movieId}`;
        });
    });
});
document.addEventListener("DOMContentLoaded", function () {
    // Get all elements with the class "genrebtn"
    const buttons = document.querySelectorAll(".t_id");
    // Add a click event listener to each genre button
    buttons.forEach(function (button) {
        button.addEventListener("click", function () {
            // Get the genre ID from the button's ID
            console.log("button clicked");
            const tvId = button.id;
            // Redirect to the /genreMovies route with the genre ID as a query parameter
            window.location.href = `/tvShowsdetails?id=${tvId}`;
        });
    });
});
