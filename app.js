const express = require("express");
const https = require("https");
const bodyParser = require("body-parser");
const app = express();
const ejs = require("ejs");
const dotenv = require("dotenv");
const path = require("path");
const { clear } = require("console");
dotenv.config();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
const apiKey = process.env.API_KEY;
const queryResults = []; // Initialize an empty array

app.get("/", function (req, res) {
    res.sendFile(__dirname + "/index.html");
});


app.post("/", function (req, res) {
    // Clear the queryResults array before storing new results
    queryResults.length = 0;
    const role = req.body.searchType;
    const query = req.body.movieName;
    const url = `https://api.themoviedb.org/3/search/${role}?query=${query}&api_key=${apiKey}`;
    const page = role == "movie" ? "movie-results" : "tv-results" ;
    https.get(url, function (response) {
        console.log(response.statusCode);
        let data = "";
        response.on("data", function (chunk) {
            data += chunk;
        });
        response.on("end", function () {
            const ourD = JSON.parse(data);
            if (ourD.results.length > 0) {
                console.log(ourD);
                // Push all query results into the queryResults array
                ourD.results.forEach((result) => {
                    queryResults.push({
                        tv_title : result.original_name,
                        title: result.original_title,
                        overview: result.overview,
                        logo: result.poster_path,
                        movie_id :result.id,
                        tv_id : result.id
                    });
                });
                // Render the results EJS template with the queryResults array
                res.render(page, { queryResults });
            } else {
                res.render("movie-not-found");
            }
        });
    });
});

//detailed info about movie

app.get("/movie-details", function (req, res) {
    const movieId = req.query.id;
    const apiUrl = `https://api.themoviedb.org/3/movie/${movieId}?api_key=${apiKey}`;
    https.get(apiUrl, function (response) {
        let data = "";
        response.on("data", function (chunk) {
            data += chunk;
        });

        response.on("end", function () {
            const movieDetails = JSON.parse(data);
            console.log("Movie ID:", movieId); // Add this line to check the movieId value
            // Render a page with movie details (e.g., using an EJS template)
            res.render("movie-details", { movieDetails });
        });
    });
});

app.get("/tvShowsdetails", function (req, res) {
    const tvId = req.query.id;
    const apiUrl =`https://api.themoviedb.org/3/tv/${tvId}?api_key=${apiKey}`;

    https.get(apiUrl, function (response) {
        let data = "";
        response.on("data", function (chunk) {
            data += chunk;
        });

        response.on("end", function () {
            const tvDetails = JSON.parse(data);
            res.render("tv-show-detail", { tvDetails });
        });
    });
});
// code for top 100 mmovies
app.get('/top100movies', async (req, res) => {
    const totalPages = 5; // Adjust the number of pages as needed to get 100 movies

    // Function to make an API request and return a promise
    const makeApiRequest = (page) => {
        return new Promise((resolve, reject) => {
            const apiUrl =`https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}&page=${page}`;
            https.get(apiUrl, (response) => {
                let data = '';
                response.on('data', (chunk) => {
                    data += chunk;
                });
                response.on('end', () => {
                    try {
                        const movieData = JSON.parse(data);
                        resolve(movieData.results);
                    } catch (error) {
                        reject(error);
                    }
                });
            }).on('error', (error) => {
                reject(error);
            });
        });
    };

    // Use Promise.all to wait for all requests to finish
    try {
        const requests = Array.from({ length: totalPages }, (_, page) => makeApiRequest(page + 1));
        const results = await Promise.all(requests);

        // Flatten the array of results and take the first 100 movies
        const top100Movies = results.flat().slice(0, 100);

        res.render('top-movies', { top100Movies });
    } catch (error) {
        console.error('Error making API request:', error);
        res.status(500).send('Internal Server Error');
    }
});


//tvShows --
app.get('/tvShows', (req, res) => {
    const totalPages = 5; // Adjust the number of pages as needed to get 100 movies
    // Create an array to store movie results
    const top100tvShows = [];
    // Make requests to the /movie/popular endpoint for each page
    for (let page = 1; page <= totalPages; page++) {
        const apiUrl = `https://api.themoviedb.org/3/tv/popular?api_key=${apiKey}&page=${page}`;
        https.get(apiUrl, (response) => {
            let data = '';
            response.on('data', (chunk) => {
                data += chunk;
            });

            response.on('end', () => {
                try {
                    const tvData = JSON.parse(data);
                    // Add the movie results from this page to the top100Movies array
                    top100tvShows.push(...tvData.results);
                    // If we have collected 100 movies, render the page
                    if (top100tvShows.length >= 100) {
                        res.render('top-tvShows', { top100tvShows });
                    }
                } catch (error) {
                    console.error('Error parsing JSON:', error);
                    res.status(500).send('Internal Server Error');
                }
            });
        }).on('error', (error) => {
            console.error('Error making API request:', error);
            res.status(500).send('Internal Server Error');
        });
    }
});

app.get('/genreMovies', (req, res) => {
    const genreId = req.query.id; // Get the genre ID from the query parameter

    // Construct the URL to fetch movies of the specified genre
    const apiUrl = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&sort_by=popularity.desc&with_genres=${genreId}`;

    // Make an API request to get genre-specific movies
    https.get(apiUrl, (response) => {
        let data = '';

        response.on('data', (chunk) => {
            data += chunk;
        });

        response.on('end', () => {
            try {
                const genreData = JSON.parse(data);

                // Render a new page with genre-specific movie data
                res.render('genre-movies', { genreMovies: genreData.results });
            } catch (error) {
                console.error('Error parsing JSON:', error);
                res.status(500).send('Internal Server Error');
            }
        });
    }).on('error', (error) => {
        console.error('Error making API request:', error);
        res.status(500).send('Internal Server Error');
    });
});

app.get('/aboutus', (req, res) => {
    res.render('aboutus');

});

app.get('/genreTv', (req, res) => {
    const genreId = req.query.id; // Get the genre ID from the query parameter
    // Construct the URL to fetch movies of the specified genre
    const apiUrl =`https://api.themoviedb.org/3/discover/tv?api_key=${apiKey}&sort_by=popularity.desc&with_genres=${genreId}`;

    // Make an API request to get genre-specific movies
    https.get(apiUrl, (response) => {
        let data = '';

        response.on('data', (chunk) => {
            data += chunk;
        });

        response.on('end', () => {
            try {
                const tvgenreData = JSON.parse(data);

                // Render a new page with genre-specific movie data
                res.render('genreTv', { genreTv: tvgenreData.results });
            } catch (error) {
                console.error('Error parsing JSON:', error);
                res.status(500).send('Internal Server Error');
            }
        });
    }).on('error', (error) => {
        console.error('Error making API request:', error);
        res.status(500).send('Internal Server Error');
    });
});
app.listen(3000, function () {
    console.log("Server is up and running on port 3000");
});