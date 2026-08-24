import React, { useState, useEffect } from 'react';
import { Heart, Flame, BookOpen, Check, ChevronRight, ChevronLeft, Clock, Users, Home } from 'lucide-react';
import { database } from './firebase';
import { ref, set, get, onValue, update } from 'firebase/database';

// ALL 36 ARTHUR ARON QUESTIONS
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

// LOCKED REWARDS (Tied to specific questions)
const REWARDS = {
  3: {
    title: "First Spark",
    activity: "Movie Night - Before Sunrise (1995)",
    description: "Watch a couple walk through Vienna talking about life, love, and dreams. Exactly what you're doing.",
    details: "Set up at home with blankets and tea. Watch together (1.5 hrs), sit 10 min in silence after, then discuss what resonated. Decorate your notebooks with a movie still or inspired drawing.",
    img: "https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?w=400",
    time: "2 hours",
    icon: "🎬"
  },
  6: {
    title: "Growing Close",
    activity: "Create a Couples Playlist (10 Songs)",
    description: "Each pick 5 songs that remind you of them. Listen together. Write down why each song matters.",
    details: "Sit together, each independently pick 5 songs that remind you of them or express how you feel. Present them one by one, play 30 sec each, explain why. Listen to all 10 together. Write in your notebooks: 'Our 10 Songs' with the stories.",
    img: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400",
    time: "1.5-2 hours",
    icon: "🎵"
  },
  11: {
    title: "Mystery Gift",
    activity: "Exchange Mystery Gifts (₹500)",
    description: "Pick something small, personal, mysterious. Wrap it. Exchange with no hints. Open together and share why you chose it.",
    details: "Each of you secretly buys something for the other (budget: ₹500 max). It can be anything: a book that reminds you of them, a candle with their favorite scent, a small item from a place you both love, something useful they need, a funny token, anything. Wrap it thoughtfully. Pick a cozy moment (tea time, evening). Sit together, exchange gifts without revealing why. Open slowly. Share the story: why you chose this, what it means, what you hope it reminds them of. Take a photo of both gifts together for your notebooks with the story written next to it.",
    img: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400",
    time: "30-45 minutes",
    icon: "🎁"
  },
  17: {
    title: "Deep Conversations",
    activity: "Board Game Night (Candlelit)",
    description: "Set up the intimate space with candles and soft music. Play your favorite board game together.",
    details: "Setup: Private room, dim lights completely, light 3-4 candles, soft instrumental music playing quietly, tea/coffee nearby, comfortable seating. Then: Choose a board game you both enjoy (Scrabble, Chess, Monopoly, Ludo, any game). Play for 2-3 hours in this candlelit setting. Compete, laugh, have fun. No pressure. Just playful connection. The atmosphere makes it intimate even though you're playing a game. Take photos, paste in notebooks with notes about who won and what made you laugh.",
    img: "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=400",
    time: "2-3 hours",
    icon: "🎲"
  },
  22: {
    title: "Creating Together",
    activity: "Creative Photo Shoot - Dress Up & Play",
    description: "Dress up. Go outdoors. Create fun, playful, ridiculous photos together. Superhero poses, jumping, running, anything creative.",
    details: "Dress up however makes you feel awesome (matching outfits, costumes, formal wear, whatever). Pick an outdoor location with good backdrops that you love. Get creative with poses: superhero landings, jumping mid-air, running, dancing, sitting on shoulders, piggyback rides, pretend to be models, do silly faces, create action shots. Have FUN. No poses need to be perfect or flattering—the goal is laughter and playfulness. Take 50+ photos. Pick your 5-10 favorites (include the silly ones!). Paste in notebooks with captions: 'We were ridiculous and loved it' or jokes about the photos.",
    img: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400",
    time: "2-3 hours",
    icon: "📸"
  },
  24: {
    title: "Opening Up",
    activity: "Sunset from Your Rooftop (No Phones)",
    description: "Watch the sky change colors. No distractions. Just you, each other, and the quiet.",
    details: "Go to rooftop 30 min before sunset. Sit side by side (not facing). Watch the colors: orange → pink → purple → dark. Feel the temperature drop. After sunset, sit 5 more minutes in silence. Then discuss: What did you notice? How did it feel? Take 1-2 photos for your notebooks.",
    img: "https://images.unsplash.com/photo-1495573513697-74d440642117?w=400",
    time: "1 hour",
    icon: "🌅"
  },
  28: {
    title: "Visualize Together",
    activity: "Create a Couple Vision Board",
    description: "Cut out images, words, dreams. Glue together. Visualize your future on paper. Hang it daily.",
    details: "Brainstorm future together (30 min): home, travel, activities, dreams, lifestyle. Gather images from magazines/internet (1 hr). Create on poster board: arrange images before gluing, add words/quotes, leave white space, display daily.",
    img: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400",
    time: "3-4 hours",
    icon: "🎨"
  },
  36: {
    title: "Completely Connected",
    activity: "Book Your Weekend Getaway",
    description: "Celebrate completing all 36 questions. A weekend away. Just you two. Victory lap.",
    details: "Choose any destination you both want to visit. Book a place you love. Spend time away: explore together, have special meals, sleep in, stay present with each other. Collect memories: photos, tickets, receipts. Write in your notebooks about the getaway.",
    img: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400",
    time: "Weekend getaway",
    icon: "🏨"
  }
};

// INSPIRATION VISUALS BY PHASE (Built-in SVG/Graphics)
const PHASE_VISUALS = {
  1: [
    { emoji: "🌱", title: "New Beginning", color: "from-green-400 to-green-600" },
    { emoji: "💫", title: "Connection", color: "from-blue-400 to-blue-600" },
    { emoji: "🤝", title: "Together", color: "from-purple-400 to-purple-600" },
  ],
  2: [
    { emoji: "🌊", title: "Going Deeper", color: "from-indigo-400 to-indigo-600" },
    { emoji: "🔥", title: "Passion", color: "from-orange-400 to-orange-600" },
    { emoji: "💭", title: "Thoughts", color: "from-pink-400 to-pink-600" },
  ],
  3: [
    { emoji: "💞", title: "Love", color: "from-rose-400 to-rose-600" },
    { emoji: "🌟", title: "Shine", color: "from-yellow-400 to-yellow-600" },
    { emoji: "♾️", title: "Forever", color: "from-red-400 to-red-600" },
  ],
};

const Confetti = ({ isActive }) => {
  const confetti = Array.from({ length: 30 }).map((_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 0.5,
  }));

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {confetti.map(item => (
        <div
          key={item.id}
          className="absolute w-2 h-2"
          style={{
            left: `${item.left}%`,
            top: '-10px',
            animation: `fall ${2 + Math.random() * 1}s linear forwards`,
            animationDelay: `${item.delay}s`,
            backgroundColor: ['#ec4899', '#f87171', '#fbbf24', '#60a5fa', '#8b5cf6'][Math.floor(Math.random() * 5)],
            borderRadius: '50%',
          }}
        >
          {Math.random() > 0.5 ? '💗' : '✨'}
        </div>
      ))}
      <style>{`
        @keyframes fall {
          to {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

const Timer = ({ duration, onComplete }) => {
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    if (timeLeft <= 0) {
      onComplete();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onComplete]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className={`text-center py-4 rounded-lg ${timeLeft <= 10 ? 'bg-red-500/30 border border-red-500' : 'bg-blue-500/20 border border-blue-500'}`}>
      <div className="flex items-center justify-center gap-2 mb-2">
        <Clock className="w-5 h-5 text-white" />
        <p className="text-white font-semibold">Time to answer:</p>
      </div>
      <p className={`text-4xl font-bold tabular-nums ${timeLeft <= 10 ? 'text-red-400 animate-pulse' : 'text-white'}`}>
        {minutes}:{seconds.toString().padStart(2, '0')}
      </p>
    </div>
  );
};

const NotebookApp = () => {
  // CORE STATE
  const [screen, setScreen] = useState('intro');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answered, setAnswered] = useState(new Set());
  const [confirmedBy, setConfirmedBy] = useState({}); // Track who confirmed each question
  const [showReward, setShowReward] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  
  // SESSION STATE
  const [sessionCode, setSessionCode] = useState('');
  const [userName, setUserName] = useState('');
  const [creatorInputName, setCreatorInputName] = useState(''); // Separate input for "I'll Start First"
  const [joinerInputName, setJoinerInputName] = useState(''); // Separate input for "Join Session"
  const [userRole, setUserRole] = useState(null);
  const [sessionActive, setSessionActive] = useState(false);
  const [partnerJoined, setPartnerJoined] = useState(false);
  const [creatorName, setCreatorName] = useState('');
  const [joinerName, setJoinerName] = useState('');
  
  // TIMER STATE
  const [timerActive, setTimerActive] = useState(false);
  const [useTimer, setUseTimer] = useState(false);
  const [timerDuration] = useState(15 * 60);
  const [sessionLoaded, setSessionLoaded] = useState(false);

  // Load from Firebase on mount
  useEffect(() => {
    const sessionCodeLocal = localStorage.getItem('36q-session-code');
    if (sessionCodeLocal) {
      setSessionCode(sessionCodeLocal);
      const sessionRef = ref(database, `sessions/${sessionCodeLocal}`);
      const unsubscribe = onValue(sessionRef, (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          setCurrentQuestionIndex(data.currentQuestionIndex || 0);
          setAnswered(new Set(data.answered || []));
          setConfirmedBy(data.confirmedBy || {});
          setUserName(localStorage.getItem('36q-user-name') || '');
          setUserRole(localStorage.getItem('36q-user-role') || null);
          setSessionActive(true);
          setPartnerJoined(data.partnerJoined || false);
          setUseTimer(data.useTimer || false);
          setCreatorName(data.creator || '');
          setJoinerName(data.joiner || '');
        }
      });
      return () => unsubscribe();
    }
  }, []);

  // Listen to Firebase whenever sessionCode changes (for User 2 joining)
  useEffect(() => {
    if (sessionActive && sessionCode && sessionCode.length === 6) {
      const sessionRef = ref(database, `sessions/${sessionCode}`);
      const unsubscribe = onValue(sessionRef, (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          setCurrentQuestionIndex(data.currentQuestionIndex || 0);
          setAnswered(new Set(data.answered || []));
          setConfirmedBy(data.confirmedBy || {});
          setPartnerJoined(data.partnerJoined || false);
          setUseTimer(data.useTimer || false);
          setCreatorName(data.creator || '');
          setJoinerName(data.joiner || '');
        }
      });
      return () => unsubscribe();
    }
  }, [sessionActive, sessionCode]);

  // Save to Firebase
  useEffect(() => {
    if (sessionActive && sessionCode) {
      const data = {
        currentQuestionIndex,
        answered: Array.from(answered),
        confirmedBy,
        partnerJoined,
        useTimer,
        updatedAt: new Date().toISOString(),
      };
      const sessionRef = ref(database, `sessions/${sessionCode}`);
      update(sessionRef, data).catch(err => console.log('Save error:', err));
    }
  }, [currentQuestionIndex, answered, confirmedBy, sessionActive, sessionCode, partnerJoined, useTimer]);

  const generateSessionCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const handleCreateSession = () => {
    const code = generateSessionCode();
    localStorage.setItem('36q-session-code', code);
    localStorage.setItem('36q-user-name', creatorInputName);
    localStorage.setItem('36q-user-role', 'creator');
    setSessionCode(code);
    setUserRole('creator');
    setCreatorName(creatorInputName); // Store creator's name
    setSessionActive(true);
    setScreen('question');
    // Create session in Firebase
    const sessionRef = ref(database, `sessions/${code}`);
    set(sessionRef, {
      creator: creatorInputName,
      currentQuestionIndex: 0,
      answered: [],
      confirmedBy: {},
      partnerJoined: false,
      useTimer: false,
      createdAt: new Date().toISOString(),
    });
  };

  const handleJoinSession = () => {
    const trimmedCode = sessionCode.trim().toUpperCase();
    
    localStorage.setItem('36q-session-code', trimmedCode);
    localStorage.setItem('36q-user-name', joinerInputName);
    localStorage.setItem('36q-user-role', 'joiner');
    
    setUserRole('joiner');
    setSessionCode(trimmedCode);
    setSessionActive(true);
    setPartnerJoined(true);
    setJoinerName(joinerInputName);
    
    // Load existing session from Firebase
    const sessionRef = ref(database, `sessions/${trimmedCode}`);
    const unsubscribe = onValue(sessionRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        setCreatorName(data.creator || '');
        setCurrentQuestionIndex(data.currentQuestionIndex || 0);
        setAnswered(new Set(data.answered || []));
        setConfirmedBy(data.confirmedBy || {});
        setUseTimer(data.useTimer || false);
        
        // Update Firebase with joiner's name
        update(sessionRef, {
          joiner: joinerInputName,
          partnerJoined: true,
        });
      }
    });
    
    setScreen('question');
    return unsubscribe;
  };

  const currentQuestion = QUESTIONS[currentQuestionIndex];
  const progressPercent = (answered.size / QUESTIONS.length) * 100;
  const affectionLevel = Math.floor((answered.size / QUESTIONS.length) * 100);

  const handleAnswered = () => {
    // Track that this user has confirmed for this question
    const questionKey = `q-${currentQuestionIndex}`;
    const newConfirmedBy = { ...confirmedBy };
    
    if (!newConfirmedBy[questionKey]) {
      newConfirmedBy[questionKey] = [];
    }
    
    // Get the name stored in localStorage (set when creating/joining)
    const myName = localStorage.getItem('36q-user-name') || 'Partner';
    
    // Add current user to confirmed list if not already there
    if (myName && !newConfirmedBy[questionKey].includes(myName)) {
      newConfirmedBy[questionKey].push(myName);
    }
    
    setConfirmedBy(newConfirmedBy);
    
    // Check if both partners (creator and joiner) have confirmed
    const hasCreator = newConfirmedBy[questionKey].some(name => name !== '' && name !== null);
    const hasJoiner = newConfirmedBy[questionKey].length >= 2;
    
    // Only proceed if BOTH have confirmed
    if (!hasJoiner) {
      // Not ready yet - wait for partner
      return;
    }
    
    // Both have confirmed! Mark as answered and progress
    const newAnswered = new Set(answered);
    newAnswered.add(currentQuestionIndex);
    setAnswered(newAnswered);

    // Check if this question has a reward
    const questionNumber = currentQuestionIndex + 1;
    if (REWARDS[questionNumber]) {
      setShowReward(REWARDS[questionNumber]);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2000);
      setScreen('reward');
      return;
    }

    // Move to next question or complete
    if (currentQuestionIndex < QUESTIONS.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      // Reset confirmations for new question
      const updatedConfirmed = { ...newConfirmedBy };
      delete updatedConfirmed[questionKey];
      setConfirmedBy(updatedConfirmed);
      setScreen('question');
    } else {
      setScreen('complete');
    }
  };

  // INTRO SCREEN
  if (screen === 'intro') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-8 overflow-y-auto">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Heart className="w-8 h-8 text-rose-500 animate-pulse" />
              <h1 className="text-5xl font-bold bg-gradient-to-r from-rose-400 to-pink-500 bg-clip-text text-transparent">36 Questions</h1>
              <Heart className="w-8 h-8 text-rose-500 animate-pulse" />
            </div>
            <p className="text-gray-300 text-xl">A handwritten journey into intimacy</p>
          </div>

          {/* The Story */}
          <div className="bg-gradient-to-br from-slate-700/50 to-slate-600/30 border border-slate-600 rounded-2xl p-8 mb-8 backdrop-blur space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-3">🔬 The Science</h2>
              <p className="text-gray-300 leading-relaxed">
                In 1997, psychologist <strong>Arthur Aron</strong> conducted a groundbreaking study on building interpersonal closeness. He discovered something remarkable: <strong>vulnerability builds connection faster than time ever could.</strong>
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white mb-3">📋 The Experiment</h2>
              <p className="text-gray-300 leading-relaxed">
                Aron brought together pairs of complete strangers and had them ask each other 36 increasingly personal questions. After 45 minutes of conversation, the emotional connection between strangers rivaled that of friends who'd known each other for years.
              </p>
              <p className="text-gray-300 leading-relaxed mt-3">
                The magic wasn't in the questions themselves—it was in the <strong>mutual vulnerability</strong> and <strong>structured honesty</strong> they created.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white mb-3">💕 For Couples</h2>
              <p className="text-gray-300 leading-relaxed">
                If these questions can build intimacy between strangers in 45 minutes, imagine what they can do for a couple who already loves each other. This isn't a quiz. It's not about "winning." <strong>It's about being truly seen.</strong>
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white mb-3">🗺️ The Three Phases</h2>
              <ul className="text-gray-300 space-y-2 ml-4">
                <li className="flex gap-2"><span>🌱</span> <span><strong>Phase 1 (Light):</strong> Getting to know each other's values, dreams, and everyday life</span></li>
                <li className="flex gap-2"><span>💫</span> <span><strong>Phase 2 (Deeper):</strong> Exploring memories, accomplishments, fears, and what matters most</span></li>
                <li className="flex gap-2"><span>🔥</span> <span><strong>Phase 3 (Deepest):</strong> Complete vulnerability about your future, your past, and your deepest truths</span></li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white mb-3">📓 How This Works</h2>
              <p className="text-gray-300 leading-relaxed mb-3">
                <strong>Each of you has your own notebook.</strong> You'll write answers by hand. Decorate with photos. Sketches. Notes. Over 36 conversations, your notebooks become a visual record of your journey into each other.
              </p>
              <ol className="text-gray-300 space-y-2 ml-4">
                <li className="flex gap-2"><span>1️⃣</span> <span>See the question here</span></li>
                <li className="flex gap-2"><span>2️⃣</span> <span>Write your answer in your notebook</span></li>
                <li className="flex gap-2"><span>3️⃣</span> <span>Partner writes their answer</span></li>
                <li className="flex gap-2"><span>4️⃣</span> <span>Both click "I'm Done" to unlock the next question</span></li>
                <li className="flex gap-2"><span>5️⃣</span> <span>Unlock and do the reward activity together</span></li>
                <li className="flex gap-2"><span>6️⃣</span> <span>Decorate notebooks with photos & memories</span></li>
              </ol>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white mb-3">✨ Why Handwriting?</h2>
              <p className="text-gray-300 leading-relaxed">
                Handwriting is intimate. It's slower. It's permanent. It's yours. Years from now, you'll hold these notebooks and remember what you wrote, how your handwriting shook with vulnerability, where you were sitting. <strong>This app tracks progress. Your real conversation lives on paper.</strong>
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white mb-3">⚠️ Some Questions Will Be Tough</h2>
              <p className="text-gray-300 leading-relaxed mb-3">
                <strong>This is intentional.</strong> Some questions will make you uncomfortable. They'll ask about death, regret, embarrassment, and pain. You won't be able to skip them—and that's the point.
              </p>
              <p className="text-gray-300 leading-relaxed mb-3">
                But Aron's research proves this: <strong>vulnerability is the accelerant.</strong> When you answer honestly about hard things, your partner sees the real you. And when they respond with compassion instead of judgment, intimacy explodes.
              </p>
              <p className="text-gray-300 leading-relaxed">
                The discomfort isn't a bug. <strong>It's the mechanism.</strong> Stay with it. Answer truthfully. Listen without fixing. This is how two people become truly close.
              </p>
            </div>

            <div className="bg-rose-500/20 border border-rose-500 rounded-xl p-4">
              <p className="text-white text-center font-semibold">
                "The best conversations are the ones where you feel truly seen." — Arthur Aron
              </p>
            </div>
          </div>

          {/* Session Setup */}
          <div className="bg-gradient-to-br from-indigo-700/40 to-indigo-600/30 border border-indigo-500 rounded-2xl p-8 mb-8 backdrop-blur">
            <div className="flex items-center gap-2 mb-6">
              <Users className="w-6 h-6 text-indigo-300" />
              <h2 className="text-2xl font-bold text-white">Start Together</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-indigo-200 font-semibold mb-2">Your Name</label>
                <input
                  type="text"
                  value={creatorInputName}
                  onChange={(e) => setCreatorInputName(e.target.value)}
                  placeholder="Your name"
                  className="w-full px-4 py-3 rounded-lg bg-slate-700 border border-indigo-500 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <button
                onClick={handleCreateSession}
                disabled={!creatorInputName}
                className="w-full px-6 py-3 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 disabled:from-slate-600 disabled:to-slate-600 text-white font-bold rounded-lg transition-all transform hover:scale-105 disabled:cursor-not-allowed"
              >
                I'll Start First
              </button>

              <div className="text-center text-gray-400 text-sm">or</div>

              <div className="bg-slate-700/50 rounded-xl p-4 space-y-4">
                <p className="text-indigo-200 font-semibold text-center">Join Your Partner's Session</p>
                <div>
                  <label className="block text-indigo-200 font-semibold mb-2">Your Name</label>
                  <input
                    type="text"
                    value={joinerInputName}
                    onChange={(e) => setJoinerInputName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full px-4 py-3 rounded-lg bg-slate-700 border border-indigo-500 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-indigo-200 font-semibold mb-2">Session Code</label>
                  <input
                    type="text"
                    value={sessionCode}
                    onChange={(e) => setSessionCode(e.target.value.toUpperCase())}
                    placeholder="e.g., A1B2C3"
                    className="w-full px-4 py-3 rounded-lg bg-slate-700 border border-indigo-500 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 uppercase text-center text-2xl font-bold tracking-widest"
                  />
                </div>

                <button
                  onClick={handleJoinSession}
                  disabled={!joinerInputName || sessionCode.length !== 6}
                  className="w-full px-6 py-3 bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 disabled:from-slate-600 disabled:to-slate-600 text-white font-bold rounded-lg transition-all transform hover:scale-105 disabled:cursor-not-allowed"
                >
                  Join Session
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // QUESTION SCREEN
  if (screen === 'question') {
    const phaseVisuals = PHASE_VISUALS[currentQuestion?.phase] || [];
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-8 overflow-y-auto">
        <div className="max-w-3xl mx-auto">
          
          {/* Header with Home Button */}
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={() => {
                localStorage.removeItem('36q-session-code');
                localStorage.removeItem('36q-user-name');
                localStorage.removeItem('36q-user-role');
                setScreen('intro');
                setSessionActive(false);
                setSessionCode('');
                setUserName('');
                setUserRole(null);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-slate-700/50 hover:bg-slate-600 text-gray-300 rounded-lg transition"
              title="Return to home"
            >
              <Home className="w-5 h-5" />
              <span className="text-sm">Home</span>
            </button>

            <div className="flex-1 text-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                <BookOpen className="w-7 h-7 text-rose-500" />
                <h1 className="text-3xl font-bold text-white">36 Questions</h1>
                <BookOpen className="w-7 h-7 text-rose-500" />
              </div>
              
              {sessionActive && (
                <div className="flex justify-center gap-6 text-sm text-gray-400 mb-4">
                  <div>👤 {creatorName || 'Creator'} & {joinerName || 'Partner'}</div>
                  <div>🔐 {sessionCode}</div>
                </div>
              )}
            </div>

            <div className="w-16"></div>
          </div>

          {/* Progress */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-slate-700/30 border border-slate-600 rounded-lg p-3 text-center">
              <p className="text-xs text-gray-400">Progress</p>
              <p className="text-xl font-bold text-white">{answered.size}/36</p>
            </div>
            <div className="bg-slate-700/30 border border-slate-600 rounded-lg p-3 text-center">
              <p className="text-xs text-gray-400">Phase</p>
              <p className="text-lg font-bold text-rose-400">
                {currentQuestion.phase === 1 && "🌱"}
                {currentQuestion.phase === 2 && "💫"}
                {currentQuestion.phase === 3 && "🔥"}
              </p>
            </div>
            <div className="bg-slate-700/30 border border-slate-600 rounded-lg p-3 text-center">
              <p className="text-xs text-gray-400">Connection</p>
              <p className="text-xl font-bold text-white">{affectionLevel}%</p>
            </div>
          </div>

          {/* Timer */}
          {timerActive && useTimer && (
            <div className="mb-8">
              <Timer 
                duration={timerDuration}
                onComplete={() => setTimerActive(false)}
              />
            </div>
          )}

          {/* Inspiration Photos */}
          <div className="mb-8">
            <p className="text-xs text-gray-400 mb-3 uppercase font-semibold">Inspiration for your notebooks</p>
            {phaseVisuals && phaseVisuals.length > 0 ? (
              <div className="grid grid-cols-3 gap-3 mb-8">
                {phaseVisuals.map((visual, i) => (
                  <div
                    key={i}
                    className={`bg-gradient-to-br ${visual.color} rounded-lg p-4 flex flex-col items-center justify-center h-24 shadow-lg`}
                  >
                    <div className="text-3xl mb-2">{visual.emoji}</div>
                    <p className="text-white text-xs font-semibold text-center">{visual.title}</p>
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          {/* Question Card */}
          <div className="bg-gradient-to-br from-slate-700/50 to-slate-600/30 border-2 border-slate-600 rounded-2xl p-8 mb-8 shadow-2xl backdrop-blur">
            <div className="flex justify-between items-start mb-6">
              <span className={`px-4 py-2 rounded-full text-sm font-semibold text-white backdrop-blur
                ${currentQuestion.phase === 1 ? 'bg-blue-500/40' : ''}
                ${currentQuestion.phase === 2 ? 'bg-purple-500/40' : ''}
                ${currentQuestion.phase === 3 ? 'bg-rose-500/40' : ''}
              `}>
                {currentQuestion.phase === 1 && "🌱 Light"}
                {currentQuestion.phase === 2 && "💫 Deeper"}
                {currentQuestion.phase === 3 && "🔥 Deepest"}
              </span>
              <span className="text-sm font-semibold text-gray-400">#{currentQuestionIndex + 1}/36</span>
            </div>

            <h2 className="text-3xl md:text-4xl font-bold text-white leading-relaxed text-center mb-8">
              {currentQuestion.text}
            </h2>

            {/* Instructions */}
            <div className="bg-indigo-500/20 border border-indigo-500 rounded-xl p-6">
              <p className="text-indigo-200 font-semibold mb-3">📓 What to do:</p>
              <ol className="text-indigo-100 space-y-2 text-sm">
                <li>1. <strong>You:</strong> Write your answer in your notebook</li>
                <li>2. <strong>Your partner:</strong> Reads the question, adds their answer</li>
                <li>3. <strong>You both:</strong> Click "I'm Done" when ready to move forward</li>
                <li>4. <strong>Note:</strong> You can go back, but not skip ahead</li>
              </ol>
            </div>
          </div>

          {/* Timer Toggle - First Question */}
          {currentQuestionIndex === 0 && !useTimer && sessionActive && (
            <div className="bg-blue-500/20 border border-blue-500 rounded-xl p-6 mb-8">
              <p className="text-blue-200 font-semibold mb-3">⏱️ Add a timer?</p>
              <p className="text-blue-100 text-sm mb-4">15 minutes per question to keep things moving and present.</p>
              <button
                onClick={() => {
                  setUseTimer(true);
                  setTimerActive(true);
                }}
                className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-all"
              >
                Yes, Start Timer
              </button>
            </div>
          )}

          {/* Confirmation Status */}
          {sessionActive && (
            <div className="mb-8">
              {(() => {
                const questionKey = `q-${currentQuestionIndex}`;
                const confirmedNames = confirmedBy[questionKey] || [];
                const bothConfirmed = confirmedNames.length >= 2;
                const myName = localStorage.getItem('36q-user-name') || 'You';
                
                return (
                  <div className={`rounded-xl p-4 border ${bothConfirmed ? 'bg-green-500/20 border-green-500' : 'bg-amber-500/20 border-amber-500'}`}>
                    <p className="font-semibold mb-3 text-white">
                      {bothConfirmed ? '✅ Both Answered!' : '⏳ Waiting for Confirmation'}
                    </p>
                    <div className="space-y-2 text-sm">
                      <div className={`flex items-center gap-2 ${confirmedNames.includes(myName) ? 'text-green-200' : 'text-amber-200'}`}>
                        {confirmedNames.includes(myName) ? '✓' : '○'} You ({myName})
                      </div>
                      <div className={`flex items-center gap-2 ${confirmedNames.length >= 2 && !confirmedNames.includes(myName) ? 'text-green-200' : 'text-amber-200'}`}>
                        {confirmedNames.length >= 2 && !confirmedNames.includes(myName) ? '✓' : '○'} Your Partner ({creatorName && joinerName ? (userRole === 'creator' ? joinerName : creatorName) : 'waiting...'})
                      </div>
                    </div>
                    {!bothConfirmed && (
                      <p className="text-xs text-amber-100 mt-3">
                        💕 Both partners need to click "I'm Done" before you can continue.
                      </p>
                    )}
                  </div>
                );
              })()}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 mb-8">
            {currentQuestionIndex > 0 && (
              <button
                onClick={() => setCurrentQuestionIndex(currentQuestionIndex - 1)}
                className="flex-1 flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-3 rounded-lg transition-all"
              >
                <ChevronLeft className="w-5 h-5" /> Previous
              </button>
            )}
            
            <button
              onClick={handleAnswered}
              className="flex-1 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-bold py-3 rounded-lg transition-all transform hover:scale-105 flex items-center justify-center gap-2"
            >
              <Check className="w-5 h-5" /> I'm Done
            </button>
          </div>
        </div>
      </div>
    );
  }

  // REWARD SCREEN
  if (screen === 'reward' && showReward) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4 overflow-y-auto">
        <Confetti isActive={showConfetti} />
        
        <div className="max-w-md w-full">
          <div className="bg-gradient-to-br from-rose-600 to-pink-600 rounded-3xl p-12 shadow-2xl text-center">
            <div className="text-6xl mb-4">{showReward.icon}</div>
            <h2 className="text-3xl font-bold text-white mb-2 animate-bounce">{showReward.title}</h2>
            <p className="text-white/90 text-lg mb-8">🎉 Reward Unlocked! 🎉</p>

            <div className="bg-white/20 rounded-xl p-6 mb-6 backdrop-blur">
              {showReward.img && (
                <img src={showReward.img} alt={showReward.activity} className="w-full h-40 object-cover rounded-lg mb-4" />
              )}
              <h3 className="text-2xl font-bold text-white mb-2">{showReward.activity}</h3>
              <p className="text-white/90 text-sm mb-4">{showReward.description}</p>
              
              <div className="space-y-2 text-xs text-white/80">
                <p><strong>Details:</strong> {showReward.details}</p>
                <p><strong>Time:</strong> {showReward.time}</p>
              </div>
            </div>

            <p className="text-white mb-6 text-sm">Do this together. Document the memories in your notebooks. 💕</p>
            
            <button
              onClick={() => {
                if (currentQuestionIndex < QUESTIONS.length - 1) {
                  setCurrentQuestionIndex(currentQuestionIndex + 1);
                  setScreen('question');
                } else {
                  setScreen('complete');
                }
              }}
              className="w-full px-8 py-3 bg-white text-rose-600 font-bold rounded-lg hover:bg-gray-100 transition-all transform hover:scale-105 animate-bounce"
            >
              Continue →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // COMPLETE SCREEN
  if (screen === 'complete') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="bg-gradient-to-br from-rose-600/30 to-pink-600/30 border-2 border-rose-500 rounded-3xl p-12 max-w-md shadow-2xl text-center backdrop-blur">
          <div className="mb-6 text-6xl">💕</div>
          <h3 className="text-4xl font-bold text-white mb-4">You Did It!</h3>
          <p className="text-gray-200 mb-4 text-lg">36 questions. All written. All discussed.</p>
          <p className="text-white/80 mb-8">
            Now comes your final reward: Book your weekend getaway together to celebrate this journey into each other. Choose anywhere you both love. Book it now. These notebooks are a map of your hearts. Hold onto them forever.
          </p>
          
          <button
            onClick={() => {
              setCurrentQuestionIndex(0);
              setAnswered(new Set());
              setSessionCode('');
              setUserRole(null);
              setSessionActive(false);
              setScreen('intro');
            }}
            className="w-full px-8 py-4 bg-white text-rose-600 font-bold rounded-lg hover:bg-gray-100 transition-all"
          >
            Start Again
          </button>
        </div>
      </div>
    );
  }
};

export default NotebookApp;