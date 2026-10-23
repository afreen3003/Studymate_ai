import { useState, type FormEvent } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  useAskStudyMate,
  useGenerateStudyNotes,
  useGenerateStudyPlan,
  useGetStudyMateStatus,
  getGetStudyMateStatusQueryKey,
} from '@workspace/api-client-react';
import type { StudyResult } from '@workspace/api-client-react';
import {
  BookOpen,
  CalendarDays,
  Check,
  ChevronRight,
  CircleHelp,
  Clock3,
  Compass,
  FileText,
  GraduationCap,
  Lightbulb,
  LoaderCircle,
  MessageCircle,
  NotebookPen,
  RotateCcw,
  Send,
  Sparkles,
  X,
} from 'lucide-react';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';

type Section = 'home' | 'ask' | 'notes' | 'planner';
type Answer = { question: string; result: StudyResult };

const queryClient = new QueryClient();
const suggestedQuestions = [
  'Explain the difference between mitosis and meiosis',
  'How do I structure a persuasive essay?',
  'What is opportunity cost in economics?',
];

function DemoLabel() {
  return (
    <span className="demo-label" data-testid="status-demo-label">
      <span aria-hidden="true" className="demo-dot" />
      Demo sample
    </span>
  );
}

function ResultCard({
  result,
  title,
}: {
  result: StudyResult;
  title: string;
}) {
  return (
    <article className="result-card" data-testid="result-answer">
      <div className="result-heading">
        <div className="result-heading-title">
          <span className="result-mark"><Sparkles size={17} /></span>
          <h3>{title}</h3>
        </div>
        <DemoLabel />
      </div>
      <div className="result-copy">{result.answer}</div>
      <div className="result-footnote">
        <Check size={14} />
        A sample to help you get started
      </div>
    </article>
  );
}

function BusyMessage({ text }: { text: string }) {
  return (
    <div className="busy-message" role="status" aria-live="polite">
      <span className="loading-mark"><LoaderCircle size={17} /></span>
      <span>{text}</span>
      <span className="skeleton-line" />
    </div>
  );
}

function AppContent() {
  const [section, setSection] = useState<Section>('home');
  const [aboutOpen, setAboutOpen] = useState(false);
  const [question, setQuestion] = useState('');
  const [chat, setChat] = useState<Answer[]>([]);
  const [topic, setTopic] = useState('');
  const [notesResult, setNotesResult] = useState<StudyResult | null>(null);
  const [subjects, setSubjects] = useState('');
  const [minutes, setMinutes] = useState('90');
  const [planResult, setPlanResult] = useState<StudyResult | null>(null);

  const status = useGetStudyMateStatus({
    query: { queryKey: getGetStudyMateStatusQueryKey() },
  });
  const ask = useAskStudyMate();
  const notes = useGenerateStudyNotes();
  const plan = useGenerateStudyPlan();
  const busy = ask.isPending || notes.isPending || plan.isPending;

  function submitQuestion(value = question) {
    const trimmed = value.trim();
    if (trimmed.length < 2 || ask.isPending) return;
    setQuestion(trimmed);
    ask.mutate(
      { data: { question: trimmed } },
      {
        onSuccess: (result) => {
          setChat((current) => [...current, { question: trimmed, result }]);
          setQuestion('');
        },
      },
    );
  }

  function handleAsk(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    submitQuestion();
  }

  function handleNotes(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanTopic = topic.trim();
    if (cleanTopic.length < 2 || notes.isPending) return;
    setNotesResult(null);
    notes.mutate(
      { data: { topic: cleanTopic } },
      { onSuccess: setNotesResult },
    );
  }

  function handlePlan(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanSubjects = subjects.trim();
    const availableMinutes = Number(minutes);
    if (
      cleanSubjects.length < 2 ||
      !Number.isFinite(availableMinutes) ||
      availableMinutes < 15 ||
      availableMinutes > 720 ||
      plan.isPending
    ) return;
    setPlanResult(null);
    plan.mutate(
      { data: { subjects: cleanSubjects, availableMinutes } },
      { onSuccess: setPlanResult },
    );
  }

  function selectSection(next: Section) {
    setSection(next);
    setAboutOpen(false);
  }

  const navItems: { id: Section; label: string; icon: typeof Compass }[] = [
    { id: 'home', label: 'Home', icon: Compass },
    { id: 'ask', label: 'Ask', icon: MessageCircle },
    { id: 'notes', label: 'Notes', icon: NotebookPen },
    { id: 'planner', label: 'Planner', icon: CalendarDays },
  ];

  return (
    <div className="app-shell">
      <header className="topbar">
        <button className="brand" onClick={() => selectSection('home')} aria-label="StudyMate home" data-testid="button-home">
          <span className="brand-icon"><GraduationCap size={23} strokeWidth={2.2} /></span>
          <span className="brand-name">study<span>mate</span></span>
          <span className="brand-period">.</span>
        </button>
        <div className="topbar-right">
          <span className="demo-pill"><span className="demo-dot" />Demo mode</span>
          <button className="about-trigger" onClick={() => setAboutOpen(true)} aria-label="About StudyMate" data-testid="button-about">
            <CircleHelp size={19} />
            <span>About</span>
          </button>
        </div>
      </header>

      <main className="main-wrap">
        <div className="welcome-row">
          <div>
            <p className="eyebrow">YOUR STUDY SIDEKICK</p>
            <h1>{section === 'home' ? <>A little help<br className="mobile-break" /> goes a long way.</> : navItems.find((item) => item.id === section)?.label}</h1>
            <p className="welcome-sub">
              {section === 'home'
                ? 'Make today’s studying feel more manageable.'
                : section === 'ask'
                  ? 'Bring a question. Leave with a clearer next step.'
                  : section === 'notes'
                    ? 'Turn a big topic into a quick review.'
                    : 'Make a realistic plan for the time you have.'}
            </p>
          </div>
          <div className="welcome-stamp" aria-hidden="true">
            <span className="stamp-orbit"><BookOpen size={26} /></span>
            <span className="stamp-spark">+</span>
          </div>
        </div>

        {section === 'home' ? (
          <div className="home-content">
            <section className="hero-card">
              <div className="hero-text">
                <div className="hero-kicker"><span className="hero-kicker-line" /> A calm place to begin</div>
                <h2>One thing at<br />a time.</h2>
                <p>Ask something, make a few notes, or map out your study time. You’re in the right place.</p>
                <button className="hero-action" onClick={() => selectSection('ask')} data-testid="button-start-asking">
                  Start with a question <ChevronRight size={18} />
                </button>
              </div>
              <div className="hero-art" aria-hidden="true">
                <div className="art-sun" />
                <div className="art-page art-page-back" />
                <div className="art-page art-page-front">
                  <span className="art-page-line wide" />
                  <span className="art-page-line" />
                  <span className="art-page-line short" />
                  <span className="art-page-highlight" />
                  <span className="art-page-line wide" />
                </div>
                <div className="art-pencil"><span /></div>
                <span className="art-star star-one" />
                <span className="art-star star-two" />
              </div>
            </section>

            <div className="section-heading">
              <div>
                <p className="eyebrow">YOUR TOOLKIT</p>
                <h2>What would help right now?</h2>
              </div>
            </div>
            <div className="tool-grid">
              <button className="tool-card tool-ask" onClick={() => selectSection('ask')} data-testid="button-tool-ask">
                <span className="tool-icon"><MessageCircle size={20} /></span>
                <span className="tool-content"><strong>Ask StudyMate</strong><small>Get a clear explanation</small></span>
                <ChevronRight className="tool-arrow" size={18} />
              </button>
              <button className="tool-card tool-notes" onClick={() => selectSection('notes')} data-testid="button-tool-notes">
                <span className="tool-icon"><FileText size={20} /></span>
                <span className="tool-content"><strong>Simple Notes</strong><small>Review a topic simply</small></span>
                <ChevronRight className="tool-arrow" size={18} />
              </button>
              <button className="tool-card tool-plan" onClick={() => selectSection('planner')} data-testid="button-tool-planner">
                <span className="tool-icon"><CalendarDays size={20} /></span>
                <span className="tool-content"><strong>Study Planner</strong><small>Plan your next session</small></span>
                <ChevronRight className="tool-arrow" size={18} />
              </button>
            </div>

            <section className="prompt-section">
              <div className="prompt-title"><Lightbulb size={18} /><h2>Need a starting point?</h2></div>
              <p>Try one of these, or ask your own question.</p>
              <div className="prompt-list">
                {suggestedQuestions.map((prompt, index) => (
                  <button key={prompt} className="prompt-chip" onClick={() => { setSection('ask'); submitQuestion(prompt); }} data-testid={`button-suggested-question-${index}`}>
                    <span>{prompt}</span><ChevronRight size={16} />
                  </button>
                ))}
              </div>
            </section>

            <section className="status-note" data-testid="status-service">
              <span className="status-note-icon"><Check size={16} /></span>
              <div>
                <strong>{status.data?.mode === 'demo' ? 'Demo mode is ready' : 'A sample is ready for you'}</strong>
                <p>{status.isLoading ? 'Checking your study space…' : status.isError ? 'Status is unavailable right now. Your tools are still here to try.' : status.data?.message || 'Responses in this preview are sample content, not live AI.'}</p>
              </div>
              {status.isError && <button className="text-retry" onClick={() => status.refetch()} data-testid="button-retry-status">Retry</button>}
            </section>
          </div>
        ) : (
          <section className="workspace-panel">
            {section === 'ask' && (
              <>
                <div className="panel-intro">
                  <div className="panel-icon ask-icon"><MessageCircle size={21} /></div>
                  <div><h2>Ask StudyMate</h2><p>Big question or tiny confusion, both welcome.</p></div>
                </div>
                <form className="question-form" onSubmit={handleAsk}>
                  <label htmlFor="question-input">What are you studying?</label>
                  <div className="question-compose">
                    <textarea id="question-input" data-testid="input-question" value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="Try: explain photosynthesis in simple terms" maxLength={2000} rows={3} />
                    <button className="send-button" type="submit" disabled={question.trim().length < 2 || ask.isPending} aria-label="Send question" data-testid="button-submit-question">
                      {ask.isPending ? <LoaderCircle size={19} className="spin" /> : <Send size={18} />}
                    </button>
                  </div>
                  <div className="form-meta"><span>Keep it simple or get specific.</span><span>{question.length}/2000</span></div>
                </form>
                {ask.isError && <div className="inline-error" role="alert"><span>We couldn’t get a sample just now.</span><button onClick={() => submitQuestion()} data-testid="button-retry-question">Try again</button></div>}
                {chat.length > 0 && (
                  <div className="chat-section">
                    <div className="chat-header"><h3>Your questions</h3><button className="clear-button" onClick={() => setChat([])} data-testid="button-clear-chat"><RotateCcw size={15} /> Clear chat</button></div>
                    <div className="chat-list">
                      {chat.map((item, index) => (
                        <div className="chat-exchange" key={`${index}-${item.question}`}>
                          <div className="question-bubble"><span className="bubble-label">YOU ASKED</span><p>{item.question}</p></div>
                          <ResultCard result={item.result} title="A helpful starting point" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {chat.length === 0 && !ask.isPending && (
                  <div className="ask-empty">
                    <span className="empty-icon"><MessageCircle size={20} /></span>
                    <strong>Your conversation starts here.</strong>
                    <p>Ask a question above, or pick a suggested one below.</p>
                  </div>
                )}
                {ask.isPending && <BusyMessage text="Putting together a sample response…" />}
                <div className="suggested-inline">
                  <p className="eyebrow">SUGGESTED QUESTIONS</p>
                  {suggestedQuestions.map((prompt, index) => <button key={prompt} onClick={() => submitQuestion(prompt)} data-testid={`button-ask-suggestion-${index}`}>{prompt}<ChevronRight size={15} /></button>)}
                </div>
              </>
            )}

            {section === 'notes' && (
              <>
                <div className="panel-intro">
                  <div className="panel-icon notes-icon"><NotebookPen size={21} /></div>
                  <div><h2>Simple Notes</h2><p>Get a quick, plain-language review of a topic.</p></div>
                </div>
                <form className="tool-form" onSubmit={handleNotes}>
                  <label htmlFor="topic-input">Topic to review</label>
                  <div className="input-with-action">
                    <input id="topic-input" data-testid="input-topic" value={topic} onChange={(event) => setTopic(event.target.value)} placeholder="For example, cellular respiration" maxLength={160} />
                    <button type="submit" disabled={topic.trim().length < 2 || notes.isPending} data-testid="button-generate-notes">{notes.isPending ? <LoaderCircle size={17} className="spin" /> : <Sparkles size={17} />} Make notes</button>
                  </div>
                  <span className="field-hint">A subject, chapter, or concept works well.</span>
                </form>
                {notes.isError && <div className="inline-error" role="alert"><span>We couldn’t make a sample right now.</span><button onClick={() => { if (topic.trim().length >= 2) notes.mutate({ data: { topic: topic.trim() } }, { onSuccess: setNotesResult }); }} data-testid="button-retry-notes">Try again</button></div>}
                {notes.isPending && <BusyMessage text="Preparing a sample set of notes…" />}
                {notesResult ? <ResultCard result={notesResult} title="Your review notes" /> : !notes.isPending && (
                  <div className="empty-workspace">
                    <span className="empty-icon"><BookOpen size={20} /></span>
                    <strong>Make this topic feel smaller.</strong>
                    <p>Your sample notes will appear here, ready for a quick review.</p>
                  </div>
                )}
                <div className="mini-tip"><Lightbulb size={17} /><span>Try a focused topic for notes that are easier to scan.</span></div>
              </>
            )}

            {section === 'planner' && (
              <>
                <div className="panel-intro">
                  <div className="panel-icon plan-icon"><CalendarDays size={21} /></div>
                  <div><h2>Study Planner</h2><p>Shape the time you have into a simple plan.</p></div>
                </div>
                <form className="tool-form planner-form" onSubmit={handlePlan}>
                  <label htmlFor="subjects-input">What do you want to study?</label>
                  <textarea id="subjects-input" data-testid="input-subjects" value={subjects} onChange={(event) => setSubjects(event.target.value)} placeholder="For example, biology chapter 4 and calculus practice" maxLength={500} rows={3} />
                  <label htmlFor="minutes-input" className="minutes-label"><Clock3 size={16} /> Available study time</label>
                  <div className="minutes-row">
                    <input id="minutes-input" data-testid="input-minutes" type="number" min="15" max="720" step="5" value={minutes} onChange={(event) => setMinutes(event.target.value)} />
                    <span>minutes</span>
                    <div className="quick-times">
                      {[30, 60, 90].map((time) => <button type="button" key={time} className={minutes === String(time) ? 'time-chip selected' : 'time-chip'} onClick={() => setMinutes(String(time))} data-testid={`button-time-${time}`}>{time} min</button>)}
                    </div>
                  </div>
                  <button type="submit" className="primary-submit" disabled={subjects.trim().length < 2 || Number(minutes) < 15 || Number(minutes) > 720 || plan.isPending} data-testid="button-generate-plan">
                    {plan.isPending ? <LoaderCircle size={18} className="spin" /> : <CalendarDays size={18} />}
                    Build my study plan
                  </button>
                </form>
                {plan.isError && <div className="inline-error" role="alert"><span>We couldn’t make a sample plan right now.</span><button onClick={() => { const availableMinutes = Number(minutes); if (subjects.trim().length >= 2 && availableMinutes >= 15 && availableMinutes <= 720) plan.mutate({ data: { subjects: subjects.trim(), availableMinutes } }, { onSuccess: setPlanResult }); }} data-testid="button-retry-plan">Try again</button></div>}
                {plan.isPending && <BusyMessage text="Arranging a sample plan…" />}
                {planResult ? <ResultCard result={planResult} title="Your study plan" /> : !plan.isPending && (
                  <div className="empty-workspace">
                    <span className="empty-icon"><Clock3 size={20} /></span>
                    <strong>A good plan fits real life.</strong>
                    <p>Tell us what’s on your list and how long you have.</p>
                  </div>
                )}
              </>
            )}
          </section>
        )}

        <footer className="page-footer">
          <span>StudyMate <span className="footer-mark">/</span> a little more clarity, one step at a time.</span>
          <button onClick={() => setAboutOpen(true)} data-testid="button-footer-about">About this preview</button>
        </footer>
      </main>

      <nav className="bottom-nav" aria-label="Main navigation">
        {navItems.map(({ id, label, icon: Icon }) => (
          <button key={id} className={section === id ? 'nav-item active' : 'nav-item'} onClick={() => selectSection(id)} aria-current={section === id ? 'page' : undefined} data-testid={`nav-${id}`}>
            <Icon size={20} strokeWidth={section === id ? 2.3 : 1.8} />
            <span>{label}</span>
          </button>
        ))}
      </nav>

      {aboutOpen && (
        <div className="modal-scrim" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setAboutOpen(false); }}>
          <section className="about-dialog" role="dialog" aria-modal="true" aria-labelledby="about-title">
            <div className="dialog-top"><span className="dialog-mark"><GraduationCap size={22} /></span><button className="close-dialog" onClick={() => setAboutOpen(false)} aria-label="Close about" data-testid="button-close-about"><X size={20} /></button></div>
            <p className="eyebrow">A FRIENDLY STUDY COMPANION</p>
            <h2 id="about-title">Meet StudyMate.</h2>
            <p className="about-copy">A simple space to ask questions, make review notes, and plan a study session without overthinking the first step.</p>
            <div className="about-demo-box"><span className="demo-dot" /><div><strong>This is a demo preview</strong><p>Every answer shown here is a sample. This app does not provide live AI responses or connect to voice assistants.</p></div></div>
            <button className="dialog-done" onClick={() => setAboutOpen(false)} data-testid="button-done-about">Sounds good</button>
          </section>
        </div>
      )}

      {busy && <span className="sr-only" role="status">A sample response is being prepared.</span>}
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ErrorBoundary>
          <AppContent />
        </ErrorBoundary>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
