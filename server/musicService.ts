export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  coverUrl: string;
  audioUrl: string;
  durationSeconds: number;
  genre: string;
}

export interface Artist {
  id: string;
  name: string;
  genre: string;
  artistUrl?: string;
  imageUrl?: string;
}

export interface Album {
  id: string;
  title: string;
  artist: string;
  coverUrl: string;
  releaseYear: string;
  trackCount: number;
}

// Clean application-owned fallback relaxation & ambient catalogue
const fallbackTracks: Track[] = [
  {
    id: 'demo_track_1',
    title: 'Weightless Serenade',
    artist: 'MindRelax Sound Lab',
    album: 'Peaceful Sanctuary',
    coverUrl: 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&w=600&q=80',
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=meditation-piano-112221.mp3',
    durationSeconds: 180,
    genre: 'Ambient Relaxation'
  },
  {
    id: 'demo_track_2',
    title: 'Gentle Rain on Cedar Leaves',
    artist: 'Nature Calm Sessions',
    album: 'Rainfall Serenity',
    coverUrl: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?auto=format&fit=crop&w=600&q=80',
    audioUrl: 'https://cdn.pixabay.com/download/audio/2021/08/09/audio_884988e40f.mp3?filename=rain-and-thunder-nature-sounds-7803.mp3',
    durationSeconds: 240,
    genre: 'Nature Sounds'
  },
  {
    id: 'demo_track_3',
    title: 'Deep Ocean Mind Waves',
    artist: 'Acoustic Calm',
    album: 'Tidal Meditation',
    coverUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80',
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=ocean-waves-ambient-110241.mp3',
    durationSeconds: 300,
    genre: 'Ocean & Waves'
  },
  {
    id: 'demo_track_4',
    title: 'Peaceful Lofi Night Reflection',
    artist: 'Lofi Chill Sanctuary',
    album: 'Midnight Study Sessions',
    coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80',
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/10/14/audio_9939f1c798.mp3?filename=lofi-study-112191.mp3',
    durationSeconds: 210,
    genre: 'Lofi Focus'
  },
  {
    id: 'demo_track_5',
    title: 'Forest Breeze Resonance',
    artist: 'Mindful Harmony',
    album: 'Woodland Peace',
    coverUrl: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=600&q=80',
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8710899.mp3?filename=soft-relaxing-piano-10700.mp3',
    durationSeconds: 200,
    genre: 'Ambient Piano'
  }
];

export class MusicService {
  /**
   * Search for tracks using the free public provider with fallback
   */
  async searchTracks(query: string, options: { limit?: number; genre?: string } = {}): Promise<Track[]> {
    const limit = options.limit || 20;
    const searchTerm = query && query.trim() ? query.trim() : 'relax meditation acoustic';

    try {
      const url = `https://itunes.apple.com/search?term=${encodeURIComponent(searchTerm)}&media=music&entity=song&limit=${limit}`;
      const res = await fetch(url, { headers: { 'Accept': 'application/json' } });

      if (!res.ok) {
        throw new Error(`Public music API error: ${res.statusText}`);
      }

      const data = await res.json();
      if (data.results && Array.isArray(data.results) && data.results.length > 0) {
        const tracks: Track[] = data.results
          .filter((item: any) => item.trackId && item.trackName)
          .map((item: any) => ({
            id: String(item.trackId),
            title: item.trackName,
            artist: item.artistName || 'Unknown Artist',
            album: item.collectionName || 'Single',
            coverUrl: item.artworkUrl100 ? item.artworkUrl100.replace('100x100bb', '600x600bb') : 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80',
            audioUrl: item.previewUrl || '',
            durationSeconds: Math.round((item.trackTimeMillis || 180000) / 1000),
            genre: item.primaryGenreName || 'Relaxation'
          }));

        if (tracks.length > 0) {
          return tracks;
        }
      }
    } catch (err) {
      console.warn('MusicService searchTracks fetch failed or returned empty, using application fallback:', err);
    }

    // Fallback to local application-owned catalogue
    if (query) {
      const q = query.toLowerCase();
      const filtered = fallbackTracks.filter(
        t => t.title.toLowerCase().includes(q) || t.artist.toLowerCase().includes(q) || t.genre.toLowerCase().includes(q)
      );
      if (filtered.length > 0) return filtered;
    }

    return fallbackTracks;
  }

  /**
   * Search for artists
   */
  async searchArtists(query: string, options: { limit?: number } = {}): Promise<Artist[]> {
    const limit = options.limit || 10;
    const searchTerm = query && query.trim() ? query.trim() : 'meditation ambient';

    try {
      const url = `https://itunes.apple.com/search?term=${encodeURIComponent(searchTerm)}&media=music&entity=musicArtist&limit=${limit}`;
      const res = await fetch(url, { headers: { 'Accept': 'application/json' } });

      if (res.ok) {
        const data = await res.json();
        if (data.results && Array.isArray(data.results) && data.results.length > 0) {
          return data.results.map((item: any) => ({
            id: String(item.artistId),
            name: item.artistName,
            genre: item.primaryGenreName || 'Music',
            artistUrl: item.artistLinkUrl || ''
          }));
        }
      }
    } catch (err) {
      console.warn('MusicService searchArtists fetch failed:', err);
    }

    // Fallback artists
    return [
      { id: 'art_1', name: 'MindRelax Sound Lab', genre: 'Ambient Relaxation' },
      { id: 'art_2', name: 'Nature Calm Sessions', genre: 'Nature Sounds' },
      { id: 'art_3', name: 'Acoustic Calm', genre: 'Acoustic Meditation' },
      { id: 'art_4', name: 'Lofi Chill Sanctuary', genre: 'Lofi Focus' }
    ];
  }

  /**
   * Search for albums
   */
  async searchAlbums(query: string, options: { limit?: number } = {}): Promise<Album[]> {
    const limit = options.limit || 10;
    const searchTerm = query && query.trim() ? query.trim() : 'relax acoustic';

    try {
      const url = `https://itunes.apple.com/search?term=${encodeURIComponent(searchTerm)}&media=music&entity=album&limit=${limit}`;
      const res = await fetch(url, { headers: { 'Accept': 'application/json' } });

      if (res.ok) {
        const data = await res.json();
        if (data.results && Array.isArray(data.results) && data.results.length > 0) {
          return data.results.map((item: any) => ({
            id: String(item.collectionId),
            title: item.collectionName,
            artist: item.artistName,
            coverUrl: item.artworkUrl100 ? item.artworkUrl100.replace('100x100bb', '600x600bb') : '',
            releaseYear: item.releaseDate ? item.releaseDate.substring(0, 4) : '2024',
            trackCount: item.trackCount || 10
          }));
        }
      }
    } catch (err) {
      console.warn('MusicService searchAlbums fetch failed:', err);
    }

    return [
      { id: 'alb_1', title: 'Peaceful Sanctuary', artist: 'MindRelax Sound Lab', coverUrl: 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&w=600&q=80', releaseYear: '2024', trackCount: 12 },
      { id: 'alb_2', title: 'Rainfall Serenity', artist: 'Nature Calm Sessions', coverUrl: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?auto=format&fit=crop&w=600&q=80', releaseYear: '2024', trackCount: 8 }
    ];
  }

  /**
   * Get a single track by ID
   */
  async getTrack(id: string): Promise<Track | null> {
    const local = fallbackTracks.find(t => t.id === id);
    if (local) return local;

    try {
      const url = `https://itunes.apple.com/lookup?id=${id}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data.results && data.results[0]) {
          const item = data.results[0];
          return {
            id: String(item.trackId),
            title: item.trackName,
            artist: item.artistName || 'Unknown Artist',
            album: item.collectionName || 'Single',
            coverUrl: item.artworkUrl100 ? item.artworkUrl100.replace('100x100bb', '600x600bb') : 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80',
            audioUrl: item.previewUrl || '',
            durationSeconds: Math.round((item.trackTimeMillis || 180000) / 1000),
            genre: item.primaryGenreName || 'Relaxation'
          };
        }
      }
    } catch (err) {
      console.warn(`MusicService getTrack failed for id ${id}:`, err);
    }

    return fallbackTracks[0];
  }

  /**
   * Get artist details
   */
  async getArtist(id: string): Promise<Artist | null> {
    try {
      const url = `https://itunes.apple.com/lookup?id=${id}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data.results && data.results[0]) {
          const item = data.results[0];
          return {
            id: String(item.artistId),
            name: item.artistName,
            genre: item.primaryGenreName || 'Music',
            artistUrl: item.artistLinkUrl || ''
          };
        }
      }
    } catch (err) {
      console.warn(`MusicService getArtist failed for id ${id}:`, err);
    }
    return { id, name: 'MindRelax Artist', genre: 'Ambient' };
  }

  /**
   * Get album details
   */
  async getAlbum(id: string): Promise<Album | null> {
    try {
      const url = `https://itunes.apple.com/lookup?id=${id}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data.results && data.results[0]) {
          const item = data.results[0];
          return {
            id: String(item.collectionId),
            title: item.collectionName,
            artist: item.artistName,
            coverUrl: item.artworkUrl100 ? item.artworkUrl100.replace('100x100bb', '600x600bb') : '',
            releaseYear: item.releaseDate ? item.releaseDate.substring(0, 4) : '2024',
            trackCount: item.trackCount || 10
          };
        }
      }
    } catch (err) {
      console.warn(`MusicService getAlbum failed for id ${id}:`, err);
    }
    return { id, title: 'Relaxing Album', artist: 'MindRelax Sound Lab', coverUrl: '', releaseYear: '2024', trackCount: 10 };
  }
}

export const musicService = new MusicService();
