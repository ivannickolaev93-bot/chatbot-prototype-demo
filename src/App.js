import React, { useState, useRef, useEffect } from 'react';
import './App.css';
import usedeskLogo from './usedesk_logo.svg';
import chatIllustration from './chat-illustration.png';
import {
  Search, MessageCircle, Mail, Tag, IdCard, UserRound, CircleHelp,
  FileText, Inbox, Zap, Code2, Bot, ClipboardPen, Settings, Info,
  Lock, X, BookOpen, MessageSquareText, BookText, Camera, Check,
  CircleAlert, TriangleAlert, Pencil, Trash2, Plus, Search as SearchIcon,
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

const VERSION_AUTHOR = 'Константин Иванов';

const INIT_INSTRUCTIONS = [
  { id: 'i1', name: 'Тех сбой', enabled: true,  text: 'При техническом сбое сообщай клиенту, что мы уже работаем над проблемой, и предлагай вернуться позже.' },
  { id: 'i2', name: 'Выходные', enabled: false, text: 'Если сегодня суббота или воскресенье, то необходимо сообщать клиентам, что заказ будет сформирован в ближайший понедельник. До этого момента можно внести изменения в заказ без изменения срока доставки' },
  { id: 'i3', name: 'Сбой в работе базы данных', enabled: false, text: 'При сбое базы данных извинись за временные неудобства и попроси повторить запрос через несколько минут.' },
  { id: 'i4', name: 'Акция 1+1', enabled: true,  text: 'Сообщай клиентам про акцию 1+1 на все товары категории «Аксессуары» до конца месяца.' },
  { id: 'i5', name: 'Неисправность оборудования на складе', enabled: false, text: 'При неисправности складского оборудования предупреждай о возможной задержке отгрузки на 1–2 дня.' },
  { id: 'i6', name: 'Скидка 20% на все', enabled: true,  text: 'Информируй клиентов о скидке 20% на весь ассортимент по промокоду SALE20.' },
  { id: 'i7', name: 'Бесплатная доставка от 3 000', enabled: true,  text: 'Сообщай, что доставка бесплатна при заказе от 3 000 рублей.' },
];

const BLANK_SETTINGS = {
  botName: '', channels: [], assignees: [], transferText: '',
  launched: false, enabled: false, dirty: false, saved: false,
  errors: {}, avatarUrl: null,
};

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
  const [messagesByVersion, setMessagesByVersion] = useState({}); // { [versionId]: [...messages] } — свой чат у каждой версии
  const [chatInput,       setChatInput]       = useState('');
  const [botTyping,       setBotTyping]       = useState(null); // id версии, в чате которой бот печатает
  const [testingLoading,  setTestingLoading]  = useState(false);
  const [trainedSnapshot, setTrainedSnapshot] = useState(null); // Set of article ids at training time
  const [updateHover,     setUpdateHover]     = useState(false);
  const messagesEndRef = useRef(null);

  // Settings state — свои настройки у каждой версии
  const [settingsByVersion, setSettingsByVersion] = useState({}); // { [versionId]: BLANK_SETTINGS }
  const [showChannelsDrop,setShowChannelsDrop]= useState(false);
  const [showAssignDrop,  setShowAssignDrop]  = useState(false);
  const [toast,           setToast]           = useState(null); // { text, type }
  const [confirmEnable,   setConfirmEnable]   = useState(null); // { otherLabel, launching } — модалка конфликта версий

  // Особые инструкции — общие для всех версий
  const [instructions,    setInstructions]    = useState(INIT_INSTRUCTIONS);
  const [instrEnabledOnly,setInstrEnabledOnly]= useState(false);
  const [instrSearch,     setInstrSearch]     = useState('');
  const [expandedInstr,   setExpandedInstr]   = useState(new Set(['i2']));
  const [drawer,          setDrawer]          = useState(null); // null | { id?, name, text } — панель создания/редактирования
  const [deleteInstr,     setDeleteInstr]     = useState(null); // id удаляемой инструкции
  const avatarInputRef = useRef(null);
  const channelsRef = useRef(null);
  const assignRef   = useRef(null);
  const versionRef  = useRef(null);
  const [versionOpen,     setVersionOpen]     = useState(false);
  const [verHover,        setVerHover]        = useState(false);
  const [versions,        setVersions]        = useState([]); // { id, label, status, date, time, author } — реальное время создания
  const [currentVersion,  setCurrentVersion]  = useState(null); // просматриваемая версия
  const fileInputRef = useRef(null);

  // Настройки текущей версии + хелперы
  const s = settingsByVersion[currentVersion] || BLANK_SETTINGS;
  const botName      = s.botName;
  const channels     = s.channels;
  const assignees    = s.assignees;
  const transferText = s.transferText;
  const botLaunched  = s.launched;
  const botEnabled   = s.enabled;
  const settingsDirty= s.dirty;
  const settingsSaved= s.saved;
  const errors       = s.errors;
  const avatarUrl    = s.avatarUrl;
  const getS = (id) => settingsByVersion[id] || BLANK_SETTINGS;
  function updateS(patch) {
    setSettingsByVersion(prev => ({ ...prev, [currentVersion]: { ...(prev[currentVersion] || BLANK_SETTINGS), ...patch } }));
  }

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
      setVersions(prev => {
        const num = prev.length + 1;
        const d = new Date();
        const newVer = {
          id: 'v' + num,
          label: 'Версия ' + num,
          status: 'Создана',
          date: d.toLocaleDateString('ru-RU'),                                  // 03.06.2026
          time: d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }), // 14:30
          author: VERSION_AUTHOR,
        };
        setCurrentVersion(newVer.id); // активна новая версия
        return [...prev, newVer];
      });
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

  // Включает версию и выключает все остальные (жива только одна)
  function activateVersion(prev, verId, extra = {}) {
    const out = {};
    for (const k in prev) out[k] = { ...prev[k], enabled: false };
    out[verId] = { ...(prev[verId] || BLANK_SETTINGS), enabled: true, ...extra };
    return out;
  }

  // Применяет включение версии (выключая остальные)
  function doEnable(launching) {
    setSettingsByVersion(prev => activateVersion(prev, currentVersion, launching ? { launched: true, dirty: false } : {}));
    showToast('Бот запущен и работает');
  }

  // Запрос на включение: если уже работает другая версия — показываем модалку
  function requestEnable(launching) {
    const other = versions.find(v => v.id !== currentVersion && getS(v.id).enabled);
    if (other) {
      setConfirmEnable({ otherLabel: other.label.toLowerCase(), launching });
      return;
    }
    doEnable(launching);
  }

  function launchBot() {
    requestEnable(true);
  }

  function toggleBot() {
    if (!botEnabled) {
      requestEnable(false);
      return;
    }
    // выключение текущей версии
    setSettingsByVersion(prev => ({ ...prev, [currentVersion]: { ...(prev[currentVersion] || BLANK_SETTINGS), enabled: false } }));
    showToast('Бот остановлен');
  }

  function saveSettings() {
    const nextErrors = {};
    if (botName.trim() === '')  nextErrors.botName   = 'Без названия не получится сохранить изменения';
    if (channels.length === 0)  nextErrors.channels  = 'Нужно выбрать хотя бы один канал';
    if (assignees.length === 0) nextErrors.assignees = 'Нужно выбрать хотя бы одного исполнителя';

    if (Object.keys(nextErrors).length > 0) {
      updateS({ errors: nextErrors });
      return;
    }

    updateS({ errors: {}, dirty: false, saved: true });
    showToast('Настройки сохранены');
  }

  // Кнопка «Сохранить» всегда кликабельна — валидация срабатывает при нажатии
  const canSave   = true;
  const canLaunch = settingsSaved && !settingsDirty;

  function handleAvatarChange(e) {
    const file = e.target.files[0];
    if (file) updateS({ avatarUrl: URL.createObjectURL(file) });
  }

  function toggleOption(field, id, errorKey) {
    setSettingsByVersion(prev => {
      const cur = prev[currentVersion] || BLANK_SETTINGS;
      const list = cur[field];
      const nextList = list.includes(id) ? list.filter(x => x !== id) : [...list, id];
      const nextErrors = { ...cur.errors };
      if (errorKey) delete nextErrors[errorKey];
      return { ...prev, [currentVersion]: { ...cur, [field]: nextList, dirty: true, errors: nextErrors } };
    });
  }

  // ── Особые инструкции ──
  function toggleInstr(id) {
    setInstructions(prev => prev.map(i => i.id === id ? { ...i, enabled: !i.enabled } : i));
  }
  function saveDrawer() {
    if (!drawer.name.trim() || !drawer.text.trim()) return;
    if (drawer.id) {
      setInstructions(prev => prev.map(i => i.id === drawer.id ? { ...i, name: drawer.name, text: drawer.text } : i));
      showToast('Инструкция сохранена');
    } else {
      setInstructions(prev => [...prev, { id: 'i' + Date.now(), name: drawer.name, text: drawer.text, enabled: true }]);
      showToast('Инструкция добавлена');
    }
    setDrawer(null);
  }
  function confirmDelete() {
    setInstructions(prev => prev.filter(i => i.id !== deleteInstr));
    setDeleteInstr(null);
    showToast('Инструкция удалена');
  }
  const visibleInstr = instructions.filter(i =>
    (!instrEnabledOnly || i.enabled) &&
    (!instrSearch || i.name.toLowerCase().includes(instrSearch.toLowerCase()))
  );

  const ver = versions.find(v => v.id === currentVersion);
  const messages = messagesByVersion[currentVersion] || []; // чат текущей версии

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messagesByVersion, currentVersion, botTyping]);

  // Закрытие дропдаунов по клику вне области
  useEffect(() => {
    function handleClickOutside(e) {
      if (channelsRef.current && !channelsRef.current.contains(e.target)) setShowChannelsDrop(false);
      if (assignRef.current   && !assignRef.current.contains(e.target))   setShowAssignDrop(false);
      if (versionRef.current  && !versionRef.current.contains(e.target))  setVersionOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function now() {
    return new Date().toLocaleString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  function sendMessage() {
    const text = chatInput.trim();
    if (!text) return;
    const verId = currentVersion;
    const userMsg = { id: Date.now(), type: 'user', sender: 'Вы', time: now(), text };
    setMessagesByVersion(prev => ({ ...prev, [verId]: [...(prev[verId] || []), userMsg] }));
    setChatInput('');
    setBotTyping(verId);
    setTimeout(() => {
      const reply = BOT_REPLIES[Math.floor(Math.random() * BOT_REPLIES.length)];
      const botMsg = { id: Date.now() + 1, type: 'bot', sender: 'Чат-бот', time: now(), text: reply };
      setMessagesByVersion(prev => ({ ...prev, [verId]: [...(prev[verId] || []), botMsg] }));
      setBotTyping(null);
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
            {versions.length >= 1 && (
            <div className="ver-btn" ref={versionRef}
              onClick={() => versions.length >= 2 && setVersionOpen(v => !v)}
              onMouseEnter={() => setVerHover(true)}
              onMouseLeave={() => setVerHover(false)}>
              <span className={`ver-dot${botEnabled ? ' ver-dot--on' : ''}`} />
              <span>{ver?.label}</span>
              <span className="ico-chev">▾</span>
              {versions.length < 2 && verHover && (
                <div className="ver-tooltip">После дообучения создаётся новая версия бота</div>
              )}
              {versionOpen && versions.length >= 2 && (
                <div className="ver-drop" onClick={e => e.stopPropagation()}>
                  <div className="ver-drop__header">версии бота</div>
                  {[...versions].slice(-2).reverse().map(v => (
                    <div key={v.id}
                      className={`ver-drop__row${v.id === currentVersion ? ' ver-drop__row--active' : ''}`}
                      onClick={() => { setCurrentVersion(v.id); setVersionOpen(false); }}>
                      <div className="ver-drop__name">
                        <span className={`ver-dot${getS(v.id).enabled ? ' ver-dot--on' : ''}`} />
                        {v.label}
                      </div>
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
            )}
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
              <div className="instr-page">
                {/* Title + toggle */}
                <div className="training-head">
                  <span className="training-title">Особые инструкции</span>
                  <label className="toggle-row" onClick={() => setInstrEnabledOnly(p => !p)}>
                    <span className={`sw${instrEnabledOnly ? ' sw--on' : ''}`}><span className="sw__knob" /></span>
                    <span className="toggle-label">Показывать только включенные</span>
                  </label>
                </div>

                {/* Info banner */}
                <div className="instr-banner">
                  <div className="instr-banner__info">
                    <div className="instr-banner__title">Обратите внимание</div>
                    <div className="instr-banner__text">
                      Инструкции применяются сразу ко всем версиям бота и не влияют на общий лимит символов в базе материалов для обучения бота
                    </div>
                  </div>
                  <button className="btn btn--accent-outline btn--sm" onClick={() => setDrawer({ name: '', text: '' })}>
                    <Plus size={16} strokeWidth={2} /> Добавить инструкцию
                  </button>
                </div>

                {/* Search */}
                <div className="search-box instr-search">
                  <SearchIcon size={16} color="#959696" strokeWidth={1.5} />
                  <input className="search-box__input" placeholder="Поиск по названию"
                    value={instrSearch} onChange={e => setInstrSearch(e.target.value)} />
                  {instrSearch && (
                    <button className="search-box__clear" onClick={() => setInstrSearch('')}>
                      <X size={14} color="#959696" />
                    </button>
                  )}
                </div>

                {/* Instruction list */}
                <div className="instr-list">
                  {visibleInstr.length === 0 ? (
                    <div className="instr-empty">Инструкции не найдены</div>
                  ) : visibleInstr.map(instr => {
                    const isExp = expandedInstr.has(instr.id);
                    return (
                      <div key={instr.id} className="instr-card">
                        <div className="instr-card__head">
                          <span className={`sw${instr.enabled ? ' sw--on' : ''}`}
                            onClick={() => toggleInstr(instr.id)}>
                            <span className="sw__knob" />
                          </span>
                          <span className={`instr-card__name${instr.enabled ? '' : ' instr-card__name--off'}`}
                            onClick={() => setExpandedInstr(prev => {
                              const n = new Set(prev); n.has(instr.id) ? n.delete(instr.id) : n.add(instr.id); return n;
                            })}>
                            {instr.name}
                          </span>
                          <button className="instr-card__chev"
                            onClick={() => setExpandedInstr(prev => {
                              const n = new Set(prev); n.has(instr.id) ? n.delete(instr.id) : n.add(instr.id); return n;
                            })}>
                            <span className="ico-chev">{isExp ? '▲' : '▼'}</span>
                          </button>
                        </div>
                        {isExp && (
                          <div className="instr-card__body">
                            <p className="instr-card__text">{instr.text}</p>
                            <div className="instr-card__actions">
                              <button className="btn btn--outline btn--sm"
                                onClick={() => setDrawer({ id: instr.id, name: instr.name, text: instr.text })}>
                                <Pencil size={16} strokeWidth={1.5} /> Редактировать
                              </button>
                              <button className="instr-icon-btn" onClick={() => setDeleteInstr(instr.id)}>
                                <Trash2 size={16} strokeWidth={1.5} color="#676768" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
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
                      <button
                        className={`btn${canLaunch ? ' btn--primary' : ' btn--disabled'}`}
                        onClick={canLaunch ? launchBot : undefined}
                        disabled={!canLaunch}>
                        Запустить бота
                      </button>
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
                        className={`s-input${errors.botName ? ' s-input--error' : ''}`}
                        placeholder="Введите имя бота"
                        value={botName}
                        onChange={e => {
                          const val = e.target.value;
                          const nextErrors = { ...errors };
                          if (val.trim()) delete nextErrors.botName;
                          updateS({ botName: val, dirty: true, errors: nextErrors });
                        }}
                      />
                      {errors.botName && <span className="s-error">{errors.botName}</span>}
                    </div>

                    {/* Channels */}
                    <div className="s-field">
                      <label className="s-label">Каналы, в которых будет отвечать чат-бот *</label>
                      <div className={`s-multiselect${errors.channels ? ' s-multiselect--error' : ''}`} ref={channelsRef} onClick={() => setShowChannelsDrop(p => !p)}>
                        <div className="s-multiselect__tags">
                          {channels.length === 0
                            ? <span className="s-placeholder">Выберите каналы</span>
                            : channels.map(id => {
                                const opt = CHANNELS_OPTIONS.find(o => o.id === id);
                                return (
                                  <span key={id} className="s-tag">
                                    {opt?.label}
                                    <button className="s-tag__rm" onClick={e => { e.stopPropagation(); toggleOption('channels', id, 'channels'); }}>×</button>
                                  </span>
                                );
                              })
                          }
                        </div>
                        {channels.length > 0 && (
                          <button className="s-clear" onClick={e => { e.stopPropagation(); updateS({ channels: [], dirty: true }); }}>
                            <X size={16} color="#7f7f80" strokeWidth={1.5} />
                          </button>
                        )}
                        {showChannelsDrop && (
                          <div className="s-dropdown" onClick={e => e.stopPropagation()}>
                            {CHANNELS_OPTIONS.map(opt => {
                              const sel = channels.includes(opt.id);
                              return (
                                <div key={opt.id}
                                  className={`s-drop-item${sel ? ' s-drop-item--selected' : ''}`}
                                  onClick={() => toggleOption('channels', opt.id, 'channels')}>
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
                      {errors.channels && <span className="s-error">{errors.channels}</span>}
                    </div>

                    {/* Assignees */}
                    <div className="s-field">
                      <label className="s-label">На кого назначать запросы *</label>
                      <div className={`s-multiselect${errors.assignees ? ' s-multiselect--error' : ''}`} ref={assignRef} onClick={() => setShowAssignDrop(p => !p)}>
                        <div className="s-multiselect__tags">
                          {assignees.length === 0
                            ? <span className="s-placeholder">Выберите исполнителей или группы</span>
                            : assignees.map(id => {
                                const opt = ASSIGNEES_OPTIONS.find(o => o.id === id);
                                return (
                                  <span key={id} className="s-tag">
                                    {opt?.label}
                                    <button className="s-tag__rm" onClick={e => { e.stopPropagation(); toggleOption('assignees', id, 'assignees'); }}>×</button>
                                  </span>
                                );
                              })
                          }
                        </div>
                        {assignees.length > 0 && (
                          <button className="s-clear" onClick={e => { e.stopPropagation(); updateS({ assignees: [], dirty: true }); }}>
                            <X size={16} color="#7f7f80" strokeWidth={1.5} />
                          </button>
                        )}
                        {showAssignDrop && (
                          <div className="s-dropdown" onClick={e => e.stopPropagation()}>
                            {ASSIGNEES_OPTIONS.map(opt => {
                              const sel = assignees.includes(opt.id);
                              return (
                                <div key={opt.id}
                                  className={`s-drop-item${sel ? ' s-drop-item--selected' : ''}`}
                                  onClick={() => toggleOption('assignees', opt.id, 'assignees')}>
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
                      {errors.assignees && <span className="s-error">{errors.assignees}</span>}
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
                          onChange={e => updateS({ transferText: e.target.value, dirty: true })}
                        />
                        <span className="s-textarea__counter">{transferText.length}/1000</span>
                      </div>
                    </div>

                  </div>

                  {/* Save button */}
                  <div className="settings-actions">
                    <button
                      className={`btn${canSave ? ' btn--primary' : ' btn--save-disabled'}`}
                      onClick={canSave ? saveSettings : undefined}
                      disabled={!canSave}>
                      Сохранить
                    </button>
                  </div>
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
                  ) : messages.length === 0 && botTyping !== currentVersion ? (
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
                      {botTyping === currentVersion && (
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

      {/* Drawer создания/редактирования инструкции */}
      {drawer && (
        <div className="drawer-overlay" onClick={() => setDrawer(null)}>
          <div className="drawer" onClick={e => e.stopPropagation()}>
            <div className="drawer__header">
              <span className="drawer__title">{drawer.id ? drawer.name || 'Инструкция' : 'Новая инструкция'}</span>
              <button className="drawer__close" onClick={() => setDrawer(null)}>
                <X size={24} strokeWidth={1.5} color="#676768" />
              </button>
            </div>
            <div className="drawer__content">
              <div className="s-field">
                <label className="s-label">Название инструкции *</label>
                <input className="s-input" placeholder="Введите название"
                  value={drawer.name} onChange={e => setDrawer(d => ({ ...d, name: e.target.value }))} />
              </div>
              <div className="s-field">
                <label className="s-label">Текст инструкции *</label>
                <div className="s-textarea-wrap">
                  <textarea className="s-textarea drawer__textarea" placeholder="Введите текст инструкции"
                    maxLength={1000} value={drawer.text}
                    onChange={e => setDrawer(d => ({ ...d, text: e.target.value }))} />
                  <span className="s-textarea__counter">{drawer.text.length}/1000</span>
                </div>
              </div>
            </div>
            <div className="drawer__actions">
              <button className="btn btn--primary"
                onClick={saveDrawer}
                disabled={!drawer.name.trim() || !drawer.text.trim()}>
                Сохранить
              </button>
              <button className="btn btn--outline" onClick={() => setDrawer(null)}>Отмена</button>
            </div>
          </div>
        </div>
      )}

      {/* Модалка удаления инструкции */}
      {deleteInstr && (
        <div className="overlay" onClick={() => setDeleteInstr(null)}>
          <div className="ver-modal" onClick={e => e.stopPropagation()}>
            <button className="ver-modal__close" onClick={() => setDeleteInstr(null)}>
              <X size={24} strokeWidth={1.5} color="#676768" />
            </button>
            <div className="ver-modal__top">
              <div className="ver-modal__icon ver-modal__icon--danger">
                <Trash2 size={24} strokeWidth={1.8} color="#db1436" />
              </div>
              <h3 className="ver-modal__title">Удалить инструкцию?</h3>
              <p className="ver-modal__text">Инструкция будет удалена из всех версий бота</p>
            </div>
            <div className="ver-modal__actions">
              <button className="btn btn--danger-solid btn--block" onClick={confirmDelete}>Да, удалить</button>
              <button className="btn btn--outline btn--block" onClick={() => setDeleteInstr(null)}>Нет, оставить</button>
            </div>
          </div>
        </div>
      )}

      {/* Модалка конфликта версий */}
      {confirmEnable && (
        <div className="overlay" onClick={() => setConfirmEnable(null)}>
          <div className="ver-modal" onClick={e => e.stopPropagation()}>
            <button className="ver-modal__close" onClick={() => setConfirmEnable(null)}>
              <X size={24} strokeWidth={1.5} color="#676768" />
            </button>
            <div className="ver-modal__top">
              <div className="ver-modal__icon">
                <TriangleAlert size={24} strokeWidth={1.8} color="#ffaa00" />
              </div>
              <h3 className="ver-modal__title">Включить новую версию?</h3>
              <p className="ver-modal__text">
                Сейчас работает другая версия бота: {confirmEnable.otherLabel}. Если включить выбранную версию, то предыдущая будет выключена
              </p>
            </div>
            <div className="ver-modal__actions">
              <button className="btn btn--primary btn--block"
                onClick={() => { doEnable(confirmEnable.launching); setConfirmEnable(null); }}>
                Да, включить
              </button>
              <button className="btn btn--outline btn--block" onClick={() => setConfirmEnable(null)}>
                Не менять версию
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={`toast toast--${toast.type}`}>
          <div className="toast__body">
            {toast.type === 'error' && (
              <span className="toast__icon">
                <CircleAlert size={24} strokeWidth={1.5} color="#db1436" />
              </span>
            )}
            <span className="toast__text">{toast.text}</span>
            <button className="toast__close" onClick={() => setToast(null)}>
              <X size={16} strokeWidth={1.5} color="#676768" />
            </button>
          </div>
          <div className="toast__bar" />
        </div>
      )}
    </div>
  );
}
