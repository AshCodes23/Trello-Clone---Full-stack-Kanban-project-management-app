import { useState, useEffect, useRef } from 'react';
import { getBoards, createBoard, getLabels, getUsers } from './api';
import BoardView from './BoardView';
import { LayoutDashboard, X, ChevronDown, User, LogOut, Settings, Filter } from 'lucide-react';
import './index.css';

function App() {
  const [boardId, setBoardId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Recent dropdown state
  const [showRecent, setShowRecent] = useState(false);
  const [boards, setBoards] = useState([]);
  const recentRef = useRef(null);

  // Account dropdown state
  const [showAccount, setShowAccount] = useState(false);
  const accountRef = useRef(null);

  // Create modal state
  const [showCreate, setShowCreate] = useState(false);
  const [newBoardTitle, setNewBoardTitle] = useState('');
  const [newBoardColor, setNewBoardColor] = useState('#0079bf');
  const [isCreating, setIsCreating] = useState(false);

  // Filter state
  const [showFilter, setShowFilter] = useState(false);
  const [filterLabels, setFilterLabels] = useState([]);
  const [filterMembers, setFilterMembers] = useState([]);
  const [filterDue, setFilterDue] = useState(''); // '', 'overdue', 'upcoming'
  const [allLabels, setAllLabels] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const filterRef = useRef(null);

  const boardColors = [
    '#0079bf', '#d29034', '#519839', '#b04632',
    '#89609e', '#cd5a91', '#4bbf6b', '#00aecc',
    '#838c91'
  ];

  useEffect(() => {
    loadBoards();
  }, []);

  const loadBoards = () => {
    getBoards().then(res => {
      setBoards(res.data || []);
      if (!boardId && res.data && res.data.length > 0) {
        setBoardId(res.data[0].id);
      }
    }).catch(console.error);
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (recentRef.current && !recentRef.current.contains(e.target)) setShowRecent(false);
      if (accountRef.current && !accountRef.current.contains(e.target)) setShowAccount(false);
      if (filterRef.current && !filterRef.current.contains(e.target)) setShowFilter(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const openFilter = () => {
    if (!showFilter) {
      getLabels().then(res => setAllLabels(res.data)).catch(console.error);
      getUsers().then(res => setAllUsers(res.data)).catch(console.error);
    }
    setShowFilter(!showFilter);
  };

  const toggleFilterLabel = (id) => {
    setFilterLabels(prev => prev.includes(id) ? prev.filter(l => l !== id) : [...prev, id]);
  };
  const toggleFilterMember = (id) => {
    setFilterMembers(prev => prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]);
  };
  const clearFilters = () => { setFilterLabels([]); setFilterMembers([]); setFilterDue(''); };
  const hasActiveFilters = filterLabels.length > 0 || filterMembers.length > 0 || filterDue !== '';

  const handleOpenRecent = () => {
    loadBoards();
    setShowRecent(!showRecent);
  };

  const handleSelectBoard = (id) => {
    setBoardId(id);
    setShowRecent(false);
  };

  const handleCreateBoard = async (e) => {
    e.preventDefault();
    if (!newBoardTitle.trim() || isCreating) return;
    setIsCreating(true);
    try {
      const res = await createBoard({ title: newBoardTitle, background: newBoardColor });
      setBoardId(res.data.id);
      setNewBoardTitle('');
      setNewBoardColor('#0079bf');
      setShowCreate(false);
      loadBoards();
    } catch (err) {
      console.error(err);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="app-container">
      <header className="top-nav">
        <div className="top-nav-left">
          <a href="#" className="logo" onClick={() => window.location.reload()}>
            <LayoutDashboard size={20} />
            <span>Trello Clone</span>
          </a>
          <button className="btn btn-transparent">Workspaces</button>

          {/* Recent Dropdown */}
          <div className="dropdown-wrapper" ref={recentRef}>
            <button className="btn btn-transparent" onClick={handleOpenRecent}>
              Recent <ChevronDown size={14} style={{ marginLeft: 4 }} />
            </button>
            {showRecent && (
              <div className="dropdown-menu">
                <div className="dropdown-header">Recent boards</div>
                {boards.length === 0 ? (
                  <div className="dropdown-empty">No boards yet</div>
                ) : (
                  boards.map(b => (
                    <div
                      key={b.id}
                      className={`dropdown-item${b.id === boardId ? ' active' : ''}`}
                      onClick={() => handleSelectBoard(b.id)}
                    >
                      <div
                        className="dropdown-item-color"
                        style={{ backgroundColor: b.background || '#0079bf' }}
                      />
                      <span>{b.title}</span>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Create Button */}
          <button className="btn btn-primary" onClick={() => setShowCreate(true)}>Create</button>
        </div>

        <div className="top-nav-right">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="nav-search-input"
            />
          </div>
          <div className="dropdown-wrapper" ref={accountRef}>
            <button className="btn btn-transparent avatar-btn" onClick={() => setShowAccount(!showAccount)}>DU</button>
            {showAccount && (
              <div className="dropdown-menu account-dropdown">
                <div className="account-info">
                  <div className="account-avatar">DU</div>
                  <div className="account-details">
                    <div className="account-name">Default User</div>
                    <div className="account-email">user@trello.node</div>
                  </div>
                </div>
                <div className="dropdown-divider"></div>
                <div className="dropdown-item" onClick={() => setShowAccount(false)}>
                  <User size={16} /> Profile
                </div>
                <div className="dropdown-item" onClick={() => setShowAccount(false)}>
                  <Settings size={16} /> Settings
                </div>
                <div className="dropdown-divider"></div>
                <div className="dropdown-item logout-item" onClick={() => { setShowAccount(false); alert('Sign out is not implemented (no auth).'); }}>
                  <LogOut size={16} /> Sign out
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {boardId ? (
        <BoardView
          boardId={boardId}
          searchQuery={searchQuery}
          filterLabels={filterLabels}
          filterMembers={filterMembers}
          filterDue={filterDue}
          openFilter={openFilter}
          showFilter={showFilter}
          filterRef={filterRef}
          allLabels={allLabels}
          allUsers={allUsers}
          toggleFilterLabel={toggleFilterLabel}
          toggleFilterMember={toggleFilterMember}
          setFilterDue={setFilterDue}
          clearFilters={clearFilters}
          hasActiveFilters={hasActiveFilters}
        />
      ) : (
        <div style={{ padding: '40px', color: '#172b4d', textAlign: 'center' }}>Loading board...</div>
      )}

      {/* Create Board Modal */}
      {showCreate && (
        <div className="modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="create-board-modal" onClick={e => e.stopPropagation()}>
            <div className="create-board-header">
              <h3>Create board</h3>
              <button className="create-board-close" onClick={() => setShowCreate(false)}>
                <X size={18} />
              </button>
            </div>

            <div
              className="create-board-preview"
              style={{ backgroundColor: newBoardColor }}
            >
              <span className="create-board-preview-title">
                {newBoardTitle || 'Board title'}
              </span>
            </div>

            <form onSubmit={handleCreateBoard} className="create-board-form">
              <label className="create-board-label">Background</label>
              <div className="color-picker">
                {boardColors.map(c => (
                  <div
                    key={c}
                    className={`color-swatch${newBoardColor === c ? ' selected' : ''}`}
                    style={{ backgroundColor: c }}
                    onClick={() => setNewBoardColor(c)}
                  />
                ))}
              </div>

              <label className="create-board-label">Board title <span className="required">*</span></label>
              <input
                type="text"
                value={newBoardTitle}
                onChange={e => setNewBoardTitle(e.target.value)}
                autoFocus
                placeholder="Enter board title"
                className="create-board-input"
              />

              <button
                type="submit"
                className="btn btn-primary create-board-submit"
                disabled={!newBoardTitle.trim() || isCreating}
              >
                {isCreating ? 'Creating...' : 'Create'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
