import React, { useState, useEffect } from 'react';
import { Heart, BookOpen, Check, ChevronLeft, Clock, Users, Home, Copy, Undo2 } from 'lucide-react';
import { database } from './firebase';
import { ref, set, get, onValue, update } from 'firebase/database';

// ============================================================
// CONTENT
// ============================================================

const QUESTIONS = [
  { id: 1, text: "Given the choice of anyone in the world, whom would you want as a dinner guest?", phase: 1 },
  { id: 2, text: "Would you like to be famous? In what way?", phase: 1 },
  { id: 3, text: "Before making a telephone call, do you ever rehearse what you are going to say? Why?", phase: 1 },
  { id: 4, text: "What would constitute a 'perfect' day for you?", phase: 1 },
  { id: 5, text: "When did you last sing to yourself? To someone else?", phase: 1 },
  { id: 6, text: "If you were able to live to the age of 90 and retain either the mind or body of a 30-year-old for the last 60 years of your life, which would you want?", phase: 1 },
  { id: 7, text: "Do you have a secret hunch about how you will die?", phase: 1 },
  { id: 8, text: "Name three things you and your partner appear to have in common.", phase: 1 },
  { id: 9, text: "For what in your life do you feel most grateful?", phase: 1 },
  { id: 10, text: "If you could change anything about the way you were raised, what would it be?", phase: 1 },
  { id: 11, text: "Take four minutes and tell your partner your life story in as much detail as possible.", phase: 1 },
  { id: 12, text: "If you could wake up tomorrow having gained any one quality or ability, what would it be?", phase: 1 },

  { id: 13, text: "If a crystal ball could tell you the truth about yourself, your life, the future or anything else, what would you want to know?", phase: 2 },
  { id: 14, text: "Is there something that you've dreamed of doing for a long time? Why haven't you done it?", phase: 2 },
  { id: 15, text: "What is the greatest accomplishment of your life?", phase: 2 },
  { id: 16, text: "What do you value most in a friendship?", phase: 2 },
  { id: 17, text: "What is your most treasured memory?", phase: 2 },
  { id: 18, text: "What is your most terrible memory?", phase: 2 },
  { id: 19, text: "If you knew that in one year you would die suddenly, would you change anything about the way you are now living? Why?", phase: 2 },
  { id: 20, text: "What does friendship mean to you?", phase: 2 },
  { id: 21, text: "What roles do love and affection play in your life?", phase: 2 },
  { id: 22, text: "Alternate sharing something you consider a positive characteristic of your partner. Share a total of five items.", phase: 2 },
  { id: 23, text: "How close and warm is your family? Do you feel your childhood was happier than most other people's?", phase: 2 },
  { id: 24, text: "How do you feel about your relationship with your mother?", phase: 2 },

  { id: 25, text: "Make three true 'we' statements each. For instance, 'We are both in this room feeling...'", phase: 3 },
  { id: 26, text: "Complete this sentence: 'I wish I had someone with whom I could share...'", phase: 3 },
  { id: 27, text: "If you were going to become a close friend with your partner, please share what would be important for them to know.", phase: 3 },
  { id: 28, text: "Tell your partner what you like about them; be very honest this time, saying things that you might not say to someone you've just met.", phase: 3 },
  { id: 29, text: "Share with your partner an embarrassing moment in your life.", phase: 3 },
  { id: 30, text: "When did you last cry in front of another person? By yourself?", phase: 3 },
  { id: 31, text: "Tell your partner something that you like about them already.", phase: 3 },
  { id: 32, text: "What, if anything, is too serious to be joked about?", phase: 3 },
  { id: 33, text: "If you were to die this evening with no opportunity to communicate with anyone, what would you most regret not having told someone? Why haven't you told them yet?", phase: 3 },
  { id: 34, text: "Your house, containing everything you own, catches fire. After saving your loved ones and pets, you have time to safely make a final dash to save any one item. What would it be? Why?", phase: 3 },
  { id: 35, text: "Of all the people in your family, whose death would you find most disturbing? Why?", phase: 3 },
  { id: 36, text: "Share a personal problem and ask your partner's advice on how he or she might handle it. Also, ask your partner to reflect back to you how you seem to be feeling about the problem you have chosen.", phase: 3 },
];

// Rewards keyed by QUESTION NUMBER (1-based). Shown after that question is completed.
const REWARDS = {
  3: {
    title: "First Spark",
    activity: "Movie Night - Before Sunrise (1995)",
    description: "Watch a couple walk through Vienna talking about life, love, and dreams. Exactly what you're doing.",
    details: "Set up at home with blankets and tea. Watch together (1.5 hrs), sit 10 min in silence after, then discuss what resonated. Decorate your notebooks with a movie still or inspired drawing.",
    time: "2 hours",
    icon: "🎬",
  },
  6: {
    title: "Growing Close",
    activity: "Create a Couples Playlist (10 Songs)",
    description: "Each pick 5 songs that remind you of them. Listen together. Write down why each song matters.",
    details: "Sit together, each independently pick 5 songs that remind you of them or express how you feel. Present them one by one, play 30 sec each, explain why. Listen to all 10 together. Write in your notebooks: 'Our 10 Songs' with the stories.",
    time: "1.5-2 hours",
    icon: "🎵",
  },
  11: {
    title: "Mystery Gift",
    activity: "Exchange Mystery Gifts (₹500)",
    description: "Pick something small, personal, mysterious. Wrap it. Exchange with no hints. Open together and share why you chose it.",
    details: "Each of you secretly buys something for the other (budget: ₹500 max). Wrap it thoughtfully. Pick a cozy moment, exchange without revealing why, open slowly, and share the story behind your choice. Photograph both gifts together for your notebooks with the story written next to it.",
    time: "30-45 minutes",
    icon: "🎁",
  },
  17: {
    title: "Deep Conversations",
    activity: "Board Game Night (Candlelit)",
    description: "Set up an intimate space with candles and soft music. Play your favorite board game together.",
    details: "Dim the lights, light a few candles, put on soft instrumental music, keep tea nearby. Choose a game you both enjoy and play for 2-3 hours. No pressure, just playful connection. Take photos for your notebooks with notes about who won and what made you laugh.",
    time: "2-3 hours",
    icon: "🎲",
  },
  22: {
    title: "Creating Together",
    activity: "Creative Photo Shoot - Dress Up & Play",
    description: "Dress up. Go outdoors. Create fun, playful, ridiculous photos together.",
    details: "Dress however makes you feel awesome. Pick an outdoor spot you love. Get creative with poses — jumping, running, silly faces, action shots. The goal is laughter, not perfection. Take 50+ photos, pick your favorites (keep the silly ones!), and paste them in your notebooks with captions.",
    time: "2-3 hours",
    icon: "📸",
  },
  24: {
    title: "Opening Up",
    activity: "Sunset from Your Rooftop (No Phones)",
    description: "Watch the sky change colors. No distractions. Just you, each other, and the quiet.",
    details: "Go up 30 min before sunset. Sit side by side and watch the colors shift. After sunset, sit 5 more minutes in silence, then share what you noticed and how it felt. Take a photo or two for your notebooks.",
    time: "1 hour",
    icon: "🌅",
  },
  28: {
    title: "Visualize Together",
    activity: "Create a Couple Vision Board",
    description: "Cut out images, words, dreams. Glue together. Visualize your future on paper.",
    details: "Brainstorm your future together (home, travel, dreams, lifestyle). Gather images, arrange them on a poster board, add words and quotes, and display it somewhere you'll see it daily.",
    time: "3-4 hours",
    icon: "🎨",
  },
  36: {
    title: "Completely Connected",
    activity: "Book Your Weekend Getaway",
    description: "Celebrate completing all 36 questions. A weekend away. Just you two.",
    details: "Choose any destination you both want to visit and book it. Explore together, have special meals, stay present with each other. Collect photos and mementos, and write about the getaway in your notebooks.",
    time: "Weekend getaway",
    icon: "🏨",
  },
};

const PHASE_META = {
  1: { emoji: "🌱", label: "Light", color: "text-emerald-400" },
  2: { emoji: "💫", label: "Deeper", color: "text-indigo-300" },
  3: { emoji: "🔥", label: "Deepest", color: "text-rose-400" },
};

// ============================================================
// SMALL COMPONENTS
// ============================================================

const Confetti = ({ isActive }) => {
  if (!isActive) return null;
  const pieces = Array.from({ length: 30 }).map((_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 0.5,
    emoji: Math.random() > 0.5 ? '💗' : '✨',
  }));
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
      {pieces.map(p => (
        <div
          key={p.id}
          className="absolute text-lg"
          style={{
            left: `${p.left}%`,
            top: '-20px',
            animation: `fall ${2 + Math.random()}s linear forwards`,
            animationDelay: `${p.delay}s`,
          }}
        >
          {p.emoji}
        </div>
      ))}
      <style>{`@keyframes fall { to { transform: translateY(100vh) rotate(360deg); opacity: 0; } }`}</style>
    </div>
  );
};

// ============================================================
// MAIN APP
// ============================================================

const STORAGE = { room: '36q-room', role: '36q-role', name: '36q-name' };
const TOTAL = QUESTIONS.length;

const NotebookApp = () => {
  // --- Identity: who am I, in which room. The only truly local state. ---
  const [identity, setIdentity] = useState(null); // { room, role: 'creator'|'joiner', name }

  // --- Session: a live MIRROR of Firebase. Single source of truth. ---
  const [session, setSession] = useState(null);
  const [sessionLoaded, setSessionLoaded] = useState(false);

  // --- Intro form state (kept fully separate for create vs join) ---
  const [createName, setCreateName] = useState('');
  const [createRoom, setCreateRoom] = useState('');
  const [joinName, setJoinName] = useState('');
  const [joinRoom, setJoinRoom] = useState('');
  const [joinError, setJoinError] = useState('');
  const [roomChoice, setRoomChoice] = useState(null); // { room, creator, joiner } when an existing room needs a "who are you?" choice
  const [busy, setBusy] = useState(false);

  // --- Local-only UI state ---
  const [showConfetti, setShowConfetti] = useState(false);
  const [copied, setCopied] = useState(false);

  // --- Timer (local convenience; whether it's enabled is shared) ---
  const [timerActive, setTimerActive] = useState(false);
  const [timerRemaining, setTimerRemaining] = useState(15 * 60);

  // ----------------------------------------------------------
  // 1. Resume identity on mount
  // ----------------------------------------------------------
  useEffect(() => {
    const room = localStorage.getItem(STORAGE.room);
    const role = localStorage.getItem(STORAGE.role);
    const name = localStorage.getItem(STORAGE.name);
    if (room && role) setIdentity({ room, role, name: name || '' });
  }, []);

  // ----------------------------------------------------------
  // 2. THE ONE listener. Whenever identity.room changes, subscribe.
  //    Everything about game state flows through here.
  // ----------------------------------------------------------
  useEffect(() => {
    if (!identity?.room) {
      setSession(null);
      setSessionLoaded(false);
      return;
    }
    setSessionLoaded(false);
    const sref = ref(database, `sessions/${identity.room}`);
    const unsub = onValue(sref, (snap) => {
      setSession(snap.exists() ? snap.val() : null);
      setSessionLoaded(true);
    });
    return () => unsub();
  }, [identity?.room]);

  // ----------------------------------------------------------
  // Derived values (recomputed each render — never stored, never stale)
  // ----------------------------------------------------------
  const inSession = !!identity && !!session;
  const myRole = identity?.role;
  const partnerRole = myRole === 'creator' ? 'joiner' : 'creator';
  const myName = identity?.name || 'You';
  const creatorName = session?.creator || '';
  const joinerName = session?.joiner || '';
  const partnerName = (myRole === 'creator' ? joinerName : creatorName) || 'Partner';
  const partnerPresent = !!creatorName && !!joinerName;

  const current = session?.current ?? 0;
  const progress = session?.progress || {};
  const qProgress = progress[current] || {};
  const iAmDone = !!qProgress[myRole];
  const partnerDone = !!qProgress[partnerRole];
  const bothDone = iAmDone && partnerDone;
  const useTimer = !!session?.useTimer;
  const rewardAt = session?.rewardAt || null;

  const completedCount = Object.values(progress).filter(p => p && p.creator && p.joiner).length;
  const currentQuestion = QUESTIONS[current];

  // ----------------------------------------------------------
  // Timer: reset to 15:00 (paused) each time the question changes
  // ----------------------------------------------------------
  useEffect(() => {
    setTimerRemaining(15 * 60);
    setTimerActive(false);
  }, [current, useTimer]);

  useEffect(() => {
    if (!useTimer || !timerActive) return;
    const iv = setInterval(() => {
      setTimerRemaining(prev => {
        if (prev <= 1) { setTimerActive(false); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(iv);
  }, [useTimer, timerActive]);

  const fmt = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  // ----------------------------------------------------------
  // ACTIONS — every one writes to Firebase; the listener echoes it
  // back into React state identically for both people.
  // ----------------------------------------------------------
  const cleanRoom = (s) => s.toLowerCase().trim().replace(/\s+/g, '-');

  const createSession = async () => {
    const room = cleanRoom(createRoom);
    const name = createName.trim();
    if (!name || !room) return;
    setBusy(true);
    setJoinError('');
    try {
      // Don't clobber a room that already exists — offer to join it instead.
      const existing = await get(ref(database, `sessions/${room}`));
      if (existing.exists()) {
        const d = existing.val();
        setRoomChoice({ room, creator: d.creator || '', joiner: d.joiner || '' });
        setBusy(false);
        return;
      }
      // Fresh session. progress is empty — every question starts clean.
      await set(ref(database, `sessions/${room}`), {
        creator: name,
        joiner: '',
        current: 0,
        progress: {},
        useTimer: false,
        rewardAt: null,
        createdAt: new Date().toISOString(),
      });
      localStorage.setItem(STORAGE.room, room);
      localStorage.setItem(STORAGE.role, 'creator');
      localStorage.setItem(STORAGE.name, name);
      setIdentity({ room, role: 'creator', name });
    } catch (e) {
      setJoinError('Could not create the room. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  // Step 1: look up the room and decide what to show.
  const lookupRoom = async () => {
    const room = cleanRoom(joinRoom);
    if (!room) return;
    setBusy(true);
    setJoinError('');
    try {
      const snap = await get(ref(database, `sessions/${room}`));
      if (!snap.exists()) {
        setJoinError(`No room called "${room}" yet. Ask your partner for the exact room name, or create it.`);
        setBusy(false);
        return;
      }
      const d = snap.val();
      // Existing room → let them pick who they are instead of overwriting a slot.
      setRoomChoice({ room, creator: d.creator || '', joiner: d.joiner || '' });
    } catch (e) {
      setJoinError('Could not reach that room. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  // Step 2a: resume as an existing participant WITHOUT rewriting their name/role.
  const continueAs = (role) => {
    if (!roomChoice) return;
    const room = roomChoice.room;
    const name = role === 'creator' ? roomChoice.creator : roomChoice.joiner;
    localStorage.setItem(STORAGE.room, room);
    localStorage.setItem(STORAGE.role, role);
    localStorage.setItem(STORAGE.name, name);
    setIdentity({ room, role, name });
    setRoomChoice(null);
  };

  // Step 2b: take the empty partner slot as a brand-new person.
  const joinAsNewPartner = async () => {
    if (!roomChoice) return;
    const name = joinName.trim();
    if (!name) {
      setJoinError('Please type your name above to join as the partner.');
      return;
    }
    setBusy(true);
    try {
      await update(ref(database, `sessions/${roomChoice.room}`), { joiner: name });
      localStorage.setItem(STORAGE.room, roomChoice.room);
      localStorage.setItem(STORAGE.role, 'joiner');
      localStorage.setItem(STORAGE.name, name);
      setIdentity({ room: roomChoice.room, role: 'joiner', name });
      setRoomChoice(null);
    } catch (e) {
      setJoinError('Could not join the room. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const cancelChoice = () => { setRoomChoice(null); setJoinError(''); };

  const toggleMyDone = () => {
    if (!inSession) return;
    // Write ONLY my own flag for THIS question. Never touch partner's.
    update(ref(database, `sessions/${identity.room}/progress/${current}`), {
      [myRole]: !iAmDone,
    });
  };

  const goNext = () => {
    if (!bothDone) return;
    const qNum = current + 1; // question number just completed
    const nextIndex = current + 1;
    const patch = { current: nextIndex };
    if (REWARDS[qNum]) {
      patch.rewardAt = qNum;        // both phones will show the reward
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2500);
    }
    update(ref(database, `sessions/${identity.room}`), patch);
  };

  const dismissReward = () => {
    update(ref(database, `sessions/${identity.room}`), { rewardAt: null });
  };

  const goPrevious = () => {
    if (current <= 0) return;
    update(ref(database, `sessions/${identity.room}`), { current: current - 1 });
  };

  const enableTimer = () => {
    update(ref(database, `sessions/${identity.room}`), { useTimer: true });
  };
  const disableTimer = () => {
    update(ref(database, `sessions/${identity.room}`), { useTimer: false });
  };

  const startOver = () => {
    update(ref(database, `sessions/${identity.room}`), {
      current: 0, progress: {}, rewardAt: null,
    });
  };

  const leave = () => {
    localStorage.removeItem(STORAGE.room);
    localStorage.removeItem(STORAGE.role);
    localStorage.removeItem(STORAGE.name);
    setIdentity(null);
    setSession(null);
  };

  const copyRoom = () => {
    if (identity?.room) {
      navigator.clipboard?.writeText(identity.room).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }).catch(() => {});
    }
  };

  // ==========================================================
  // SCREEN ROUTING (mostly derived from shared state)
  // ==========================================================

  // Connecting: identity set but Firebase hasn't answered yet
  if (identity && !sessionLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-300">Connecting to your room…</p>
        </div>
      </div>
    );
  }

  // Identity set but room no longer exists (deleted / typo)
  if (identity && sessionLoaded && !session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="bg-slate-800/60 border border-slate-600 rounded-2xl p-8 max-w-sm text-center">
          <p className="text-white font-semibold mb-2">This room isn't available anymore.</p>
          <p className="text-gray-400 text-sm mb-6">It may have been reset. You can go back and start or join a room.</p>
          <button onClick={leave} className="w-full px-6 py-3 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl">
            Back to start
          </button>
        </div>
      </div>
    );
  }

  // ---------- INTRO ----------
  if (!inSession) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-8 overflow-y-auto">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Heart className="w-8 h-8 text-rose-500 animate-pulse" />
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-rose-400 to-pink-500 bg-clip-text text-transparent">36 Questions</h1>
              <Heart className="w-8 h-8 text-rose-500 animate-pulse" />
            </div>
            <p className="text-gray-300 text-lg md:text-xl">A handwritten journey into intimacy</p>
          </div>

          {/* The Story */}
          <div className="bg-gradient-to-br from-slate-700/50 to-slate-600/30 border border-slate-600 rounded-2xl p-6 md:p-8 mb-8 backdrop-blur space-y-6">
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-white mb-3">🔬 The Science</h2>
              <p className="text-gray-300 leading-relaxed">
                In 1997, psychologist <strong>Arthur Aron</strong> studied how to build closeness between people. He found something remarkable: <strong>vulnerability builds connection faster than time ever could.</strong>
              </p>
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-white mb-3">📋 The Experiment</h2>
              <p className="text-gray-300 leading-relaxed">
                Aron paired complete strangers and had them ask each other 36 increasingly personal questions. After 45 minutes, the connection between strangers rivaled friendships built over years. The magic was in the <strong>mutual vulnerability</strong> the questions created.
              </p>
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-white mb-3">💕 For Couples</h2>
              <p className="text-gray-300 leading-relaxed">
                If these questions build intimacy between strangers in 45 minutes, imagine what they do for a couple who already loves each other. This isn't a quiz. <strong>It's about being truly seen.</strong>
              </p>
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-white mb-3">🗺️ The Three Phases</h2>
              <ul className="text-gray-300 space-y-2 ml-1">
                <li className="flex gap-2"><span>🌱</span><span><strong>Light:</strong> values, dreams, everyday life</span></li>
                <li className="flex gap-2"><span>💫</span><span><strong>Deeper:</strong> memories, fears, what matters most</span></li>
                <li className="flex gap-2"><span>🔥</span><span><strong>Deepest:</strong> your future, your past, your deepest truths</span></li>
              </ul>
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-white mb-3">📓 How It Works</h2>
              <p className="text-gray-300 leading-relaxed mb-3">
                <strong>Each of you keeps your own notebook.</strong> You'll write answers by hand and decorate the pages. This app just keeps you in sync and unlocks milestone activities along the way.
              </p>
              <ol className="text-gray-300 space-y-2 ml-1">
                <li className="flex gap-2"><span>1️⃣</span><span>See the question here</span></li>
                <li className="flex gap-2"><span>2️⃣</span><span>Each of you writes your answer</span></li>
                <li className="flex gap-2"><span>3️⃣</span><span>Both tap "I'm done"</span></li>
                <li className="flex gap-2"><span>4️⃣</span><span>Move to the next question together</span></li>
                <li className="flex gap-2"><span>5️⃣</span><span>Do the milestone activities when they unlock</span></li>
              </ol>
            </div>
            <div className="bg-rose-500/20 border border-rose-500 rounded-xl p-4">
              <p className="text-white text-center font-semibold">
                "The best conversations are the ones where you feel truly seen." — Arthur Aron
              </p>
            </div>
          </div>

          {/* Setup */}
          <div className="bg-gradient-to-br from-indigo-700/40 to-indigo-600/30 border border-indigo-500 rounded-2xl p-6 md:p-8 backdrop-blur">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-6 h-6 text-indigo-300" />
              <h2 className="text-2xl font-bold text-white">Start Together</h2>
            </div>
            <p className="text-indigo-200 text-sm mb-6">
              One of you creates a room and shares its name. The other joins with the same name — on any phone, anywhere.
            </p>

            {/* CREATE */}
            <div className="bg-slate-800/40 rounded-xl p-4 space-y-4 mb-5">
              <p className="text-white font-semibold flex items-center gap-2">🚪 Create a room</p>
              <div>
                <label className="block text-indigo-200 text-sm font-semibold mb-1">Your name</label>
                <input
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                  placeholder="e.g., Alex"
                  className="w-full px-4 py-3 rounded-lg bg-slate-700 border border-indigo-500/60 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-lg"
                />
              </div>
              <div>
                <label className="block text-indigo-200 text-sm font-semibold mb-1">Room name</label>
                <input
                  value={createRoom}
                  onChange={(e) => setCreateRoom(e.target.value.toLowerCase())}
                  placeholder="e.g., our-journey"
                  className="w-full px-4 py-3 rounded-lg bg-slate-700 border border-indigo-500/60 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-lg"
                />
                <p className="text-xs text-gray-400 mt-1">Pick something you'll both remember. Letters, numbers and hyphens.</p>
              </div>
              <button
                onClick={createSession}
                disabled={busy || !createName.trim() || !createRoom.trim()}
                className="w-full px-6 py-4 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 disabled:opacity-50 text-white font-bold text-lg rounded-xl transition-all shadow-lg"
              >
                Create room & start
              </button>
            </div>

            <div className="text-center text-gray-400 text-sm mb-5">— or —</div>

            {/* JOIN */}
            <div className="bg-slate-800/40 rounded-xl p-4 space-y-4">
              <p className="text-white font-semibold flex items-center gap-2">🔗 Join or rejoin a room</p>

              {!roomChoice ? (
                <>
                  <div>
                    <label className="block text-indigo-200 text-sm font-semibold mb-1">Room name</label>
                    <input
                      value={joinRoom}
                      onChange={(e) => { setJoinRoom(e.target.value.toLowerCase()); setJoinError(''); }}
                      placeholder="the exact name your partner made"
                      className="w-full px-4 py-3 rounded-lg bg-slate-700 border border-indigo-500/60 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-indigo-200 text-sm font-semibold mb-1">Your name <span className="text-gray-400 font-normal">(only if you're joining brand new)</span></label>
                    <input
                      value={joinName}
                      onChange={(e) => setJoinName(e.target.value)}
                      placeholder="e.g., Sam"
                      className="w-full px-4 py-3 rounded-lg bg-slate-700 border border-indigo-500/60 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-lg"
                    />
                  </div>
                  {joinError && <p className="text-sm text-amber-300 bg-amber-500/10 border border-amber-500/40 rounded-lg p-2">{joinError}</p>}
                  <button
                    onClick={lookupRoom}
                    disabled={busy || !joinRoom.trim()}
                    className="w-full px-6 py-4 bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 disabled:opacity-50 text-white font-bold text-lg rounded-xl transition-all shadow-lg"
                  >
                    Continue
                  </button>
                </>
              ) : (
                // CHOOSER: room already exists — pick who you are, don't overwrite.
                <div className="space-y-3">
                  <p className="text-indigo-100 text-sm">
                    Room <strong className="text-white">"{roomChoice.room}"</strong> is already going. Who are you?
                  </p>

                  {roomChoice.creator && (
                    <button
                      onClick={() => continueAs('creator')}
                      className="w-full text-left px-4 py-3 rounded-lg bg-slate-700 hover:bg-slate-600 border border-indigo-500/40 transition"
                    >
                      <span className="text-white font-semibold">Continue as {roomChoice.creator}</span>
                      <span className="block text-xs text-gray-400">started this room</span>
                    </button>
                  )}

                  {roomChoice.joiner && (
                    <button
                      onClick={() => continueAs('joiner')}
                      className="w-full text-left px-4 py-3 rounded-lg bg-slate-700 hover:bg-slate-600 border border-indigo-500/40 transition"
                    >
                      <span className="text-white font-semibold">Continue as {roomChoice.joiner}</span>
                      <span className="block text-xs text-gray-400">joined as the partner</span>
                    </button>
                  )}

                  {!roomChoice.joiner && (
                    <button
                      onClick={joinAsNewPartner}
                      disabled={busy}
                      className="w-full text-left px-4 py-3 rounded-lg bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 disabled:opacity-50 transition"
                    >
                      <span className="text-white font-semibold">Join as the partner{joinName.trim() ? ` (${joinName.trim()})` : ''}</span>
                      <span className="block text-xs text-indigo-100">this room is waiting for a second person</span>
                    </button>
                  )}

                  {joinError && <p className="text-sm text-amber-300 bg-amber-500/10 border border-amber-500/40 rounded-lg p-2">{joinError}</p>}

                  <button onClick={cancelChoice} className="w-full px-4 py-2 text-gray-400 hover:text-white text-sm transition">
                    ← back
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ---------- REWARD (shared) ----------
  if (rewardAt && REWARDS[rewardAt]) {
    const r = REWARDS[rewardAt];
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-900 via-slate-900 to-slate-900 flex items-center justify-center p-4 overflow-y-auto">
        <Confetti isActive={showConfetti} />
        <div className="bg-gradient-to-br from-rose-600/40 to-pink-600/30 border-2 border-rose-400 rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl text-center backdrop-blur">
          <div className="text-5xl mb-3">{r.icon}</div>
          <p className="uppercase tracking-widest text-rose-200 text-xs font-bold mb-1">Milestone unlocked</p>
          <h2 className="text-3xl font-bold text-white mb-4">{r.title}</h2>
          <div className="bg-black/20 rounded-2xl p-5 text-left mb-6">
            <h3 className="text-xl font-bold text-white mb-2">{r.activity}</h3>
            <p className="text-white/90 text-sm mb-4">{r.description}</p>
            <p className="text-white/80 text-xs mb-2"><strong>How to do it:</strong> {r.details}</p>
            <p className="text-white/80 text-xs"><strong>Time:</strong> {r.time}</p>
          </div>
          <p className="text-white/90 mb-6 text-sm">Do this together and capture it in your notebooks. 💕</p>
          <button
            onClick={dismissReward}
            className="w-full px-8 py-4 bg-white text-rose-600 font-bold rounded-xl hover:bg-gray-100 transition-all"
          >
            {current >= TOTAL ? 'Finish →' : 'Continue →'}
          </button>
        </div>
      </div>
    );
  }

  // ---------- COMPLETE (shared) ----------
  if (current >= TOTAL) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="bg-gradient-to-br from-rose-600/30 to-pink-600/30 border-2 border-rose-500 rounded-3xl p-8 md:p-12 max-w-md shadow-2xl text-center backdrop-blur">
          <div className="mb-6 text-6xl">💕</div>
          <h3 className="text-4xl font-bold text-white mb-4">You did it!</h3>
          <p className="text-gray-200 mb-4 text-lg">36 questions. All written. All discussed.</p>
          <p className="text-white/80 mb-8">
            Your notebooks are now a map of your hearts. Hold onto them. And go celebrate — you earned that weekend away.
          </p>
          <div className="space-y-3">
            <button onClick={startOver} className="w-full px-8 py-4 bg-white text-rose-600 font-bold rounded-xl hover:bg-gray-100 transition-all">
              Start again
            </button>
            <button onClick={leave} className="w-full px-8 py-3 bg-slate-700/60 text-gray-200 font-semibold rounded-xl hover:bg-slate-600 transition-all">
              Leave room
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ---------- QUESTION ----------
  const phase = PHASE_META[currentQuestion.phase];
  const pct = Math.round((completedCount / TOTAL) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-8 overflow-y-auto">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={leave} className="flex items-center gap-2 px-3 py-2 bg-slate-700/50 hover:bg-slate-600 text-gray-300 rounded-lg transition text-sm">
            <Home className="w-4 h-4" /> Leave
          </button>
          <div className="flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-rose-500" />
            <h1 className="text-xl md:text-2xl font-bold text-white">36 Questions</h1>
          </div>
          <button onClick={copyRoom} className="flex items-center gap-1.5 px-3 py-2 bg-slate-700/50 hover:bg-slate-600 text-gray-300 rounded-lg transition text-sm" title="Copy room name">
            <Copy className="w-4 h-4" /> {copied ? 'Copied' : 'Room'}
          </button>
        </div>

        {/* Presence bar */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 mb-4 flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-gray-200">
            <span className="text-emerald-400">●</span> {myName} <span className="text-gray-500">(you)</span>
          </div>
          <div className="flex items-center gap-2 text-gray-200">
            {partnerPresent ? (
              <><span className="text-emerald-400">●</span> {partnerName}</>
            ) : (
              <><span className="text-amber-400 animate-pulse">○</span> <span className="text-amber-300">waiting for partner…</span></>
            )}
          </div>
        </div>

        {/* Waiting-for-join callout */}
        {!partnerPresent && (
          <div className="bg-amber-500/10 border border-amber-500/50 rounded-xl p-4 mb-4">
            <p className="text-amber-200 text-sm">
              Share your room name <strong className="text-white">"{identity.room}"</strong> with your partner. They open the app, tap <em>Join room</em>, and enter the same name. You can start reading question 1 now — you'll stay in sync automatically.
            </p>
          </div>
        )}

        {/* Progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
            <span>Question {current + 1} of {TOTAL}</span>
            <span className={phase.color}>{phase.emoji} {phase.label}</span>
            <span>{completedCount} done · {pct}%</span>
          </div>
          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-rose-500 to-pink-500 transition-all duration-500" style={{ width: `${pct}%` }} />
          </div>
        </div>

        {/* Question card */}
        <div className="bg-gradient-to-br from-slate-700/50 to-slate-600/30 border border-slate-600 rounded-2xl p-6 md:p-8 mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-white leading-relaxed text-center">
            {currentQuestion.text}
          </h2>
        </div>

        {/* Timer */}
        {useTimer ? (
          <div className="mb-6">
            <div className={`rounded-xl p-5 text-center border-2 ${!timerActive ? 'border-slate-600 bg-slate-700/30' : timerRemaining > 60 ? 'border-emerald-500 bg-emerald-500/10' : timerRemaining > 10 ? 'border-yellow-500 bg-yellow-500/10' : 'border-red-500 bg-red-500/10 animate-pulse'}`}>
              <p className="text-xs text-gray-300 mb-1 flex items-center justify-center gap-1">
                <Clock className="w-3.5 h-3.5" /> {timerActive ? 'Time remaining' : 'Timer paused'}
              </p>
              <div className={`text-4xl font-bold font-mono ${!timerActive ? 'text-gray-300' : timerRemaining > 60 ? 'text-emerald-400' : timerRemaining > 10 ? 'text-yellow-400' : 'text-red-400'}`}>
                {fmt(timerRemaining)}
              </div>
              <div className="flex gap-2 mt-3 justify-center">
                <button onClick={() => setTimerActive(!timerActive)} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm font-semibold rounded-lg">
                  {timerActive ? 'Pause' : (timerRemaining === 0 ? 'Restart' : 'Start')}
                </button>
                <button onClick={() => { setTimerRemaining(15 * 60); setTimerActive(false); }} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm font-semibold rounded-lg">
                  Reset
                </button>
                <button onClick={disableTimer} className="px-4 py-2 bg-slate-700/60 hover:bg-slate-600 text-gray-300 text-sm font-semibold rounded-lg">
                  Turn off
                </button>
              </div>
            </div>
          </div>
        ) : (
          <button onClick={enableTimer} className="w-full mb-6 px-4 py-3 bg-slate-800/50 border border-slate-700 hover:border-indigo-500 text-gray-300 rounded-xl text-sm transition flex items-center justify-center gap-2">
            <Clock className="w-4 h-4" /> Add a 15-minute timer for this question (optional)
          </button>
        )}

        {/* Done status — two clear rows */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 mb-4 space-y-2">
          <div className={`flex items-center justify-between rounded-lg px-3 py-2 ${iAmDone ? 'bg-emerald-500/15' : 'bg-slate-700/40'}`}>
            <span className="text-gray-200 text-sm">{myName} (you)</span>
            <span className={`text-sm font-semibold ${iAmDone ? 'text-emerald-300' : 'text-gray-400'}`}>
              {iAmDone ? '✓ Done' : 'Writing…'}
            </span>
          </div>
          <div className={`flex items-center justify-between rounded-lg px-3 py-2 ${partnerDone ? 'bg-emerald-500/15' : 'bg-slate-700/40'}`}>
            <span className="text-gray-200 text-sm">{partnerPresent ? partnerName : 'Partner'}</span>
            <span className={`text-sm font-semibold ${partnerDone ? 'text-emerald-300' : 'text-gray-400'}`}>
              {partnerDone ? '✓ Done' : partnerPresent ? 'Writing…' : 'Not joined'}
            </span>
          </div>
        </div>

        {/* Primary action */}
        {!iAmDone ? (
          <button
            onClick={toggleMyDone}
            className="w-full mb-3 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-bold py-4 rounded-xl transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2 text-lg shadow-lg"
          >
            <Check className="w-6 h-6" /> I'm done writing
          </button>
        ) : (
          <div className="mb-3">
            {bothDone ? (
              <button
                onClick={goNext}
                className="w-full bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white font-bold py-4 rounded-xl transition-all transform hover:scale-[1.02] text-lg shadow-lg"
              >
                {REWARDS[current + 1] ? '🎉 Both done — unlock milestone →' : 'Both done — next question →'}
              </button>
            ) : (
              <div className="w-full bg-emerald-500/10 border border-emerald-500/40 text-emerald-200 font-semibold py-4 rounded-xl text-center">
                ✓ You're done — waiting for {partnerPresent ? partnerName : 'your partner'}…
              </div>
            )}
            <button
              onClick={toggleMyDone}
              className="w-full mt-2 text-gray-400 hover:text-white text-sm py-2 flex items-center justify-center gap-1.5 transition"
            >
              <Undo2 className="w-4 h-4" /> Not yet — I need more time
            </button>
          </div>
        )}

        {/* Back */}
        {current > 0 && (
          <button
            onClick={goPrevious}
            className="w-full flex items-center justify-center gap-2 bg-slate-800/50 hover:bg-slate-700 text-gray-300 font-semibold py-3 rounded-xl transition text-sm"
          >
            <ChevronLeft className="w-5 h-5" /> Previous question
          </button>
        )}

        <p className="text-center text-gray-500 text-xs mt-6">
          Room "{identity.room}" · your progress saves automatically · reopen any time to continue
        </p>
      </div>
    </div>
  );
};

export default NotebookApp;
