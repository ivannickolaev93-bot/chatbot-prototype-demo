import React, { useState, useRef, useEffect } from 'react';
import './App.css';
import usedeskLogo from './usedesk_logo.svg';
import chatIllustration from './chat-illustration.png';
import {
  Search, MessageCircle, Mail, Tag, IdCard, UserRound, CircleHelp,
  FileText, Inbox, Zap, Code2, Bot, ClipboardPen, Settings, Info,
  Lock, X, BookOpen, MessageSquareText, BookText, Camera, ChevronDown, Check,
} from 'lucide-react';

// ─── Data ────────────────────────────────────────────────────────────────────

const KNOWLEDGE_BASES = [
  {
    id: 'kb1', name: 'База знаний 1',
    sections: [
      {
        id: 's1', name: 'Покупателю',
        categories: [
          {
            id: 'c1', name: 'Для продаж',
            articles: [
              { id: 'a1', title: 'порядок обработки лидов копия', chars: 9,    locked: false },
              { id: 'a2', title: 'порядок обработки лидов',       chars: 11,   locked: true  },
              { id: 'a3', title: 'ааа',                            chars: 10,   locked: true  },
              { id: 'a4', title: 'Цепочка правил',                 chars: 1407, locked: true  },
            ],
          },
        ],
      },
      {
        id: 's2', name: 'Продавцу',
        categories: [
          {
            id: 'c3', name: 'Основное',
            articles: [
              { id: 'a5', title: 'Правила для продавцов', chars: 6, locked: false },
            ],
          },
        ],
      },
    ],
  },
  { id: 'kb2', name: 'база знаний 2', sections: [] },
  { id: 'kb3', name: 'Тест',                      sections: [] },
  { id: 'kb4', name: 'Интеграции',                sections: [] },
  { id: 'kb5', name: 'Специально для бота',        sections: [] },
  { id: 'kb6', name: 'Управление ролевой моделью', sections: [] },
  { id: 'kb7', name: 'Документооборот',            sections: [] },
  { id: 'kb8', name: 'Для сотрудников',            sections: [] },
  { id: 'kb9', name: 'Прочее',                     sections: [] },
];

const BOT_VERSIONS = [
  { id: 'v1', label: 'Версия 1', status: 'Создана',   date: '29.02.2026', time: '11:30', author: 'Константин Иванов' },
  { id: 'v2', label: 'Версия 2', status: 'Проверена', date: '10.05.2026', time: '12:30', author: 'Ольга Федорова'    },
];

const SIDEBAR_ICONS = [
  { id: 'search',   Icon: Search,       label: 'Поиск'             },
  { id: 'chat',     Icon: MessageCircle,label: 'Чат'               },
  { id: 'mail',     Icon: Mail,         label: 'Запросы'           },
  { id: 'tags',     Icon: Tag,          label: 'Теги'              },
  { id: 'clients',  Icon: IdCard,       label: 'Клиенты'           },
  { id: 'agents',   Icon: UserRound,    label: 'Агенты'            },
  { id: 'kb',       Icon: CircleHelp,   label: 'База знаний'       },
  { id: 'reports',  Icon: FileText,     label: 'Отчёты'            },
  { id: 'channels', Icon: Inbox,        label: 'Каналы'            },
  { id: 'triggers', Icon: Zap,          label: 'Автоматизация'     },
  { id: 'api',      Icon: Code2,        label: 'Расширения'        },
  { id: 'ai',       Icon: Bot,          label: 'ИИ', active: true  },
  { id: 'qa',       Icon: ClipboardPen, label: 'Контроль качества' },
  { id: 'settings2',Icon: Settings,     label: 'Настройки'         },
  { id: 'help',     Icon: Info,         label: 'Начало работы'     },
];

const NAV_ITEMS = [
  { id: 'settings',     label: 'Настройки',        Icon: Settings,          showWhen: 'trained'  },
  { id: 'training',     label: 'Обучение',          Icon: BookOpen,          showWhen: 'always'   },
  { id: 'testing',      label: 'Тестирование',      Icon: MessageSquareText, showWhen: 'started'  },
  { id: 'instructions', label: 'Особые инструкции', Icon: BookText,          showWhen: 'trained'  },
];

const CHANNELS_OPTIONS = [
  { id: 'ch1', label: 'Чат на сайте' },
  { id: 'ch2', label: 'Telegram' },
  { id: 'ch3', label: 'WhatsApp' },
  { id: 'ch4', label: 'ВКонтакте' },
  { id: 'ch5', label: 'Все каналы (полный доступ)' },
];

const ASSIGNEES_OPTIONS = [
  { id: 'ag1', label: 'Смирнов Максим' },
  { id: 'ag2', label: 'Петрова Анна' },
  { id: 'ag3', label: 'Иванов Сергей' },
  { id: 'gr1', label: 'Группа поддержки' },
  { id: 'gr2', label: 'Первая линия' },
];

const INIT_MESSAGES = [];

const BOT_REPLIES = [
  'Понял вас! Уточните пожалуйста детали.',
  'Проверяю информацию по вашему вопросу...',
  'Готово! Если остались вопросы — напишите.',
  'К сожалению, не могу помочь с этим запросом. Переведу на оператора.',
  'Спасибо за обращение! Всё решено :)',
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmtN(n) { return n.toLocaleString('ru-RU'); }

function CB({ checked, indeterminate, onClick }) {
  return (
    <span
      className={`cb${checked || indeterminate ? ' cb--on' : ''}`}
      onClick={e => { e.stopPropagation(); onClick?.(e); }}
    >
      {indeterminate && (
        <svg width="10" height="2" viewBox="0 0 10 2"><line x1="1" y1="1" x2="9" y2="1" stroke="#fff" strokeWidth="2" strokeLinecap="round"/></svg>
      )}
      {checked && !indeterminate && (
        <svg width="11" height="8" viewBox="0 0 11 8"><polyline points="1,4 4,7 10,1" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
      )}
    </span>
  );
}

// compute set of all article IDs within a list of KBs
function allArticleIds(kbs) {
  return kbs.flatMap(kb => kb.sections.flatMap(s => s.categories.flatMap(c => c.articles.map(a => a.id))));
}

function checkState(ids, selected) {
  const c = ids.filter(id => selected.has(id)).length;
  if (c === 0) return 'none';
  if (c === ids.length) return 'all';
  return 'some';
}

// ─── App ─────────────────────────────────────────────────────────────────────

export default function App() {
  const [activeTab,       setActiveTab]       = useState('training');
  const [botStatus,       setBotStatus]       = useState('untrained');
  const [selected,        setSelected]        = useState(new Set());
  const [expandedKbs,     setExpandedKbs]     = useState(new Set(['kb1']));
  const [expandedSecs,    setExpandedSecs]    = useState(new Set(['s1']));
  const [expandedCats,    setExpandedCats]    = useState(new Set(['c1']));
  const [showPublicOnly,  setShowPublicOnly]  = useState(false);
  const [search,          setSearch]          = useState('');
  const [files,           setFiles]           = useState([]);
  const [trainHover,      setTrainHover]      = useState(false);
  const [messages,        setMessages]        = useState(INIT_MESSAGES);
  const [chatInput,       setChatInput]       = useState('');
  const [botTyping,       setBotTyping]       = useState(false);
  const [testingLoading,  setTestingLoading]  = useState(false);
  const [trainedSnapshot, setTrainedSnapshot] = useState(null); // Set of article ids at training time
  const [updateHover,     setUpdateHover]     = useState(false);
  const messagesEndRef = useRef(null);

  // Settings state
  const [botName,         setBotName]         = useState('');
  const [channels,        setChannels]        = useState([]);
  const [assignees,       setAssignees]       = useState([]);
  const [transferText,    setTransferText]    = useState('');
  const [botLaunched,     setBotLaunched]     = useState(false);
  const [botEnabled,      setBotEnabled]      = useState(false);
  const [settingsDirty,   setSettingsDirty]   = useState(false);
  const [showChannelsDrop,setShowChannelsDrop]= useState(false);
  const [showAssignDrop,  setShowAssignDrop]  = useState(false);
  const [toast,           setToast]           = useState(null); // { text, type }
  const avatarInputRef = useRef(null);
  const [avatarUrl,       setAvatarUrl]       = useState(null);
  const [versionOpen,     setVersionOpen]     = useState(false);
  const [currentVersion,  setCurrentVersion]  = useState('v1');
  const fileInputRef = useRef(null);

  const isTrained  = botStatus === 'trained';
  const isTraining = botStatus === 'training';
  const hasFiles   = files.some(f => f.status === 'uploaded');

  // total selected article chars across all KBs
  const totalSelectedChars = KNOWLEDGE_BASES
    .flatMap(kb => kb.sections.flatMap(s => s.categories.flatMap(c => c.articles)))
    .filter(a => selected.has(a.id))
    .reduce((acc, a) => acc + a.chars, 0);

  const canTrain = selected.size > 0 || hasFiles;

  function toggle(id, e) {
    e?.stopPropagation();
    setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }

  function toggleGroup(ids, e) {
    e?.stopPropagation();
    const state = checkState(ids, selected);
    setSelected(prev => {
      const n = new Set(prev);
      if (state === 'all') ids.forEach(id => n.delete(id));
      else ids.forEach(id => n.add(id));
      return n;
    });
  }

  function startTraining() {
    setTrainedSnapshot(new Set(selected));
    setUpdateHover(false);
    setTrainHover(false);
    setBotStatus('training');
    setActiveTab('testing');
    setTestingLoading(true);
    setTimeout(() => {
      setBotStatus('trained');
      setTestingLoading(false);
    }, 3500);
  }

  // есть новые материалы по сравнению со снимком на момент обучения
  const hasNewMaterials = isTrained && trainedSnapshot !== null &&
    ([...selected].some(id => !trainedSnapshot.has(id)) ||
     files.some(f => f.status === 'uploaded'));

  function handleFileInput(e) {
    const newFiles = Array.from(e.target.files).map(f => ({
      id: Date.now() + Math.random(),
      name: f.name,
      size: f.size < 1048576 ? Math.round(f.size / 1024) + ' КБ' : (f.size / 1048576).toFixed(1) + ' Мб',
      status: 'loading',
    }));
    setFiles(prev => [...prev, ...newFiles]);
    newFiles.forEach(nf => {
      setTimeout(() => setFiles(prev => prev.map(f => f.id === nf.id ? { ...f, status: 'uploaded' } : f)), 1200);
    });
    e.target.value = '';
  }

  function showToast(text, type = 'success') {
    setToast({ text, type });
    setTimeout(() => setToast(null), 3000);
  }

  function launchBot() {
    setBotLaunched(true);
    setBotEnabled(true);
    setSettingsDirty(false);
    showToast('Бот запущен и работает');
  }

  function toggleBot() {
    const next = !botEnabled;
    setBotEnabled(next);
    showToast(next ? 'Бот запущен и работает' : 'Бот остановлен');
  }

  function saveSettings() {
    setSettingsDirty(false);
    showToast('Настройки сохранены');
  }

  function handleAvatarChange(e) {
    const file = e.target.files[0];
    if (file) setAvatarUrl(URL.createObjectURL(file));
  }

  function toggleOption(list, setList, id) {
    setList(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    setSettingsDirty(true);
  }

  const ver = BOT_VERSIONS.find(v => v.id === currentVersion);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  function now() {
    return new Date().toLocaleString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  function sendMessage() {
    const text = chatInput.trim();
    if (!text) return;
    const userMsg = { id: Date.now(), type: 'user', sender: 'Вы', time: now(), text };
    setMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setBotTyping(true);
    setTimeout(() => {
      const reply = BOT_REPLIES[Math.floor(Math.random() * BOT_REPLIES.length)];
      setMessages(prev => [...prev, { id: Date.now() + 1, type: 'bot', sender: 'Чат-бот', time: now(), text: reply }]);
      setBotTyping(false);
    }, 1000 + Math.random() * 800);
  }

  return (
    <div className="app">

      {/* ── Dark icon sidebar ── */}
      <aside className="sidebar">
        <div className="sb-logo">
          <img src={usedeskLogo} width="32" height="32" alt="Usedesk" />
        </div>
        <div className="sb-nav">
          {SIDEBAR_ICONS.map(({ id, Icon, label, active }) => (
            <button key={id} className={`sb-btn${active ? ' sb-btn--active' : ''}`} title={label}>
              <Icon size={24} strokeWidth={1.5} color="#ffffff" />
            </button>
          ))}
        </div>
      </aside>

      <div className="page">
        {/* ── Page header ── */}
        <header className="pheader">
          <div className="pheader__left">
            <span className="pheader__title">Чат-бот первой линии</span>
            <div className="ver-btn" onClick={() => setVersionOpen(v => !v)}>
              <span className="ver-dot" />
              <span>{ver?.label}</span>
              <span className="ico-chev">▾</span>
              {versionOpen && (
                <div className="ver-drop" onClick={e => e.stopPropagation()}>
                  <div className="ver-drop__header">версии бота</div>
                  {BOT_VERSIONS.map(v => (
                    <div key={v.id}
                      className={`ver-drop__row${v.id === currentVersion ? ' ver-drop__row--active' : ''}`}
                      onClick={() => { setCurrentVersion(v.id); setVersionOpen(false); }}>
                      <div className="ver-drop__name">{v.label}</div>
                      <div className="ver-drop__meta">
                        <span className="ver-drop__status">{v.status}</span>
                        <span>{v.date}, {v.time}</span>
                        <span>{v.author}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="pheader__right">
            <div className="avatar">КИ</div>
          </div>
        </header>

        <div className="pbody">
          {/* ── Filters bar ── */}
          <nav className="fbar">
            {NAV_ITEMS
              .filter(({ showWhen }) =>
                showWhen === 'always' ||
                (showWhen === 'started' && botStatus !== 'untrained') ||
                (showWhen === 'trained' && isTrained)
              )
              .map(({ id, label, Icon }) => (
                <button key={id}
                  className={`fbar-item${activeTab === id ? ' fbar-item--active' : ''}`}
                  onClick={() => setActiveTab(id)}>
                  <Icon size={20} strokeWidth={1.5} className="fbar-icon" />
                  <span>{label}</span>
                </button>
              ))}
          </nav>

          {/* ── Content ── */}
          <div className={`content${activeTab === 'testing' ? ' content--chat' : ''}`}>
            {activeTab === 'instructions' && (
              <div className="tab-stub">Особые инструкции</div>
            )}

            {activeTab === 'settings' && (
              <div className="settings-page">

                {/* Main card */}
                <div className="settings-card">

                  {/* Profile block */}
                  <div className="s-profile">
                    {/* Avatar */}
                    <div className="s-avatar" onClick={() => avatarInputRef.current.click()}>
                      {avatarUrl
                        ? <img src={avatarUrl} alt="avatar" className="s-avatar__img" />
                        : <Bot size={28} color="#959696" strokeWidth={1.5} />
                      }
                      <div className="s-avatar__overlay"><Camera size={16} color="#fff" /></div>
                      <input ref={avatarInputRef} type="file" accept="image/*" onChange={handleAvatarChange} style={{ display: 'none' }} />
                    </div>

                    {/* Name + status */}
                    <div className="s-profile__info">
                      <span className="s-profile__name">{botName || 'ИИ чат-бот'}</span>
                      {botLaunched && (
                        <span className={`s-status${botEnabled ? ' s-status--on' : ' s-status--off'}`}>
                          {botEnabled ? 'Включен' : 'Выключен'}
                        </span>
                      )}
                    </div>

                    {/* Launch button or toggle */}
                    {!botLaunched ? (
                      <button className="btn btn--primary" onClick={launchBot}>Запустить бота</button>
                    ) : (
                      <button
                        className={`btn${botEnabled ? ' btn--danger' : ' btn--primary'}`}
                        onClick={toggleBot}>
                        {botEnabled ? 'Выключить' : 'Включить'}
                      </button>
                    )}
                  </div>

                  {/* Form */}
                  <div className="s-form">

                    {/* Bot name */}
                    <div className="s-field">
                      <label className="s-label">Имя бота *</label>
                      <input
                        className="s-input"
                        placeholder="Введите имя бота"
                        value={botName}
                        onChange={e => { setBotName(e.target.value); setSettingsDirty(true); }}
                      />
                    </div>

                    {/* Channels */}
                    <div className="s-field">
                      <label className="s-label">Каналы, в которых будет отвечать чат-бот *</label>
                      <div className="s-multiselect" onClick={() => setShowChannelsDrop(p => !p)}>
                        <div className="s-multiselect__tags">
                          {channels.length === 0
                            ? <span className="s-placeholder">Выберите каналы</span>
                            : channels.map(id => {
                                const opt = CHANNELS_OPTIONS.find(o => o.id === id);
                                return (
                                  <span key={id} className="s-tag">
                                    {opt?.label}
                                    <button className="s-tag__rm" onClick={e => { e.stopPropagation(); toggleOption(channels, setChannels, id); }}>×</button>
                                  </span>
                                );
                              })
                          }
                        </div>
                        <ChevronDown size={16} color="#959696" />
                        {showChannelsDrop && (
                          <div className="s-dropdown" onClick={e => e.stopPropagation()}>
                            {CHANNELS_OPTIONS.map(opt => {
                              const sel = channels.includes(opt.id);
                              return (
                                <div key={opt.id}
                                  className={`s-drop-item${sel ? ' s-drop-item--selected' : ''}`}
                                  onClick={() => toggleOption(channels, setChannels, opt.id)}>
                                  <Check size={16} strokeWidth={2}
                                    color={sel ? '#3d79f2' : '#676768'}
                                    style={{ opacity: sel ? 1 : 0 }} />
                                  <span className="s-drop-item__text">{opt.label}</span>
                                  <Check size={16} strokeWidth={2}
                                    color={sel ? '#3d79f2' : '#676768'}
                                    style={{ opacity: sel ? 1 : 0 }} />
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Assignees */}
                    <div className="s-field">
                      <label className="s-label">На кого назначать запросы *</label>
                      <div className="s-multiselect" onClick={() => setShowAssignDrop(p => !p)}>
                        <div className="s-multiselect__tags">
                          {assignees.length === 0
                            ? <span className="s-placeholder">Выберите исполнителей или группы</span>
                            : assignees.map(id => {
                                const opt = ASSIGNEES_OPTIONS.find(o => o.id === id);
                                return (
                                  <span key={id} className="s-tag">
                                    {opt?.label}
                                    <button className="s-tag__rm" onClick={e => { e.stopPropagation(); toggleOption(assignees, setAssignees, id); }}>×</button>
                                  </span>
                                );
                              })
                          }
                        </div>
                        <ChevronDown size={16} color="#959696" />
                        {showAssignDrop && (
                          <div className="s-dropdown" onClick={e => e.stopPropagation()}>
                            {ASSIGNEES_OPTIONS.map(opt => {
                              const sel = assignees.includes(opt.id);
                              return (
                                <div key={opt.id}
                                  className={`s-drop-item${sel ? ' s-drop-item--selected' : ''}`}
                                  onClick={() => toggleOption(assignees, setAssignees, opt.id)}>
                                  <Check size={16} strokeWidth={2}
                                    color={sel ? '#3d79f2' : '#676768'}
                                    style={{ opacity: sel ? 1 : 0 }} />
                                  <span className="s-drop-item__text">{opt.label}</span>
                                  <Check size={16} strokeWidth={2}
                                    color={sel ? '#3d79f2' : '#676768'}
                                    style={{ opacity: sel ? 1 : 0 }} />
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Transfer text */}
                    <div className="s-field">
                      <label className="s-label">Текст при переводе на оператора</label>
                      <div className="s-textarea-wrap">
                        <textarea
                          className="s-textarea"
                          placeholder="Введите свой текст"
                          maxLength={1000}
                          value={transferText}
                          onChange={e => { setTransferText(e.target.value); setSettingsDirty(true); }}
                        />
                        <span className="s-textarea__counter">{transferText.length}/1000</span>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Save button */}
                <div className="settings-actions">
                  <button
                    className={`btn${settingsDirty ? ' btn--primary' : ' btn--save-disabled'}`}
                    onClick={settingsDirty ? saveSettings : undefined}
                    disabled={!settingsDirty}>
                    Сохранить
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'testing' && (
              <div className="chat-page">
                {/* Messages area */}
                <div className={`chat-messages${testingLoading ? ' chat-messages--loading' : ''}`}>
                  {testingLoading ? (
                    <div className="chat-empty">
                      <div className="loader-card">
                        <div className="loader-ring" />
                        <p className="loader-text">Идет процесс обучения бота</p>
                      </div>
                    </div>
                  ) : messages.length === 0 && !botTyping ? (
                    <div className="chat-empty">
                      <div className="chat-empty__card">
                        <img src={chatIllustration} alt="" className="chat-empty__img" />
                        <p className="chat-empty__text">
                          Готово!<br />
                          Теперь вы можете отправлять сообщения в этот чат, чтобы протестировать бота
                        </p>
                      </div>
                    </div>
                  ) : (
                    <>
                      {messages.map(msg => (
                        <div key={msg.id} className={`chat-row${msg.type === 'user' ? ' chat-row--user' : ''}`}>
                          {msg.type === 'bot' && <div className="chat-avatar chat-avatar--bot">🤖</div>}
                          <div className="chat-bubble">
                            <div className="chat-bubble__meta">
                              <span className="chat-bubble__sender">{msg.sender}</span>
                              <span className="chat-bubble__time">{msg.time}</span>
                            </div>
                            {msg.text.split('\n').map((line, i) => (
                              <p key={i} className="chat-bubble__text">{line}</p>
                            ))}
                          </div>
                          {msg.type === 'user' && <div className="chat-avatar chat-avatar--user">КИ</div>}
                        </div>
                      ))}
                      {botTyping && (
                        <div className="chat-row">
                          <div className="chat-avatar chat-avatar--bot">🤖</div>
                          <div className="chat-bubble chat-bubble--typing">
                            <span /><span /><span />
                          </div>
                        </div>
                      )}
                      <div ref={messagesEndRef} />
                    </>
                  )}
                </div>

                {/* Input */}
                <div className={`chat-input-wrap${testingLoading ? ' chat-input-wrap--hidden' : ''}`}>
                  <div className="chat-input-box">
                    <input
                      className="chat-input"
                      placeholder="Написать сообщение..."
                      value={chatInput}
                      onChange={e => setChatInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                    />
                    {chatInput.trim() && (
                      <button className="btn btn--primary" onClick={sendMessage}>
                        Отправить
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'training' && (
              <div className="training">
                {isTraining && (
                  <div className="loader-wrap">
                    <div className="loader-card">
                      <div className="loader-ring" />
                      <p className="loader-text">Идет процесс обучения бота</p>
                    </div>
                  </div>
                )}

                {!isTraining && (<>
                  {/* Title + toggle */}
                  <div className="training-head">
                    <span className="training-title">Материалы для обучения бота</span>
                    <label className="toggle-row" onClick={() => setShowPublicOnly(p => !p)}>
                      <span className={`sw${showPublicOnly ? ' sw--on' : ''}`}><span className="sw__knob" /></span>
                      <span className="toggle-label">Показывать только публичные</span>
                    </label>
                  </div>

                  {/* ── KB list ── */}
                  {KNOWLEDGE_BASES.map(kb => {
                    const kbArticleIds = kb.sections.flatMap(s => s.categories.flatMap(c => c.articles.map(a => a.id)));
                    const kbSelIds     = kbArticleIds.filter(id => selected.has(id));
                    const kbSelChars   = kb.sections.flatMap(s => s.categories.flatMap(c => c.articles))
                                          .filter(a => selected.has(a.id)).reduce((acc, a) => acc + a.chars, 0);
                    const kbState      = checkState(kbArticleIds, selected);
                    const isKbOpen     = expandedKbs.has(kb.id);
                    const hasContent   = kb.sections.length > 0;

                    const toggleKbOpen = () => {
                      if (!hasContent) return;
                      setExpandedKbs(prev => { const n = new Set(prev); n.has(kb.id) ? n.delete(kb.id) : n.add(kb.id); return n; });
                    };

                    return (
                      <div key={kb.id} className="kb-card">
                        {/* KB header row */}
                        <div className={`kb-card__hdr${isKbOpen ? ' kb-card__hdr--open' : ''}`} onClick={toggleKbOpen}>
                          <span className="kb-card__name">{kb.name}</span>
                          {!isKbOpen && (
                            <span className={`kb-card__status${kbSelIds.length > 0 ? '' : ' kb-card__status--empty'}`}>
                              {kbSelIds.length > 0 ? `Выбрано статей: ${kbSelIds.length} / ${kbArticleIds.length}` : 'Статьи не выбраны'}
                            </span>
                          )}
                          <span className="ico-chev">{isKbOpen ? '▲' : '▼'}</span>
                        </div>

                        {/* KB expanded content */}
                        {isKbOpen && hasContent && (<>
                          {/* Search */}
                          <div className="search-box">
                            <Search size={16} color="#959696" strokeWidth={1.5} />
                            <input className="search-box__input"
                              placeholder="Поиск по названию раздела, категории или статьи"
                              value={search} onChange={e => setSearch(e.target.value)} />
                            {search && (
                              <button className="search-box__clear" onClick={() => setSearch('')}>
                                <X size={14} color="#959696" />
                              </button>
                            )}
                          </div>

                          {/* Summary */}
                          <div className="kb-summary">
                            <div className="kb-summary__left">
                              <CB
                                checked={kbState === 'all'} indeterminate={kbState === 'some'}
                                onClick={e => toggleGroup(kbArticleIds, e)}
                              />
                              <span className="kb-summary__count">
                                Выбрано статей: <b>{kbSelIds.length} / {kbArticleIds.length}</b>
                              </span>
                            </div>
                            <span className="kb-summary__chars">
                              Всего символов в выбранных статьях: <b>{fmtN(kbSelChars)}</b>
                            </span>
                          </div>

                          {/* Sections tree */}
                          <div className="tree">
                            {kb.sections
                              .filter(s => !search || s.name.toLowerCase().includes(search.toLowerCase()) ||
                                s.categories.some(c => c.name.toLowerCase().includes(search.toLowerCase()) ||
                                  c.articles.some(a => a.title.toLowerCase().includes(search.toLowerCase()))))
                              .map(section => {
                                const secIds   = section.categories.flatMap(c => c.articles.map(a => a.id));
                                const secState = checkState(secIds, selected);
                                const secChars = section.categories.flatMap(c => c.articles)
                                                  .filter(a => selected.has(a.id)).reduce((acc, a) => acc + a.chars, 0);
                                const totalSecChars = section.categories.flatMap(c => c.articles).reduce((acc, a) => acc + a.chars, 0);
                                const isSecOpen = expandedSecs.has(section.id);

                                return (
                                  <div key={section.id} className={`tree-section${isSecOpen ? ' tree-section--open' : ''}`}>
                                    {/* Section header */}
                                    <div className="tree-section__hdr"
                                      onClick={() => setExpandedSecs(prev => {
                                        const n = new Set(prev);
                                        n.has(section.id) ? n.delete(section.id) : n.add(section.id);
                                        return n;
                                      })}>
                                      <CB
                                        checked={secState === 'all'} indeterminate={secState === 'some'}
                                        onClick={e => toggleGroup(secIds, e)}
                                      />
                                      <div className="tree-section__label">
                                        <span className="tree-section__tag">Раздел</span>
                                        <span className="tree-section__name">{section.name}</span>
                                      </div>
                                      <span className="tree-chars">
                                        {secChars > 0 ? fmtN(secChars) + ' символов' : 'Всего ' + fmtN(totalSecChars) + ' символов'}
                                      </span>
                                      <span className="ico-chev">{isSecOpen ? '▲' : '▼'}</span>
                                    </div>

                                    {/* Section categories */}
                                    {isSecOpen && (
                                      <div className="tree-section__body">
                                        {section.categories.map(cat => {
                                          const catIds   = cat.articles.map(a => a.id);
                                          const catState = checkState(catIds, selected);
                                          const catChars = cat.articles.filter(a => selected.has(a.id)).reduce((acc, a) => acc + a.chars, 0);
                                          const totalCatChars = cat.articles.reduce((acc, a) => acc + a.chars, 0);
                                          const isCatOpen = expandedCats.has(cat.id);

                                          return (
                                            <div key={cat.id} className="tree-cat">
                                              {/* Category header */}
                                              <div className="tree-cat__hdr"
                                                onClick={() => setExpandedCats(prev => {
                                                  const n = new Set(prev);
                                                  n.has(cat.id) ? n.delete(cat.id) : n.add(cat.id);
                                                  return n;
                                                })}>
                                                <CB
                                                  checked={catState === 'all'} indeterminate={catState === 'some'}
                                                  onClick={e => toggleGroup(catIds, e)}
                                                />
                                                <span className="tree-cat__name">{cat.name}</span>
                                                <span className="tree-chars">{fmtN(catChars > 0 ? catChars : totalCatChars)}</span>
                                                <span className="ico-chev">{isCatOpen ? '▲' : '▼'}</span>
                                              </div>

                                              {/* Articles */}
                                              {isCatOpen && cat.articles
                                                .filter(a => !search || a.title.toLowerCase().includes(search.toLowerCase()))
                                                .map(article => (
                                                  <div key={article.id}
                                                    className={`tree-article${selected.has(article.id) ? ' tree-article--checked' : ''}`}
                                                    onClick={() => toggle(article.id)}>
                                                    <CB
                                                      checked={selected.has(article.id)}
                                                      onClick={e => { e.stopPropagation(); toggle(article.id); }}
                                                    />
                                                    <span className="tree-article__title">{article.title}</span>
                                                    {article.locked && <Lock size={13} color="#959696" strokeWidth={1.5} />}
                                                    <span className="tree-chars">{fmtN(article.chars)}</span>
                                                  </div>
                                                ))
                                              }
                                            </div>
                                          );
                                        })}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                          </div>
                        </>)}
                      </div>
                    );
                  })}

                  {/* Files */}
                  <div className="card card--files">
                    <div className="files-hdr">
                      <div>
                        <div className="files-hdr__title">Ваши файлы</div>
                        <div className="files-hdr__hint">Доступные форматы: txt, pdf, docx. Вес — до 10 Мб</div>
                      </div>
                      <button className="btn btn--accent-outline btn--sm" onClick={() => fileInputRef.current.click()}>
                        + Добавить файл для обучения
                      </button>
                      <input ref={fileInputRef} type="file" multiple accept=".txt,.pdf,.docx" onChange={handleFileInput} style={{ display: 'none' }} />
                    </div>
                    {files.length > 0 && (
                      <div className="file-list">
                        {files.map(f => (
                          <div key={f.id} className="file-item">
                            <span className={`file-item__ico file-item__ico--${f.status}`}>
                              {f.status === 'uploaded' ? '📄' : f.status === 'error' ? '⚠' : '⟳'}
                            </span>
                            <div className="file-item__info">
                              <span className="file-item__name">{f.name}</span>
                              <div className="file-item__meta">
                                {f.status === 'uploaded' && <span className="s-ok">Загружен</span>}
                                {f.status === 'error' && <span className="s-err">Не удалось загрузить</span>}
                                {f.status === 'loading' && <span className="s-grey">Загружается</span>}
                                <span className="s-grey">{f.size}</span>
                              </div>
                            </div>
                            <button className="file-item__rm" onClick={() => setFiles(prev => prev.filter(x => x.id !== f.id))}>✕</button>
                          </div>
                        ))}
                      </div>
                    )}
                    {hasFiles && <button className="btn btn--primary btn--sm">Отправить файлы на проверку</button>}
                  </div>

                  {/* Counter */}
                  <div className="card card--counter">
                    <div className="counter-hdr">
                      <span className="counter-hdr__label">Количество символов для обучения</span>
                      <span className="counter-hdr__val">{fmtN(totalSelectedChars)} / 150 000</span>
                    </div>
                    <div className="progress">
                      <div className="progress__fill" style={{ width: Math.min(totalSelectedChars / 1500, 100) + '%' }} />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="actions-row">
                    {!isTrained ? (
                      <div className="train-btn-wrap"
                        onMouseEnter={() => setTrainHover(true)}
                        onMouseLeave={() => setTrainHover(false)}>
                        <button
                          className={`btn btn--lg${canTrain ? ' btn--primary' : ' btn--disabled'}`}
                          onClick={canTrain ? startTraining : undefined}
                          disabled={!canTrain}>
                          Обучить бота
                        </button>
                        <div className={`hint-tooltip${trainHover && !canTrain ? ' hint-tooltip--show' : ''}`}>
                          <div className="hint-tooltip__body">
                            Для запуска обучения нужно выбрать хотя бы одну статью из базы знаний или загрузить файл
                          </div>
                          <div className="hint-tooltip__arrow" />
                        </div>
                      </div>
                    ) : (
                      <div className="update-btn-wrap"
                        onMouseEnter={() => setUpdateHover(true)}
                        onMouseLeave={() => setUpdateHover(false)}>
                        <button
                          className={`btn btn--lg${hasNewMaterials ? ' btn--update' : ' btn--disabled'}`}
                          onClick={hasNewMaterials ? startTraining : undefined}
                          disabled={!hasNewMaterials}>
                          Обновить материалы
                        </button>
                        <div className={`hint-tooltip hint-tooltip--update${updateHover ? ' hint-tooltip--show' : ''}`}>
                          <div className="hint-tooltip__body">Будет создана новая версия бота</div>
                          <div className="hint-tooltip__arrow" />
                        </div>
                      </div>
                    )}
                    <button className="btn btn--ghost btn--lg"
                      onClick={() => { setSelected(new Set()); setFiles([]); }}>
                      Сбросить все
                    </button>
                  </div>
                </>)}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className={`toast toast--${toast.type}`}>{toast.text}</div>
      )}
    </div>
  );
}
