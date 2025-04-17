import PopularMedias from "~/app/_ui/PopularMedias";
import StremioService from "~/server/api/routers/stremio/stremIoServices";

async function PopularMovies() {
  const popularMovies = await StremioService.getPopularMovies();
  return <PopularMedias items={popularMovies} heading="Popular Movies" />;
}

export default PopularMovies;
