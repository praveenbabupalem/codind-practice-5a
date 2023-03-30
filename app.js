const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "moviesData.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();
module.exports = app;

//All Movie Names API-1
app.get("/movies/", async (request, response) => {
  const getMovieNamesQuery = `
    SELECT
     movie_name
    FROM 
     movie;
    `;
  const convertToCamel = (dbObject) => {
    return {
      movieName: dbObject.movie_name,
    };
  };

  const allMovieNamesArray = await db.all(getMovieNamesQuery);

  const result = allMovieNamesArray.map((eachMovie) =>
    convertToCamel(eachMovie)
  );
  response.send(result);
});

//Add a movie API
app.post("/movies/", async (request, response) => {
  const movieData = request.body;
  const { directorId, movieName, leadActor } = movieData;
  const addMovieQuery = `
   INSERT INTO 
   movie (director_id, movie_name, lead_actor)
   VALUES ('${directorId}', '${movieName}', '${leadActor}');
  `;
  await db.run(addMovieQuery);
  response.send("Movie Successfully Added");
});

// Get a Movie Details API
app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieDetailsQuery = `
    SELECT * FROM movie WHERE movie_id = ${movieId};
    `;
  const movieDetails = await db.get(getMovieDetailsQuery);
  const movieDetailsCamel = {
    movieId: movieDetails.movie_id,
    directorId: movieDetails.director_id,
    movieName: movieDetails.movie_name,
    leadActor: movieDetails.lead_actor,
  };
  response.send(movieDetailsCamel);
});

//Update a movie API
app.put("/movies/:movieId", async (request, response) => {
  const { movieId } = request.params;
  const { directorId, movieName, leadActor } = request.body;
  const updateMovieQuery = `
  UPDATE movie
  SET 
    director_id = '${directorId}',
    movie_name = '${movieName}',
    lead_actor = '${leadActor}'
    WHERE movie_id = '${movieId}';
    
  `;
  await db.run(updateMovieQuery);
  response.send("Movie Details Updated");
});

//Delete a Movie API
app.delete("/movies/:movieId", async (request, response) => {
  const { movieId } = request.params;
  const removeAMovieQuery = `
    DELETE FROM movie WHERE movie_id = '${movieId}';
    `;
  await db.run(removeAMovieQuery);
  response.send("Movie Removed");
});

//Get all Directors API
app.get("/directors/", async (request, response) => {
  const getAllDirectorsQuery = `
    SELECT * FROM director;
    `;
  const convertToCamel = (dbObject) => {
    return {
      directorId: dbObject.director_id,
      directorName: dbObject.director_name,
    };
  };

  const allDirectorsArray = await db.all(getAllDirectorsQuery);
  response.send(
    allDirectorsArray.map((eachDirector) => convertToCamel(eachDirector))
  );
});

//Get all Movies of a DireDirector API
app.get("directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const moviesOfADirectorQuery = `
    SELECT movie_name 
    FROM movie 
    WHERE 
      movie.director_id = '${directorId}';
    `;
  const allMoviesOfADirector = await db.all(moviesOfADirectorQuery);
  const convertToCamel = (dbObject) => {
    return {
      movieName: dbObject.movie_name,
    };
  };
  response.send(
    allMoviesOfADirector.map((eachMovie) => convertToCamel(eachMovie))
  );
});

////////
app.get("/movies//", async (request, response) => {
  const getMovieNamesQuery = `
    SELECT
     *
    FROM 
     movie;
    `;
  const allMovieNamesArray = await db.all(getMovieNamesQuery);
  response.send(allMovieNamesArray);
});
