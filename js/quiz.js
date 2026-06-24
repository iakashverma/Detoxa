// ============================================================
// DETOXA — Quiz engine
// Questions mirror the exact wording/scales used in the 277-
// respondent research survey. Scoring model validated against
// the real dataset distribution (median ~47.5/100).
// ============================================================

// Each question: { text, type: 'freq'|'scale'|'restless'|'hides', options: [{label, value}] }
// value is always normalized 1-5 internally, then averaged -> scaled to 0-100.

const QUESTIONS = [
  {
    key: 'time_loss',
    text: "Do you ever go on social media to quickly check something, then discover hours have passed?",
    options: [
      { label: 'Never', value: 1 },
      { label: 'Rarely', value: 2 },
      { label: 'Sometimes', value: 3 },
      { label: 'Often', value: 4 },
      { label: 'Always', value: 5 },
    ]
  },
  {
    key: 'purposeless',
    text: "How often do you find yourself using social media without any specific purpose?",
    options: [
      { label: 'Never', value: 1 },
      { label: 'Rarely', value: 2 },
      { label: 'Sometimes', value: 3 },
      { label: 'Often', value: 4 },
      { label: 'Always', value: 5 },
    ]
  },
  {
    key: 'restless',
    text: "Do you feel restless if you haven't used social media in a while?",
    options: [
      { label: 'No', value: 1 },
      { label: 'Maybe', value: 3 },
      { label: 'Yes', value: 5 },
    ]
  },
  {
    key: 'distractibility',
    text: "On a scale of 1 to 5, how easily distracted are you?",
    options: [
      { label: '1 — Rarely distracted', value: 1 },
      { label: '2', value: 2 },
      { label: '3 — Moderately', value: 3 },
      { label: '4', value: 4 },
      { label: '5 — Very easily distracted', value: 5 },
    ]
  },
  {
    key: 'concentration',
    text: "On a scale of 1 to 5, how difficult do you find it to concentrate on things?",
    options: [
      { label: '1 — Not difficult', value: 1 },
      { label: '2', value: 2 },
      { label: '3 — Somewhat', value: 3 },
      { label: '4', value: 4 },
      { label: '5 — Very difficult', value: 5 },
    ]
  },
  {
    key: 'comparison',
    text: "On a scale of 1 to 5, how often do you compare yourself to other successful people through social media?",
    options: [
      { label: '1 — Never', value: 1 },
      { label: '2', value: 2 },
      { label: '3 — Sometimes', value: 3 },
      { label: '4', value: 4 },
      { label: '5 — Constantly', value: 5 },
    ]
  },
  {
    key: 'sleep',
    text: "On a scale of 1 to 5, how often do you face issues with sleep (linked to social media use)?",
    options: [
      { label: '1 — Never', value: 1 },
      { label: '2', value: 2 },
      { label: '3 — Sometimes', value: 3 },
      { label: '4', value: 4 },
      { label: '5 — Frequently', value: 5 },
    ]
  },
  {
    key: 'appearance',
    text: "How often does viewing influencers / celebrities make you feel bad about your own appearance?",
    options: [
      { label: 'Never', value: 1 },
      { label: 'Rarely', value: 2 },
      { label: 'Sometimes', value: 3 },
      { label: 'Often', value: 4 },
      { label: 'Always', value: 5 },
    ]
  },
  {
    key: 'depressed',
    text: "How often do you feel depressed or down — in a way you'd link to social media?",
    options: [
      { label: 'Never', value: 1 },
      { label: 'Rarely', value: 2 },
      { label: 'Sometimes', value: 3 },
      { label: 'Often', value: 4 },
      { label: 'Always', value: 5 },
    ]
  },
  {
    key: 'hides',
    text: "Do you find yourself hiding or lying about how much time you spend on social media?",
    options: [
      { label: 'Strongly disagree', value: 1 },
      { label: 'Disagree', value: 2 },
      { label: 'Neutral', value: 3 },
      { label: 'Agree', value: 4 },
      { label: 'Strongly agree', value: 5 },
    ]
  },
  {
    key: 'jeopardized',
    text: "Has social media jeopardized your studies, finances, relationships, or career?",
    options: [
      { label: 'No', value: 1 },
      { label: 'Maybe', value: 3 },
      { label: 'Yes', value: 5 },
    ],
    // not part of score average — used for results-page comparison narrative
    excludeFromScore: false,
  },
  {
    key: 'tried_quit',
    text: "Have you ever tried to reduce or quit your social media use?",
    options: [
      { label: "No, never tried", value: 1 },
      { label: "Yes, but only once or twice", value: 3 },
      { label: "Yes, and I keep trying often", value: 5 },
    ],
    excludeFromScore: false,
  },
];

let currentQ = 0;
const answers = {};

function startQuiz() {
  document.getElementById('startScreen').classList.remove('active');
  document.getElementById('quizScreen').classList.add('active');
  renderQuestion();
}

function renderQuestion() {
  const container = document.getElementById('questionsContainer');
  const q = QUESTIONS[currentQ];
  const letters = ['A','B','C','D','E'];

  let html = `<div class="q-card active">
    <div class="q-text">${q.text}</div>
    <div class="opt-list">`;

  q.options.forEach((opt, i) => {
    const selected = answers[q.key] === opt.value ? 'selected' : '';
    html += `<button class="opt ${selected}" data-value="${opt.value}" onclick="selectOption('${q.key}', ${opt.value}, this)">
      <span class="opt-letter">${letters[i]}</span> ${opt.label}
    </button>`;
  });

  html += `</div></div>`;
  container.innerHTML = html;

  updateProgress();
  updateNavButtons();
}

function selectOption(key, value, btnEl) {
  answers[key] = value;
  document.querySelectorAll('.opt').forEach(el => el.classList.remove('selected'));
  btnEl.classList.add('selected');
  document.getElementById('nextBtn').disabled = false;
}

function updateProgress() {
  const pct = Math.round(((currentQ) / QUESTIONS.length) * 100);
  document.getElementById('progressFill').style.width = pct + '%';
  document.getElementById('progressText').textContent = `Question ${currentQ + 1} of ${QUESTIONS.length}`;
  document.getElementById('progressPct').textContent = pct + '%';
}

function updateNavButtons() {
  document.getElementById('backBtn').style.visibility = currentQ === 0 ? 'hidden' : 'visible';
  const q = QUESTIONS[currentQ];
  document.getElementById('nextBtn').disabled = !(q.key in answers);
  document.getElementById('nextBtn').textContent = currentQ === QUESTIONS.length - 1 ? 'See my score →' : 'Next →';
}

function nextQuestion() {
  if (!(QUESTIONS[currentQ].key in answers)) return;
  if (currentQ < QUESTIONS.length - 1) {
    currentQ++;
    renderQuestion();
  } else {
    showResults();
  }
}

function prevQuestion() {
  if (currentQ > 0) {
    currentQ--;
    renderQuestion();
  }
}

function computeScore() {
  // Score uses the 10 core dependency items (excludes jeopardized + tried_quit,
  // which are contextual / used only in the results narrative)
  const scoreKeys = ['time_loss','purposeless','restless','distractibility','concentration',
                      'comparison','sleep','appearance','depressed','hides'];
  let sum = 0;
  scoreKeys.forEach(k => { sum += (answers[k] || 3); });
  const avg = sum / scoreKeys.length; // 1-5
  const score = Math.round(((avg - 1) / 4) * 100); // 0-100
  return score;
}

function getCategory(score) {
  if (score <= 25) return { label: 'Low dependency', color: 'var(--sage)', bg: 'var(--sage-dim)' };
  if (score <= 50) return { label: 'Mild dependency', color: 'var(--gold)', bg: '#F2E6CC' };
  if (score <= 70) return { label: 'Moderate dependency', color: 'var(--clay)', bg: 'var(--clay-dim)' };
  return { label: 'High dependency', color: '#A8463C', bg: 'var(--clay-dim)' };
}

function getBlurb(score, cat) {
  if (score <= 25) {
    return "Your answers suggest social media plays a fairly limited, low-friction role in your day. That puts you in good company with the smaller end of the study's sample.";
  }
  if (score <= 50) {
    return "You're in the largest band in the study — moderate, everyday dependency. It's noticeable, but not (yet) the dominant force in your day. This is exactly the group where small, consistent changes tend to make the biggest difference.";
  }
  if (score <= 70) {
    return "Your answers put you above the sample median. Social media is likely competing for real attention, focus, and time you'd rather spend elsewhere — and you may already sense it.";
  }
  return "Your answers place you in the highest band measured in this study. This doesn't mean something is wrong with you — it means social media has a strong, active grip on your daily patterns, similar to the ~22% of respondents who reported the most symptoms.";
}

function getAdvice(score, answers) {
  const triedQuit = answers['tried_quit'];
  let base = "";
  if (score > 50) {
    base = "In the study, the most common real strategy among people who actually changed their habits was deleting or uninstalling the app entirely (28 mentions) — far more effective in practice than soft measures like screen-time limits, which were reported far less often (9 mentions). ";
  } else {
    base = "In the study, people at this level rarely needed drastic measures — small, consistent friction (like screen-time limits or replacing scroll time with another habit) was enough to keep things in check. ";
  }
  if (triedQuit === 1) {
    base += "You haven't tried reducing your use yet — in the study, 60.4% of respondents had tried at least once, even just to test it out.";
  } else if (triedQuit === 3) {
    base += "You've tried once or twice already — that puts you with the largest group in the study (34.6%), who tried only occasionally rather than consistently. Consistency, more than the attempt itself, is what separated successful quitters in the data.";
  } else {
    base += "You're already trying consistently — that puts you in the smaller, more committed group in the study (just 31.6% of respondents who'd tried kept it up 'often' or 'always').";
  }
  return base;
}

function showResults() {
  document.getElementById('quizScreen').classList.remove('active');
  document.getElementById('resultScreen').classList.add('active');

  const score = computeScore();
  const cat = getCategory(score);

  document.getElementById('finalScore').textContent = score;
  const badge = document.getElementById('categoryBadge');
  badge.textContent = cat.label;
  badge.style.background = cat.bg;
  badge.style.color = cat.color;

  document.getElementById('resultBlurb').textContent = getBlurb(score, cat);
  document.getElementById('resultAdvice').textContent = getAdvice(score, answers);

  document.getElementById('compareYouVal').textContent = score;
  setTimeout(() => {
    document.getElementById('compareYouBar').style.width = score + '%';
  }, 100);

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function restartQuiz() {
  currentQ = 0;
  Object.keys(answers).forEach(k => delete answers[k]);
  document.getElementById('resultScreen').classList.remove('active');
  document.getElementById('startScreen').classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
