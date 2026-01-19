import movie1 from "@/assets/posters/movie-1.jpg";
import movie2 from "@/assets/posters/movie-2.jpg";
import movie3 from "@/assets/posters/movie-3.jpg";
import movie4 from "@/assets/posters/movie-4.jpg";
import movie5 from "@/assets/posters/movie-5.jpg";
import series1 from "@/assets/posters/series-1.jpg";
import series2 from "@/assets/posters/series-2.jpg";
import series3 from "@/assets/posters/series-3.jpg";
import series4 from "@/assets/posters/series-4.jpg";
import series5 from "@/assets/posters/series-5.jpg";

export interface MediaItem {
  id: number;
  title: string;
  rating: number;
  poster: string;
  year: string;
}

export const topMovies: MediaItem[] = [
  { id: 1, title: "Movie Title 1", rating: 0.0, poster: movie1, year: "Year" },
  { id: 2, title: "Movie Title 2", rating: 0.0, poster: movie2, year: "Year" },
  { id: 3, title: "Movie Title 3", rating: 0.0, poster: movie3, year: "Year" },
  { id: 4, title: "Movie Title 4", rating: 0.0, poster: movie4, year: "Year" },
  { id: 5, title: "Movie Title 5", rating: 0.0, poster: movie5, year: "Year" },
  { id: 6, title: "Movie Title 6", rating: 0.0, poster: movie3, year: "Year" },
  { id: 7, title: "Movie Title 7", rating: 0.0, poster: movie2, year: "Year" },
  { id: 8, title: "Movie Title 8", rating: 0.0, poster: movie1, year: "Year" },
  { id: 9, title: "Movie Title 9", rating: 0.0, poster: movie4, year: "Year" },
  { id: 10, title: "Movie Title 10", rating: 0.0, poster: movie5, year: "Year" },
];

export const topSeries: MediaItem[] = [
  { id: 1, title: "TV Series Title 1", rating: 0.0, poster: series1, year: "Year" },
  { id: 2, title: "TV Series Title 2", rating: 0.0, poster: series2, year: "Year" },
  { id: 3, title: "TV Series Title 3", rating: 0.0, poster: series3, year: "Year" },
  { id: 4, title: "TV Series Title 4", rating: 0.0, poster: series4, year: "Year" },
  { id: 5, title: "TV Series Title 5", rating: 0.0, poster: series5, year: "Year" },
  { id: 6, title: "TV Series Title 6", rating: 0.0, poster: series1, year: "Year" },
  { id: 7, title: "TV Series Title 7", rating: 0.0, poster: series2, year: "Year" },
  { id: 8, title: "TV Series Title 8", rating: 0.0, poster: series3, year: "Year" },
  { id: 9, title: "TV Series Title 9", rating: 0.0, poster: series4, year: "Year" },
  { id: 10, title: "TV Series Title 10", rating: 0.0, poster: series5, year: "Year" },
];
