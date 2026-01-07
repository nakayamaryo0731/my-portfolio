import { createSignal, onMount, onCleanup } from "solid-js";

interface SpotifyData {
  isPlaying: boolean;
  title?: string;
  artist?: string;
  album?: string;
  albumImageUrl?: string;
  songUrl?: string;
}

const SpotifyPlayer = () => {
  const [data, setData] = createSignal<SpotifyData | null>(null);
  const [loading, setLoading] = createSignal(true);

  let interval: ReturnType<typeof setInterval>;

  const fetchSpotify = async () => {
    try {
      const res = await fetch("/api/spotify");
      const json = await res.json();
      setData(json);
    } catch (e) {
      console.error("Failed to fetch Spotify data", e);
    } finally {
      setLoading(false);
    }
  };

  onMount(() => {
    fetchSpotify();
    interval = setInterval(fetchSpotify, 30000); // Refresh every 30s
  });

  onCleanup(() => {
    clearInterval(interval);
  });

  return (
    <div class="flex items-center gap-3 h-full">
      {loading() ? (
        <div class="text-gray-400 text-sm">Loading...</div>
      ) : data()?.title ? (
        <>
          {data()?.albumImageUrl && (
            <a href={data()?.songUrl} target="_blank" rel="noopener noreferrer">
              <img
                src={data()?.albumImageUrl}
                alt={data()?.album}
                class="w-12 h-12 rounded shadow-lg"
              />
            </a>
          )}
          <div class="flex flex-col min-w-0 flex-1">
            <a
              href={data()?.songUrl}
              target="_blank"
              rel="noopener noreferrer"
              class="text-white text-sm font-medium truncate hover:underline"
            >
              {data()?.title}
            </a>
            <span class="text-gray-400 text-xs truncate">{data()?.artist}</span>
            <div class="flex items-center gap-1 mt-1">
              {data()?.isPlaying ? (
                <>
                  <span class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  <span class="text-green-500 text-xs">Now playing</span>
                </>
              ) : (
                <span class="text-gray-500 text-xs">Recently played</span>
              )}
            </div>
          </div>
        </>
      ) : (
        <div class="text-gray-400 text-sm">Not listening to anything</div>
      )}
    </div>
  );
};

export default SpotifyPlayer;
