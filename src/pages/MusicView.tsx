import React, { useState, useEffect, useRef } from 'react';
import { Music, Volume2, VolumeX, Play, Pause, Clock, CloudRain, Trees, Waves, Wind, Disc, Search, Loader2, User, Library, Radio } from 'lucide-react';
import { api } from '../services/api';

interface SoundTrack {
  id: string;
  name: string;
  category: string;
  description: string;
  icon: any;
  synthType: 'rain' | 'ocean' | 'forest' | 'wind' | 'chimes' | 'lofi';
}

interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  album: string;
  coverUrl: string;
  audioUrl: string;
  durationSeconds: number;
  genre: string;
}

interface ArtistItem {
  id: string;
  name: string;
  genre: string;
  artistUrl?: string;
}

interface AlbumItem {
  id: string;
  title: string;
  artist: string;
  coverUrl: string;
  releaseYear: string;
  trackCount: number;
}

export const MusicView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'ambient' | 'tracks' | 'artists' | 'albums'>('ambient');

  // Ambient sound tracks
  const [activeAmbientId, setActiveAmbientId] = useState<string>('rain');

  // Search state
  const [searchQuery, setSearchQuery] = useState<string>('calm relax piano');
  const [searching, setSearching] = useState<boolean>(false);
  const [musicTracks, setMusicTracks] = useState<MusicTrack[]>([]);
  const [artists, setArtists] = useState<ArtistItem[]>([]);
  const [albums, setAlbums] = useState<AlbumItem[]>([]);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Playing state
  const [currentPlayingTrack, setCurrentPlayingTrack] = useState<{
    type: 'ambient' | 'music';
    id: string;
    title: string;
    artistOrCategory: string;
    coverOrIcon?: any;
    audioUrl?: string;
  }>({
    type: 'ambient',
    id: 'rain',
    title: 'Gentle Rainfall',
    artistOrCategory: 'Ambient Rain',
    coverOrIcon: CloudRain
  });

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(0.5);
  const [timerMins, setTimerMins] = useState<number>(0);
  const [secondsLeft, setSecondsLeft] = useState<number>(0);

  // Web Audio Synth references for ambient mode
  const audioCtxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const activeNodesRef = useRef<any[]>([]);

  // HTML5 Audio element reference for music track preview playback
  const audioElRef = useRef<HTMLAudioElement | null>(null);

  const ambientTracks: SoundTrack[] = [
    { id: 'rain', name: 'Gentle Rainfall', category: 'Ambient Rain', description: 'Soft raindrops falling on leaves and windowpanes.', icon: CloudRain, synthType: 'rain' },
    { id: 'ocean', name: 'Ocean Waves', category: 'Ocean', description: 'Slow rolling tides against a serene shoreline.', icon: Waves, synthType: 'ocean' },
    { id: 'forest', name: 'Pine Forest Breeze', category: 'Forest', description: 'Rustling leaves and distant woodland whispers.', icon: Trees, synthType: 'forest' },
    { id: 'wind', name: 'Mountain Wind', category: 'Wind', description: 'Soothing mountain breeze sweeping across peaks.', icon: Wind, synthType: 'wind' },
    { id: 'chimes', name: 'Tibetan Sing Chimes', category: 'Meditation', description: 'Resonant harmonic bell vibrations for mindfulness.', icon: Disc, synthType: 'chimes' },
    { id: 'lofi', name: 'Peaceful Lofi Drone', category: 'Focus', description: 'Subtle ambient warmth for deep study and focus.', icon: Disc, synthType: 'lofi' }
  ];

  // Initial fetch for music tracks on tab change or query load
  useEffect(() => {
    executeSearch();
  }, [activeTab]);

  useEffect(() => {
    return () => {
      stopAudioSynth();
      if (audioElRef.current) {
        audioElRef.current.pause();
      }
    };
  }, []);

  // Timer Countdown
  useEffect(() => {
    let timer: any = null;
    if (isPlaying && secondsLeft > 0) {
      timer = setInterval(() => {
        setSecondsLeft(prev => prev - 1);
      }, 1000);
    } else if (isPlaying && secondsLeft === 0 && timerMins > 0) {
      pausePlayback();
    }
    return () => clearInterval(timer);
  }, [isPlaying, secondsLeft]);

  // Volume control update
  useEffect(() => {
    if (masterGainRef.current) {
      masterGainRef.current.gain.value = volume;
    }
    if (audioElRef.current) {
      audioElRef.current.volume = volume;
    }
  }, [volume]);

  const executeSearch = async (queryToUse?: string) => {
    const q = (queryToUse !== undefined ? queryToUse : searchQuery).trim() || 'relax acoustic';
    setSearching(true);
    setSearchError(null);

    try {
      if (activeTab === 'tracks' || activeTab === 'ambient') {
        const results = await api.searchTracks(q, 18);
        setMusicTracks(results || []);
      } else if (activeTab === 'artists') {
        const results = await api.searchArtists(q, 12);
        setArtists(results || []);
      } else if (activeTab === 'albums') {
        const results = await api.searchAlbums(q, 12);
        setAlbums(results || []);
      }
    } catch (err: any) {
      console.error('Search failed:', err);
      setSearchError('Could not load music items right now. Showing default selection.');
    } finally {
      setSearching(false);
    }
  };

  // --- AUDIO SYNTH (AMBIENT MODE) ---
  const initAudioCtx = () => {
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      audioCtxRef.current = new AudioCtx();
      masterGainRef.current = audioCtxRef.current.createGain();
      masterGainRef.current.gain.value = volume;
      masterGainRef.current.connect(audioCtxRef.current.destination);
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
  };

  const stopAudioSynth = () => {
    activeNodesRef.current.forEach(n => {
      try {
        if (n.stop) n.stop();
        if (n.disconnect) n.disconnect();
      } catch {}
    });
    activeNodesRef.current = [];
  };

  const startAudioSynth = (synthType: string) => {
    initAudioCtx();
    stopAudioSynth();
    if (!audioCtxRef.current || !masterGainRef.current) return;

    const ctx = audioCtxRef.current;
    const master = masterGainRef.current;

    if (synthType === 'rain') {
      const bufferSize = ctx.sampleRate * 2;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 1000;

      whiteNoise.connect(filter);
      filter.connect(master);
      whiteNoise.start();
      activeNodesRef.current.push(whiteNoise);
    } else if (synthType === 'ocean') {
      const bufferSize = ctx.sampleRate * 3;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
        output[i] *= 0.11;
        b6 = white * 0.115926;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = noiseBuffer;
      noise.loop = true;

      const gain = ctx.createGain();
      gain.gain.value = 0.5;

      const lfo = ctx.createOscillator();
      lfo.frequency.value = 0.12;
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 0.3;

      lfo.connect(lfoGain);
      lfoGain.connect(gain.gain);

      noise.connect(gain);
      gain.connect(master);
      noise.start();
      lfo.start();
      activeNodesRef.current.push(noise, lfo);
    } else {
      const freqs = synthType === 'chimes' ? [220, 330, 440, 554] : [110, 164.81, 196, 220];
      freqs.forEach(f => {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = f;

        const g = ctx.createGain();
        g.gain.value = 0.1;

        osc.connect(g);
        g.connect(master);
        osc.start();
        activeNodesRef.current.push(osc);
      });
    }
  };

  // Play music track preview or ambient
  const playAmbient = (track: SoundTrack) => {
    if (audioElRef.current) {
      audioElRef.current.pause();
    }
    setActiveAmbientId(track.id);
    setCurrentPlayingTrack({
      type: 'ambient',
      id: track.id,
      title: track.name,
      artistOrCategory: track.category,
      coverOrIcon: track.icon
    });
    setIsPlaying(true);
    startAudioSynth(track.synthType);
  };

  const playMusicTrack = (track: MusicTrack) => {
    stopAudioSynth();

    if (!audioElRef.current) {
      audioElRef.current = new Audio();
    }

    audioElRef.current.volume = volume;
    if (track.audioUrl) {
      audioElRef.current.src = track.audioUrl;
      audioElRef.current.play().catch(e => console.warn('Audio play failed:', e));
    }

    setCurrentPlayingTrack({
      type: 'music',
      id: track.id,
      title: track.title,
      artistOrCategory: `${track.artist} • ${track.album}`,
      coverOrIcon: track.coverUrl,
      audioUrl: track.audioUrl
    });
    setIsPlaying(true);
  };

  const pausePlayback = () => {
    setIsPlaying(false);
    stopAudioSynth();
    if (audioElRef.current) {
      audioElRef.current.pause();
    }
  };

  const resumePlayback = () => {
    setIsPlaying(true);
    if (currentPlayingTrack.type === 'ambient') {
      const amb = ambientTracks.find(a => a.id === currentPlayingTrack.id) || ambientTracks[0];
      startAudioSynth(amb.synthType);
    } else if (audioElRef.current && currentPlayingTrack.audioUrl) {
      audioElRef.current.play().catch(e => console.warn('Audio resume error:', e));
    }
  };

  const toggleMasterPlay = () => {
    if (isPlaying) {
      pausePlayback();
    } else {
      resumePlayback();
    }
  };

  const setTimer = (mins: number) => {
    setTimerMins(mins);
    setSecondsLeft(mins * 60);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="theme-hero-card rounded-3xl p-6 sm:p-8 text-white shadow-xl border">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-2">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-white/10 theme-text-accent border theme-border-accent backdrop-blur-md">
              <Music className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">MindRelax Music & Soundscapes</h1>
              <p className="text-slate-200 text-xs sm:text-sm mt-0.5">Full-stack music search, ambient soundscapes, and calming tracks.</p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-semibold theme-text-accent border theme-border-accent">
            <Radio className="w-4 h-4 theme-text-accent animate-pulse" />
            <span>Independent • Zero Credentials Needed</span>
          </div>
        </div>
      </div>

      {/* Main Active Music Deck */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-white/10 shadow-md space-y-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 text-slate-100">
            {typeof currentPlayingTrack.coverOrIcon === 'string' ? (
              <img
                src={currentPlayingTrack.coverOrIcon}
                alt={currentPlayingTrack.title}
                className="w-16 h-16 rounded-2xl object-cover shadow-lg"
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl theme-gradient-btn text-white flex items-center justify-center shadow-lg">
                {React.createElement(currentPlayingTrack.coverOrIcon || Music, { className: 'w-8 h-8' })}
              </div>
            )}
            <div>
              <span className="text-xs font-bold theme-text-accent uppercase tracking-wider block">
                {currentPlayingTrack.type === 'ambient' ? 'Ambient Soundscape' : 'Music Track'}
              </span>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">{currentPlayingTrack.title}</h2>
              <p className="text-xs text-slate-300 mt-0.5">{currentPlayingTrack.artistOrCategory}</p>
            </div>
          </div>

          <button
            onClick={toggleMasterPlay}
            className="flex items-center gap-3 px-8 py-4 theme-gradient-btn text-white font-extrabold text-base rounded-2xl shadow-xl transition scale-100 hover:scale-105 active:scale-95"
          >
            {isPlaying ? (
              <>
                <Pause className="w-6 h-6 fill-white" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-6 h-6 fill-white" />
                <span>Play Now</span>
              </>
            )}
          </button>
        </div>

        {/* Volume & Sleep Timer Controls */}
        <div className="pt-4 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setVolume(v => (v > 0 ? 0 : 0.5))}
              className="p-2 text-slate-500 hover:text-slate-800"
            >
              {volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={e => setVolume(Number(e.target.value))}
              className="w-full accent-cyan-600 cursor-pointer"
            />
            <span className="text-xs font-bold text-slate-600 w-12 text-right">{Math.round(volume * 100)}%</span>
          </div>

          <div className="flex items-center gap-2 justify-start md:justify-end">
            <Clock className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-bold text-slate-600 mr-2">Auto-Off Timer:</span>
            {[0, 15, 30, 60].map(m => (
              <button
                key={m}
                onClick={() => setTimer(m)}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition ${
                  timerMins === m
                    ? 'bg-cyan-600 text-white border-cyan-600 shadow-xs'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {m === 0 ? 'Off' : `${m}m`}
              </button>
            ))}
            {secondsLeft > 0 && (
              <span className="text-xs font-mono text-cyan-600 font-bold bg-cyan-50 px-2.5 py-1 rounded-xl ml-2">
                {Math.floor(secondsLeft / 60)}m {secondsLeft % 60}s
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Tabs & Search Bar */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          {/* Tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-2xl overflow-x-auto">
            <button
              onClick={() => setActiveTab('ambient')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                activeTab === 'ambient' ? 'bg-white text-cyan-800 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Volume2 className="w-4 h-4" />
              <span>Ambient Soundscapes</span>
            </button>
            <button
              onClick={() => setActiveTab('tracks')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                activeTab === 'tracks' ? 'bg-white text-cyan-800 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Music className="w-4 h-4" />
              <span>Music Tracks</span>
            </button>
            <button
              onClick={() => setActiveTab('artists')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                activeTab === 'artists' ? 'bg-white text-cyan-800 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Artists</span>
            </button>
            <button
              onClick={() => setActiveTab('albums')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                activeTab === 'albums' ? 'bg-white text-cyan-800 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Library className="w-4 h-4" />
              <span>Albums</span>
            </button>
          </div>

          {/* Search Bar for Music */}
          {activeTab !== 'ambient' && (
            <form
              onSubmit={e => {
                e.preventDefault();
                executeSearch();
              }}
              className="relative flex-1 max-w-md"
            >
              <input
                type="text"
                placeholder={`Search ${activeTab}...`}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-24 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <button
                type="submit"
                disabled={searching}
                className="absolute right-1.5 top-1.5 bottom-1.5 px-3 bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs rounded-xl transition flex items-center gap-1 disabled:opacity-50"
              >
                {searching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Search'}
              </button>
            </form>
          )}
        </div>

        {/* Tab Content Display */}
        {activeTab === 'ambient' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {ambientTracks.map(t => {
              const isSelected = currentPlayingTrack.type === 'ambient' && activeAmbientId === t.id;
              return (
                <div
                  key={t.id}
                  onClick={() => playAmbient(t)}
                  className={`p-5 rounded-3xl border cursor-pointer transition flex items-start gap-4 ${
                    isSelected
                      ? 'bg-cyan-50/80 border-cyan-500 shadow-md ring-2 ring-cyan-500/20'
                      : 'bg-white border-slate-100 hover:border-slate-300 hover:shadow-sm'
                  }`}
                >
                  <div className={`p-3 rounded-2xl ${isSelected ? 'bg-cyan-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                    <t.icon className="w-6 h-6" />
                  </div>
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-sm text-slate-800">{t.name}</h4>
                      {isSelected && isPlaying && (
                        <span className="w-2 h-2 rounded-full bg-cyan-500 animate-ping" />
                      )}
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">{t.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 'tracks' && (
          <div>
            {searching ? (
              <div className="p-12 text-center text-slate-500 flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-8 h-8 text-cyan-600 animate-spin" />
                <p className="text-xs font-semibold">Searching relaxing music catalogue via backend MusicService...</p>
              </div>
            ) : !Array.isArray(musicTracks) || musicTracks.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-3xl border border-slate-100 space-y-2">
                <Music className="w-8 h-8 text-slate-300 mx-auto" />
                <h4 className="font-bold text-slate-700">No tracks found</h4>
                <p className="text-xs text-slate-400">Try searching for terms like "piano", "meditation", "ambient", or "calm".</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {musicTracks.map(t => {
                  const isSelected = currentPlayingTrack.type === 'music' && currentPlayingTrack.id === t.id;
                  return (
                    <div
                      key={t.id}
                      onClick={() => playMusicTrack(t)}
                      className={`p-4 rounded-3xl border cursor-pointer transition flex items-center gap-4 ${
                        isSelected
                          ? 'bg-cyan-50/80 border-cyan-500 shadow-md ring-2 ring-cyan-500/20'
                          : 'bg-white border-slate-100 hover:border-slate-300 hover:shadow-sm'
                      }`}
                    >
                      <img
                        src={t.coverUrl}
                        alt={t.title}
                        className="w-14 h-14 rounded-2xl object-cover bg-slate-100 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0 space-y-0.5">
                        <h4 className="font-bold text-sm text-slate-800 truncate">{t.title}</h4>
                        <p className="text-xs text-slate-500 truncate">{t.artist}</p>
                        <span className="inline-block text-[10px] font-semibold text-cyan-600 bg-cyan-50 px-2 py-0.5 rounded-md">
                          {t.genre}
                        </span>
                      </div>
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          if (isSelected && isPlaying) pausePlayback();
                          else playMusicTrack(t);
                        }}
                        className={`p-3 rounded-2xl transition ${
                          isSelected && isPlaying
                            ? 'bg-cyan-600 text-white shadow-md'
                            : 'bg-slate-100 text-slate-700 hover:bg-cyan-100 hover:text-cyan-800'
                        }`}
                      >
                        {isSelected && isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'artists' && (
          <div>
            {searching ? (
              <div className="p-12 text-center text-slate-500 flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-8 h-8 text-cyan-600 animate-spin" />
                <p className="text-xs font-semibold">Searching artists...</p>
              </div>
            ) : !Array.isArray(artists) || artists.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-3xl border border-slate-100 space-y-2">
                <User className="w-8 h-8 text-slate-300 mx-auto" />
                <h4 className="font-bold text-slate-700">No artists found</h4>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {artists.map(a => (
                  <div
                    key={a.id}
                    onClick={() => {
                      setSearchQuery(a.name);
                      setActiveTab('tracks');
                      executeSearch(a.name);
                    }}
                    className="p-5 bg-white rounded-3xl border border-slate-100 hover:border-slate-300 transition cursor-pointer flex items-center gap-4 hover:shadow-sm"
                  >
                    <div className="w-12 h-12 rounded-full bg-cyan-100 text-cyan-800 flex items-center justify-center font-bold text-base">
                      {a.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-800">{a.name}</h4>
                      <p className="text-xs text-slate-500">{a.genre}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'albums' && (
          <div>
            {searching ? (
              <div className="p-12 text-center text-slate-500 flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-8 h-8 text-cyan-600 animate-spin" />
                <p className="text-xs font-semibold">Searching albums...</p>
              </div>
            ) : !Array.isArray(albums) || albums.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-3xl border border-slate-100 space-y-2">
                <Library className="w-8 h-8 text-slate-300 mx-auto" />
                <h4 className="font-bold text-slate-700">No albums found</h4>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {albums.map(alb => (
                  <div
                    key={alb.id}
                    onClick={() => {
                      setSearchQuery(alb.title);
                      setActiveTab('tracks');
                      executeSearch(alb.title);
                    }}
                    className="p-4 bg-white rounded-3xl border border-slate-100 hover:border-slate-300 transition cursor-pointer flex items-center gap-4 hover:shadow-sm"
                  >
                    {alb.coverUrl ? (
                      <img src={alb.coverUrl} alt={alb.title} className="w-14 h-14 rounded-2xl object-cover" />
                    ) : (
                      <div className="w-14 h-14 rounded-2xl bg-cyan-100 text-cyan-800 flex items-center justify-center">
                        <Library className="w-6 h-6" />
                      </div>
                    )}
                    <div className="space-y-0.5">
                      <h4 className="font-bold text-sm text-slate-800">{alb.title}</h4>
                      <p className="text-xs text-slate-500">{alb.artist}</p>
                      <span className="text-[10px] text-slate-400 block">{alb.releaseYear} • {alb.trackCount} Tracks</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
