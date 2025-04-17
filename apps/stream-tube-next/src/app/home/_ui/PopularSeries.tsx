import PopularMedias from "~/app/_ui/PopularMedias";
import StremioService from "~/server/api/routers/stremio/stremIoServices";

async function PopularSeries() {
  const popularSeries = await StremioService.getPopularSeries();
  return <PopularMedias items={popularSeries} heading="Popular Series" />;
}

export default PopularSeries;
