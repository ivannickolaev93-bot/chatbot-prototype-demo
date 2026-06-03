import React, { useState, useRef } from 'react';
import './App.css';
import usedeskLogo from './usedesk_logo.svg';
import {
  Search, MessageCircle, Mail, Tag, IdCard, UserRound, CircleHelp,
  FileText, Inbox, Zap, Code2, Bot, ClipboardPen, Settings, Info,
  Lock, X, BookOpen, MessageSquareText, BookText,
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
  { id: 'settings',     label: 'Настройки',        Icon: Settings           },
  { id: 'training',     label: 'Обучение',          Icon: BookOpen           },
  { id: 'testing',      label: 'Тестирование',      Icon: MessageSquareText  },
  { id: 'instructions', label: 'Особые инструкции', Icon: BookText           },
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
  const [showRetrain,     setShowRetrain]     = useState(false);
  const [trainHover,      setTrainHover]      = useState(false);
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
    setBotStatus('training');
    setTimeout(() => setBotStatus('trained'), 3500);
  }

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

  const ver = BOT_VERSIONS.find(v => v.id === currentVersion);

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
            {NAV_ITEMS.map(({ id, label, Icon }) => (
              <button key={id}
                className={`fbar-item${activeTab === id ? ' fbar-item--active' : ''}`}
                onClick={() => setActiveTab(id)}>
                <Icon size={20} strokeWidth={1.5} className="fbar-icon" />
                <span>{label}</span>
              </button>
            ))}
          </nav>

          {/* ── Content ── */}
          <div className="content">
            {activeTab !== 'training' && (
              <div className="tab-stub">
                {{ settings: 'Настройки', testing: 'Тестирование', instructions: 'Особые инструкции' }[activeTab]}
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
                      <>
                        <button className="btn btn--primary btn--lg" onClick={() => setShowRetrain(true)}>Дообучить бота</button>
                        <button className="btn btn--outline btn--lg" onClick={() => setActiveTab('settings')}>Перейти к настройкам</button>
                        <button className="btn btn--outline btn--lg" onClick={() => setActiveTab('testing')}>Перейти к тестированию</button>
                      </>
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

      {/* Retrain modal */}
      {showRetrain && (
        <div className="overlay" onClick={() => setShowRetrain(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal__hdr">
              <span>Дообучить бота</span>
              <button className="modal__close" onClick={() => setShowRetrain(false)}>✕</button>
            </div>
            <p className="modal__desc">После дообучения будет создана новая версия. Выберите действие:</p>
            <div className="modal__actions">
              <button className="btn btn--primary btn--block"
                onClick={() => { setShowRetrain(false); startTraining(); setActiveTab('testing'); }}>
                Протестировать обновления
              </button>
              <button className="btn btn--secondary btn--block"
                onClick={() => { setShowRetrain(false); startTraining(); }}>
                Применить обновления без тестирования
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
