import express from 'express';
import cors from 'cors';
import path from 'path';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { createServer as createViteServer } from 'vite';
import { db } from './server/db.js';
import { generateMindaResponse } from './server/gemini.js';
import { musicService } from './server/musicService.js';
import backendApp from './backend/app.js';

const PORT = 3000;

async function startServer() {
  const app = express();
  const server = http.createServer(app);

  // Initialize WebSocket Server
  const wss = new WebSocketServer({ server, path: '/ws' });
  const connectedClients = new Set<WebSocket>();

  function broadcast(event: string, payload: any) {
    const data = JSON.stringify({ event, payload, timestamp: new Date().toISOString() });
    connectedClients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    });
  }

  function broadcastPresence() {
    broadcast('presence:update', { onlineCount: Math.max(1, connectedClients.size) });
  }

  wss.on('connection', (ws) => {
    connectedClients.add(ws);
    broadcastPresence();

    ws.on('message', (message) => {
      try {
        const parsed = JSON.parse(message.toString());
        if (parsed.event === 'ping') {
          ws.send(JSON.stringify({ event: 'pong' }));
        } else if (parsed.event === 'activity:broadcast') {
          broadcast('activity:live', parsed.payload);
        }
      } catch (e) {
        // Ignore malformed messages
      }
    });

    ws.on('close', () => {
      connectedClients.delete(ws);
      broadcastPresence();
    });

    ws.on('error', () => {
      connectedClients.delete(ws);
      broadcastPresence();
    });
  });

  app.use(cors());
  app.use(express.json());

  // Mount backend/ Express structure
  app.use('/backend', backendApp);

  // Initialize DB
  await db.init();

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', app: 'MindRelax', timestamp: new Date().toISOString() });
  });

  // --- PROFILES ---
  app.get('/api/profile/:id', async (req, res) => {
    try {
      const profile = await db.getProfile(req.params.id);
      if (!profile) {
        return res.status(404).json({ error: 'Profile not found' });
      }
      res.json(profile);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.put('/api/profile/:id', async (req, res) => {
    try {
      const profile = await db.saveProfile({ ...req.body, id: req.params.id });
      res.json(profile);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // --- MOODS ---
  app.get('/api/moods/:profileId', async (req, res) => {
    try {
      const moods = await db.getMoodEntries(req.params.profileId);
      res.json(moods);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/moods', async (req, res) => {
    try {
      const { profile_id, mood, intensity, note } = req.body;
      if (!profile_id || !mood) {
        return res.status(400).json({ error: 'profile_id and mood are required' });
      }
      const entry = await db.addMoodEntry(profile_id, mood, intensity, note);
      broadcast('mood:logged', entry);
      broadcast('activity:live', { message: `A sanctuary member logged their mood: ${mood}` });
      res.json(entry);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // --- JOURNAL ---
  app.get('/api/journal/:profileId', async (req, res) => {
    try {
      const entries = await db.getJournalEntries(req.params.profileId);
      res.json(entries);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/journal', async (req, res) => {
    try {
      const { profile_id, title, content, mood, tags, prompt } = req.body;
      if (!profile_id || !title || !content) {
        return res.status(400).json({ error: 'profile_id, title, and content are required' });
      }
      const entry = await db.addJournalEntry(profile_id, { title, content, mood, tags, prompt });
      res.json(entry);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.put('/api/journal/:id', async (req, res) => {
    try {
      const { profile_id, title, content, mood, tags } = req.body;
      const updated = await db.updateJournalEntry(req.params.id, profile_id, { title, content, mood, tags });
      if (!updated) return res.status(404).json({ error: 'Entry not found' });
      res.json(updated);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete('/api/journal/:id', async (req, res) => {
    try {
      const profile_id = req.query.profile_id as string || req.body.profile_id;
      const result = await db.deleteJournalEntry(req.params.id, profile_id);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // --- MEDITATIONS ---
  app.get('/api/meditations/:profileId', async (req, res) => {
    try {
      const sessions = await db.getMeditationSessions(req.params.profileId);
      res.json(sessions);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/meditations/complete', async (req, res) => {
    try {
      const { profile_id, category, title, duration_seconds } = req.body;
      if (!profile_id || !category || !title) {
        return res.status(400).json({ error: 'profile_id, category, and title are required' });
      }
      const session = await db.completeMeditationSession(profile_id, category, title, duration_seconds || 300);
      broadcast('meditation:completed', session);
      broadcast('activity:live', { message: `Completed a ${Math.round((duration_seconds || 300) / 60)} min ${category} meditation` });
      res.json(session);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // --- COMMUNITY ---
  app.get('/api/community/posts', async (req, res) => {
    try {
      const profileId = req.query.profile_id as string;
      const posts = await db.getCommunityPosts(profileId);
      res.json(posts);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/community/posts', async (req, res) => {
    try {
      const { author_id, author_name, category, content } = req.body;
      const post = await db.addCommunityPost(author_id, author_name || 'Mindful Friend', category || 'General Wellness', content);
      broadcast('community:post_created', post);
      broadcast('activity:live', { message: `New post in ${category}: "${content.substring(0, 30)}..."` });
      res.json(post);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.delete('/api/community/posts/:id', async (req, res) => {
    try {
      const author_id = req.query.author_id as string || req.body.author_id;
      const result = await db.deleteCommunityPost(req.params.id, author_id);
      broadcast('community:post_deleted', { id: req.params.id });
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/community/posts/:id/like', async (req, res) => {
    try {
      const { profile_id } = req.body;
      const result = await db.toggleLikePost(req.params.id, profile_id);
      broadcast('community:post_liked', { postId: req.params.id, ...result });
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/community/posts/:id/comments', async (req, res) => {
    try {
      const comments = await db.getComments(req.params.id);
      res.json(comments);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/community/posts/:id/comments', async (req, res) => {
    try {
      const { author_id, author_name, content } = req.body;
      const comment = await db.addComment(req.params.id, author_id, author_name || 'Mindful Friend', content);
      broadcast('community:comment_added', { postId: req.params.id, comment });
      broadcast('activity:live', { message: `New comment added on community post` });
      res.json(comment);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.delete('/api/community/comments/:id', async (req, res) => {
    try {
      const author_id = req.query.author_id as string || req.body.author_id;
      const result = await db.deleteComment(req.params.id, author_id);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // --- FRIENDS ---
  app.get('/api/friends/:profileId', async (req, res) => {
    try {
      const friends = await db.getFriends(req.params.profileId);
      res.json(friends);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/friends/request', async (req, res) => {
    try {
      const { requester_id, target_name } = req.body;
      const request = await db.sendFriendRequest(requester_id, target_name);
      res.json(request);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.put('/api/friends/request/:id', async (req, res) => {
    try {
      const { profile_id, accept } = req.body;
      const updated = await db.respondFriendRequest(req.params.id, profile_id, accept);
      res.json(updated);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // --- GOALS ---
  app.get('/api/goals/:profileId', async (req, res) => {
    try {
      const goals = await db.getGoals(req.params.profileId);
      res.json(goals);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/goals', async (req, res) => {
    try {
      const { profile_id, title, description, target, frequency } = req.body;
      const goal = await db.addGoal(profile_id, { title, description, target, frequency });
      res.json(goal);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.put('/api/goals/:id', async (req, res) => {
    try {
      const { profile_id, increment } = req.body;
      const goal = await db.updateGoalProgress(req.params.id, profile_id, increment || 1);
      res.json(goal);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete('/api/goals/:id', async (req, res) => {
    try {
      const profile_id = req.query.profile_id as string || req.body.profile_id;
      const result = await db.deleteGoal(req.params.id, profile_id);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // --- GAMES ---
  app.post('/api/games/complete', async (req, res) => {
    try {
      const { profile_id, game_type, score, points_earned } = req.body;
      const session = await db.saveGameSession(profile_id, game_type, score || 0, points_earned || 20);
      res.json(session);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // --- RESOURCES & WEBINARS ---
  app.get('/api/resources', async (req, res) => {
    try {
      const profileId = req.query.profile_id as string;
      const resources = await db.getResources(profileId);
      res.json(resources);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/resources/:id/progress', async (req, res) => {
    try {
      const { profile_id, action } = req.body;
      const prog = await db.toggleResourceProgress(profile_id, req.params.id, action);
      res.json(prog);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/webinars', async (req, res) => {
    try {
      const webinars = await db.getWebinars();
      res.json(webinars);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // --- ACHIEVEMENTS & NOTIFICATIONS ---
  app.get('/api/achievements/:profileId', async (req, res) => {
    try {
      const achs = await db.getAchievements(req.params.profileId);
      res.json(achs);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/notifications/:profileId', async (req, res) => {
    try {
      const notifs = await db.getNotifications(req.params.profileId);
      res.json(notifs);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.put('/api/notifications/:id/read', async (req, res) => {
    try {
      const { profile_id } = req.body;
      const result = await db.markNotificationRead(req.params.id, profile_id);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // --- CHAT & AI ASSISTANT "MINDA" ---
  app.get('/api/chat/:profileId', async (req, res) => {
    try {
      const history = await db.getChatHistory(req.params.profileId);
      res.json(history);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/chat', async (req, res) => {
    try {
      const { profile_id, message } = req.body;
      if (!profile_id || !message) {
        return res.status(400).json({ error: 'profile_id and message are required' });
      }

      // Save user message
      await db.addChatMessage(profile_id, 'user', message);

      // Get profile for context
      const profile = await db.getProfile(profile_id);

      // Call Minda AI service
      const replyText = await generateMindaResponse(message, profile);

      // Save assistant response
      const assistantMsg = await db.addChatMessage(profile_id, 'minda', replyText);

      res.json(assistantMsg);
    } catch (err: any) {
      res.status(500).json({
        error: 'Minda is temporarily resting. You can still explore meditation, journaling, and relaxation tools!',
        details: err.message
      });
    }
  });

  // --- MUSIC SERVICE (FULL-STACK MUSIC ABSTRACTION) ---
  app.get('/api/music/search', async (req, res) => {
    try {
      const q = (req.query.q as string) || '';
      const type = (req.query.type as string) || 'tracks';
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;

      if (type === 'artists') {
        const artists = await musicService.searchArtists(q, { limit });
        return res.json({ artists });
      } else if (type === 'albums') {
        const albums = await musicService.searchAlbums(q, { limit });
        return res.json({ albums });
      } else {
        const tracks = await musicService.searchTracks(q, { limit });
        return res.json({ tracks });
      }
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/music/tracks/search', async (req, res) => {
    try {
      const q = (req.query.q as string) || '';
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;
      const tracks = await musicService.searchTracks(q, { limit });
      res.json(tracks);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/music/artists/search', async (req, res) => {
    try {
      const q = (req.query.q as string) || '';
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
      const artists = await musicService.searchArtists(q, { limit });
      res.json(artists);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/music/albums/search', async (req, res) => {
    try {
      const q = (req.query.q as string) || '';
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
      const albums = await musicService.searchAlbums(q, { limit });
      res.json(albums);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/music/track/:id', async (req, res) => {
    try {
      const track = await musicService.getTrack(req.params.id);
      if (!track) return res.status(404).json({ error: 'Track not found' });
      res.json(track);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/music/artist/:id', async (req, res) => {
    try {
      const artist = await musicService.getArtist(req.params.id);
      if (!artist) return res.status(404).json({ error: 'Artist not found' });
      res.json(artist);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/music/album/:id', async (req, res) => {
    try {
      const album = await musicService.getAlbum(req.params.id);
      if (!album) return res.status(404).json({ error: 'Album not found' });
      res.json(album);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // VITE / STATIC FILE HANDLING
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`MindRelax real-time server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
