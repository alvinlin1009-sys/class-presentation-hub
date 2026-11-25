(function () {
  const CLASS_204_DEFAULT_TEXT = [
    '01\t王鵬睿',
    '02\t田浩嚴',
    '03\t吳泉孟',
    '04\t宋珩睿',
    '05\t李昀諺',
    '06\t李柏宏',
    '07\t沈孟劭',
    '08\t林可捷',
    '09\t林承佑',
    '10\t林昶志',
    '11\t林聖庭',
    '12\t邱正碩',
    '13\t紀柏瑜',
    '14\t夏清彥',
    '15\t高睿毅',
    '16\t張宇椉',
    '17\t張定魁',
    '18\t張庭睿',
    '19\t章奕勛',
    '20\t陳子璿',
    '21\t黃伸億',
    '22\t黃柏勳',
    '23\t黃羿凱',
    '24\t楊家淳',
    '25\t楊家鈞',
    '26\t溫家誠',
    '27\t虞立安',
    '28\t詹崴宇',
    '29\t劉彥甫',
    '30\t蔡明峻',
    '31\t鄭智嘉',
    '32\t鄭澈星',
    '33\t賴柏維',
    '34\t謝汯志',
    '35\t鍾孟勳'
  ].join('\n');

  // Application State
  const state = {
    currentStep: 'class', // 'class' | 'subject' | 'topic' | 'board'
    currentClassId: '',
    currentSubjectId: '',
    currentTopicId: '',
    classes: [{ id: '204班', name: '204班', count: 35 }],
    subjects: [
      { id: '國文', name: '國文', icon: '📖', isDefault: true },
      { id: '英文', name: '英文', icon: '🔤', isDefault: true },
      { id: '數學', name: '數學', icon: '📐', isDefault: true },
      { id: '地理', name: '地理', icon: '🌍', isDefault: true },
      { id: '歷史', name: '歷史', icon: '🏛️', isDefault: true },
      { id: '公民', name: '公民', icon: '⚖️', isDefault: true },
      { id: '化學', name: '化學', icon: '🧪', isDefault: true },
      { id: '物理', name: '物理', icon: '⚡', isDefault: true },
      { id: '生物', name: '生物', icon: '🧬', isDefault: true }
    ],
    hierarchySummary: {},
    presentations: [],
    filterStatus: 'all',
    sortBy: 'order',
    searchQuery: '',
    serverInfo: {
      port: 3000,
      lanAddresses: [],
      isLocalHost: true,
      tunnel: { tunnelStatus: 'stopped', tunnelUrl: null, tunnelError: null }
    },
    selectedNetworkUrl: window.location.origin,
    sourceMode: 'file',
    pendingFile: null,
    editingExistingFile: null,
    activeViewerItem: null,
    lotteryWinner: null,
    hasAutoOpenedUpload: false
  };

  // DOM Elements
  const els = {
    homeLogoBtn: document.getElementById('homeLogoBtn'),
    sessionTitleDisplay: document.getElementById('sessionTitleDisplay'),
    navBreadcrumb: document.getElementById('navBreadcrumb'),
    switchClassBtn: document.getElementById('switchClassBtn'),
    breadcrumbSep1: document.getElementById('breadcrumbSep1'),
    switchSubjectBtn: document.getElementById('switchSubjectBtn'),
    breadcrumbSep2: document.getElementById('breadcrumbSep2'),
    switchTopicBtn: document.getElementById('switchTopicBtn'),
    headerSubtitleText: document.getElementById('headerSubtitleText'),
    boardHeaderActions: document.getElementById('boardHeaderActions'),
    backToTopicBtn: document.getElementById('backToTopicBtn'),
    liveIndicator: document.getElementById('liveIndicator'),

    // Wizard Screens
    stepClassScreen: document.getElementById('stepClassScreen'),
    classGridContainer: document.getElementById('classGridContainer'),
    stepSubjectScreen: document.getElementById('stepSubjectScreen'),
    backToClassStepBtn: document.getElementById('backToClassStepBtn'),
    selectedClassLabel: document.getElementById('selectedClassLabel'),
    subjectGridContainer: document.getElementById('subjectGridContainer'),
    stepTopicScreen: document.getElementById('stepTopicScreen'),
    backToSubjectStepBtn: document.getElementById('backToSubjectStepBtn'),
    selectedTopicPathLabel: document.getElementById('selectedTopicPathLabel'),
    topicGridContainer: document.getElementById('topicGridContainer'),
    stepBoardScreen: document.getElementById('stepBoardScreen'),

    statTotal: document.getElementById('statTotal'),
    statUnsubmitted: document.getElementById('statUnsubmitted'),
    statPending: document.getElementById('statPending'),
    statPresenting: document.getElementById('statPresenting'),
    statDone: document.getElementById('statDone'),

    uploadProgressSummaryText: document.getElementById('uploadProgressSummaryText'),
    uploadSummaryBarFill: document.getElementById('uploadSummaryBarFill'),
    currentPresentingBanner: document.getElementById('currentPresentingBanner'),
    progressPercentText: document.getElementById('progressPercentText'),
    progressBarFill: document.getElementById('progressBarFill'),

    tabCountAll: document.getElementById('tabCountAll'),
    tabCountUnsubmitted: document.getElementById('tabCountUnsubmitted'),
    tabCountSubmitted: document.getElementById('tabCountSubmitted'),
    tabCountPending: document.getElementById('tabCountPending'),
    tabCountPresenting: document.getElementById('tabCountPresenting'),
    tabCountDone: document.getElementById('tabCountDone'),

    miniQrTagText: document.getElementById('miniQrTagText'),
    miniQrContainer: document.getElementById('miniQrContainer'),
    miniQrUrl: document.getElementById('miniQrUrl'),
    copyUrlBtn: document.getElementById('copyUrlBtn'),
    expandQrBtn: document.getElementById('expandQrBtn'),

    searchInput: document.getElementById('searchInput'),
    sortSelect: document.getElementById('sortSelect'),
    manageMenuBtn: document.getElementById('manageMenuBtn'),
    manageDropdown: document.getElementById('manageDropdown'),
    openRosterFromMenuBtn: document.getElementById('openRosterFromMenuBtn'),
    sortSaveSeatBtn: document.getElementById('sortSaveSeatBtn'),
    resetAllStatusBtn: document.getElementById('resetAllStatusBtn'),
    newRoundBtn: document.getElementById('newRoundBtn'),

    presentationsContainer: document.getElementById('presentationsContainer'),
    emptyState: document.getElementById('emptyState'),
    emptyRosterBtn: document.getElementById('emptyRosterBtn'),

    openRosterModalBtn: document.getElementById('openRosterModalBtn'),
    openQrModalBtn: document.getElementById('openQrModalBtn'),
    openLotteryModalBtn: document.getElementById('openLotteryModalBtn'),
    openAddModalBtn: document.getElementById('openAddModalBtn'),

    // Modal 1: Upload / Edit Student Slot
    addEditModal: document.getElementById('addEditModal'),
    modalFormTitle: document.getElementById('modalFormTitle'),
    presentationForm: document.getElementById('presentationForm'),
    editItemId: document.getElementById('editItemId'),
    studentPickerSection: document.getElementById('studentPickerSection'),
    studentSelectDropdown: document.getElementById('studentSelectDropdown'),
    manualStudentFields: document.getElementById('manualStudentFields'),
    toggleEditNameBtn: document.getElementById('toggleEditNameBtn'),
    inputGroupOrSeat: document.getElementById('inputGroupOrSeat'),
    inputPresenterName: document.getElementById('inputPresenterName'),
    inputTitle: document.getElementById('inputTitle'),
    inputUrl: document.getElementById('inputUrl'),
    inputNote: document.getElementById('inputNote'),
    detectedLinkBadge: document.getElementById('detectedLinkBadge'),
    fileSourcePanel: document.getElementById('fileSourcePanel'),
    linkSourcePanel: document.getElementById('linkSourcePanel'),
    dropZone: document.getElementById('dropZone'),
    fileInput: document.getElementById('fileInput'),
    dropZonePrompt: document.getElementById('dropZonePrompt'),
    selectedFileInfo: document.getElementById('selectedFileInfo'),
    selectedFileIcon: document.getElementById('selectedFileIcon'),
    selectedFileName: document.getElementById('selectedFileName'),
    selectedFileSize: document.getElementById('selectedFileSize'),
    removeFileBtn: document.getElementById('removeFileBtn'),
    uploadProgressWrap: document.getElementById('uploadProgressWrap'),
    uploadProgressStatus: document.getElementById('uploadProgressStatus'),
    uploadProgressPercent: document.getElementById('uploadProgressPercent'),
    uploadProgressBar: document.getElementById('uploadProgressBar'),
    submitPresentationBtn: document.getElementById('submitPresentationBtn'),

    // Modal 2: Roster Manager
    rosterModal: document.getElementById('rosterModal'),
    rosterModalTitle: document.getElementById('rosterModalTitle'),
    rosterTextarea: document.getElementById('rosterTextarea'),
    rosterParsedCountBadge: document.getElementById('rosterParsedCountBadge'),
    rosterLivePreviewBox: document.getElementById('rosterLivePreviewBox'),
    load204RosterBtn: document.getElementById('load204RosterBtn'),
    uploadRosterFileBtn: document.getElementById('uploadRosterFileBtn'),
    rosterFileInput: document.getElementById('rosterFileInput'),
    exportRosterCsvBtn: document.getElementById('exportRosterCsvBtn'),
    saveRosterBtn: document.getElementById('saveRosterBtn'),

    // Modal 3: QR Code
    qrModal: document.getElementById('qrModal'),
    qrModalInstruction: document.getElementById('qrModalInstruction'),
    largeQrContainer: document.getElementById('largeQrContainer'),
    networkUrlSelect: document.getElementById('networkUrlSelect'),
    largeQrUrlText: document.getElementById('largeQrUrlText'),
    modalCopyUrlBtn: document.getElementById('modalCopyUrlBtn'),
    toggleTunnelBtn: document.getElementById('toggleTunnelBtn'),
    tunnelStatusText: document.getElementById('tunnelStatusText'),

    // Modal 4: Lottery
    lotteryModal: document.getElementById('lotteryModal'),
    lotterySinglePanel: document.getElementById('lotterySinglePanel'),
    lotteryShufflePanel: document.getElementById('lotteryShufflePanel'),
    lotteryOnlySubmitted: document.getElementById('lotteryOnlySubmitted'),
    slotDisplayGroup: document.getElementById('slotDisplayGroup'),
    slotDisplayName: document.getElementById('slotDisplayName'),
    slotDisplayTitle: document.getElementById('slotDisplayTitle'),
    spinSingleBtn: document.getElementById('spinSingleBtn'),
    startWinnerBtn: document.getElementById('startWinnerBtn'),
    shuffleKeepDoneFirst: document.getElementById('shuffleKeepDoneFirst'),
    shufflePreviewList: document.getElementById('shufflePreviewList'),
    runShuffleBtn: document.getElementById('runShuffleBtn'),

    // Fullscreen Viewer
    viewerOverlay: document.getElementById('viewerOverlay'),
    viewerBadge: document.getElementById('viewerBadge'),
    viewerTitle: document.getElementById('viewerTitle'),
    viewerPresenter: document.getElementById('viewerPresenter'),
    viewerReloadBtn: document.getElementById('viewerReloadBtn'),
    viewerOpenNewTabBtn: document.getElementById('viewerOpenNewTabBtn'),
    viewerFullscreenBtn: document.getElementById('viewerFullscreenBtn'),
    viewerCompleteNextBtn: document.getElementById('viewerCompleteNextBtn'),
    viewerCloseBtn: document.getElementById('viewerCloseBtn'),
    viewerIframe: document.getElementById('viewerIframe'),

    toastContainer: document.getElementById('toastContainer')
  };

  // ==================== Helpers ====================
  function showToast(msg, duration = 3200) {
    const t = document.createElement('div');
    t.className = 'toast';
    t.textContent = msg;
    els.toastContainer.appendChild(t);
    setTimeout(() => {
      t.style.opacity = '0';
      t.style.transition = 'opacity 0.25s';
      setTimeout(() => t.remove(), 250);
    }, duration);
  }

  function formatBytes(bytes) {
    if (!bytes || bytes <= 0) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  function escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  const naturalCollator = new Intl.Collator('zh-TW', { numeric: true, sensitivity: 'base' });
  function compareSeat(a, b) {
    const sa = (a.groupOrSeat || '').trim();
    const sb = (b.groupOrSeat || '').trim();
    if (!sa && !sb) return (a.order || 0) - (b.order || 0);
    if (!sa) return 1;
    if (!sb) return -1;
    return naturalCollator.compare(sa, sb);
  }

  function detectLinkType(url) {
    const u = (url || '').trim().toLowerCase();
    if (!u) return 'link';
    if (u.includes('canva.com/')) return 'canva';
    if (u.includes('docs.google.com/presentation/')) return 'gslides';
    if (u.endsWith('.pdf') || u.includes('.pdf?')) return 'pdf';
    if (u.endsWith('.pptx') || u.endsWith('.ppt')) return 'pptx';
    return 'link';
  }

  function detectFileType(fileName) {
    const ext = (fileName || '').split('.').pop().toLowerCase();
    if (ext === 'pdf') return 'pdf';
    if (['pptx', 'ppt', 'ppsx'].includes(ext)) return 'pptx';
    return 'file';
  }

  function getFastFileUrl(item) {
    if (
      state.serverInfo &&
      state.serverInfo.supabasePublicBase &&
      item &&
      item.storedFileName
    ) {
      return `${state.serverInfo.supabasePublicBase}/${encodeURIComponent(item.storedFileName)}`;
    }
    return item && item.fileUrl ? `${window.location.origin}${item.fileUrl}` : '';
  }

  function resolvePresentationUrls(item) {
    if (item.fileUrl) {
      const fastUrl = getFastFileUrl(item);
      if (item.type === 'pdf') {
        return {
          embedUrl: `${fastUrl}#toolbar=1&navpanes=0&view=Fit`,
          newTabUrl: fastUrl
        };
      }
      return {
        embedUrl: fastUrl,
        newTabUrl: fastUrl
      };
    }

    let rawUrl = (item.url || '').trim();
    if (rawUrl && !/^https?:\/\//i.test(rawUrl)) {
      rawUrl = 'https://' + rawUrl;
    }

    const gslidesMatch = rawUrl.match(/docs\.google\.com\/presentation\/d\/([a-zA-Z0-9_-]+)/);
    if (gslidesMatch) {
      const docId = gslidesMatch[1];
      if (rawUrl.includes('/presentation/d/e/')) {
        const pubBase = rawUrl.split('?')[0].replace(/\/(pub|embed|edit).*$/, '');
        return {
          embedUrl: `${pubBase}/embed?start=false&loop=false`,
          newTabUrl: `${pubBase}/pub?start=false&loop=false`
        };
      }
      return {
        embedUrl: `https://docs.google.com/presentation/d/${docId}/embed?start=false&loop=false&rm=minimal`,
        newTabUrl: `https://docs.google.com/presentation/d/${docId}/edit`
      };
    }

    const driveFileMatch = rawUrl.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (driveFileMatch) {
      const fileId = driveFileMatch[1];
      return {
        embedUrl: `https://drive.google.com/file/d/${fileId}/preview`,
        newTabUrl: `https://drive.google.com/file/d/${fileId}/view`
      };
    }

    if (rawUrl.includes('canva.com/design/')) {
      const baseCanva = rawUrl.split('?')[0].replace(/\/(edit|view).*$/, '');
      return {
        embedUrl: `${baseCanva}/view?embed`,
        newTabUrl: `${baseCanva}/view`
      };
    }

    return {
      embedUrl: rawUrl,
      newTabUrl: rawUrl
    };
  }

  function getTypeMeta(item) {
    switch (item.type) {
      case 'canva':
        return {
          badgeClass: 'type-canva',
          icon: '🎨',
          label: 'Canva 簡報',
          btnClass: 'launch-canva',
          btnText: item.openMode === 'newtab' ? '🎨 開啟 Canva 新分頁播放' : '🎨 全螢幕開啟 Canva 簡報'
        };
      case 'gslides':
        return {
          badgeClass: 'type-gslides',
          icon: '📊',
          label: 'Google 簡報',
          btnClass: 'launch-gslides',
          btnText: '📊 用 Google 簡報開啟'
        };
      case 'pdf':
        return {
          badgeClass: 'type-pdf',
          icon: '📄',
          label: 'PDF 簡報檔',
          btnClass: 'launch-pdf',
          btnText: item.openMode === 'newtab' ? '📄 新分頁開啟 PDF 簡報' : '📄 全螢幕開啟 PDF 簡報'
        };
      case 'pptx':
        return {
          badgeClass: 'type-pptx',
          icon: '🟧',
          label: 'PowerPoint 檔',
          btnClass: 'launch-pptx',
          btnText: '📊 用 Google 簡報開啟'
        };
      case 'file':
        return {
          badgeClass: 'type-file',
          icon: '📁',
          label: '已上傳檔案',
          btnClass: '',
          btnText: '🚀 開啟簡報檔案'
        };
      default:
        return {
          badgeClass: 'type-link',
          icon: '🔗',
          label: '雲端連結',
          btnClass: '',
          btnText: item.openMode === 'newtab' ? '🔗 新分頁開啟簡報連結' : '🔗 全螢幕開啟簡報'
        };
    }
  }

  function getStatusMeta(item) {
    if (!item.hasSubmitted || item.status === 'unsubmitted') {
      return { label: '❌ 尚未上傳', cls: 'unsubmitted' };
    }
    if (item.status === 'presenting') {
      return { label: '🎙️ 報告進行中', cls: 'presenting' };
    }
    if (item.status === 'done') {
      return { label: '✅ 已完成報告', cls: 'done' };
    }
    return { label: '📥 已上傳・待報告', cls: 'pending' };
  }

  function getDisplayTopic(item) {
    if (item.title && item.title.trim()) {
      return item.title.trim();
    }
    if (item.originalFileName) {
      return item.originalFileName.replace(/\.[^/.]+$/, '');
    }
    if (item.type === 'canva') return 'Canva 雲端簡報';
    if (item.type === 'gslides') return 'Google 雲端簡報';
    if (item.url) return '線上簡報連結';
    return '';
  }

  function isStudentUploadClient() {
    const params = new URLSearchParams(window.location.search);
    if (params.get('upload') === '1' || params.get('client') === 'student') {
      return true;
    }
    const isMobileUA = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent || '');
    const isSmallScreen = window.innerWidth <= 820;
    if (isMobileUA || isSmallScreen) {
      return true;
    }
    if (state.serverInfo && state.serverInfo.isLocalHost === false) {
      return true;
    }
    return false;
  }

  function applyClientRoleUI() {
    const isStudent = isStudentUploadClient();
    if (els.openAddModalBtn) {
      els.openAddModalBtn.classList.toggle('hidden', !isStudent);
    }
  }

  // ==================== 4-Stage Navigation (Class -> Subject -> Topic -> Board) ====================
  function syncUrlState(stepName) {
    try {
      const nextParams = new URLSearchParams();
      if (stepName === 'subject' && state.currentClassId) {
        nextParams.set('step', 'subject');
        nextParams.set('classId', state.currentClassId);
      } else if (stepName === 'topic' && state.currentClassId && state.currentSubjectId) {
        nextParams.set('step', 'topic');
        nextParams.set('classId', state.currentClassId);
        nextParams.set('subjectId', state.currentSubjectId);
      } else if (
        stepName === 'board' &&
        state.currentClassId &&
        state.currentSubjectId &&
        state.currentTopicId
      ) {
        nextParams.set('step', 'board');
        nextParams.set('classId', state.currentClassId);
        nextParams.set('subjectId', state.currentSubjectId);
        nextParams.set('topicId', state.currentTopicId);
      }
      const qStr = nextParams.toString();
      const targetUrl = qStr ? `${window.location.pathname}?${qStr}` : window.location.pathname;
      window.history.replaceState(null, '', targetUrl);
    } catch (e) {}
  }

  function goToStep(stepName) {
    state.currentStep = stepName;
    syncUrlState(stepName);
    els.stepClassScreen.classList.toggle('hidden', stepName !== 'class');
    els.stepSubjectScreen.classList.toggle('hidden', stepName !== 'subject');
    els.stepTopicScreen.classList.toggle('hidden', stepName !== 'topic');
    els.stepBoardScreen.classList.toggle('hidden', stepName !== 'board');
    els.boardHeaderActions.classList.toggle('hidden', stepName !== 'board');
    els.navBreadcrumb.classList.toggle('hidden', stepName === 'class');

    const subObj = state.subjects.find((s) => s.id === state.currentSubjectId);
    const subIcon = subObj ? subObj.icon : '📘';

    if (stepName === 'class') {
      els.sessionTitleDisplay.textContent = '班級報告彙整中心';
      els.headerSubtitleText.textContent = 'Step 1：請先選擇要進行報告的班級';
      renderClassGrid();
    } else if (stepName === 'subject') {
      els.sessionTitleDisplay.textContent = '班級報告彙整中心';
      els.headerSubtitleText.textContent = 'Step 2：請選擇報告科目（國英數地歷公化物生或自訂科目）';
      els.selectedClassLabel.textContent = state.currentClassId;
      els.switchClassBtn.textContent = `🏫 ${state.currentClassId}`;
      els.breadcrumbSep1.classList.add('hidden');
      els.switchSubjectBtn.classList.add('hidden');
      els.breadcrumbSep2.classList.add('hidden');
      els.switchTopicBtn.classList.add('hidden');
      renderSubjectGrid();
    } else if (stepName === 'topic') {
      els.sessionTitleDisplay.textContent = '班級報告彙整中心';
      els.headerSubtitleText.textContent = 'Step 3：請選擇該科目的報告項目（可建立多個不同報告）';
      els.selectedTopicPathLabel.textContent = `${state.currentClassId} ▸ ${subIcon} ${state.currentSubjectId}`;
      els.switchClassBtn.textContent = `🏫 ${state.currentClassId}`;
      els.breadcrumbSep1.classList.remove('hidden');
      els.switchSubjectBtn.textContent = `${subIcon} ${state.currentSubjectId}`;
      els.switchSubjectBtn.classList.remove('hidden');
      els.breadcrumbSep2.classList.add('hidden');
      els.switchTopicBtn.classList.add('hidden');
      renderTopicGrid();
    } else if (stepName === 'board') {
      els.sessionTitleDisplay.textContent = '班級報告彙整中心';
      els.headerSubtitleText.textContent =
        '點選自己的座號與姓名即可上傳 PDF / PPTX 或貼上 Canva / Google 簡報，上台一鍵開啟';
      els.switchClassBtn.textContent = `🏫 ${state.currentClassId}`;
      els.breadcrumbSep1.classList.remove('hidden');
      els.switchSubjectBtn.textContent = `${subIcon} ${state.currentSubjectId}`;
      els.switchSubjectBtn.classList.remove('hidden');
      els.breadcrumbSep2.classList.remove('hidden');
      els.switchTopicBtn.textContent = `📝 ${state.currentTopicId}`;
      els.switchTopicBtn.classList.remove('hidden');
      renderQrCodes();
      renderAll();
    }
  }

  function selectClassAndGoToSubject(classId) {
    state.currentClassId = classId;
    goToStep('subject');
  }

  function selectSubjectAndGoToTopic(subjectId) {
    state.currentSubjectId = subjectId;
    goToStep('topic');
  }

  async function selectTopicAndGoToBoard(topicId) {
    state.currentTopicId = topicId;
    await fetchBoardPresentations(
      state.currentClassId,
      state.currentSubjectId,
      state.currentTopicId
    );
    goToStep('board');

    const params = new URLSearchParams(window.location.search);
    if (params.get('upload') === '1' && !state.hasAutoOpenedUpload) {
      state.hasAutoOpenedUpload = true;
      openUploadModalForStudent('');
    }
  }

  async function fetchBoardPresentations(classId, subjectId, topicId) {
    try {
      const q = new URLSearchParams({ classId, subjectId, topicId });
      const res = await fetch(`/api/presentations?${q.toString()}`);
      const data = await res.json();
      if (Array.isArray(data.presentations)) {
        state.presentations = data.presentations;
      }
      if (data.shortCode !== undefined) {
        state.currentShortCode = data.shortCode;
      }
      if (Array.isArray(data.gdriveBindings)) {
        state.gdriveBindings = data.gdriveBindings;
        const quickSyncBtn = document.getElementById('quickGdriveSyncBtn');
        if (quickSyncBtn) {
          quickSyncBtn.classList.toggle('hidden', state.gdriveBindings.length === 0);
        }
      }
      if (data.hierarchySummary) {
        state.hierarchySummary = data.hierarchySummary;
      }
    } catch (err) {
      console.error('Failed to load board presentations:', err);
    }
  }

  function renderClassGrid() {
    const itemsHtml = state.classes
      .map((cls) => {
        const canDelete = state.classes.length > 1;
        return `
          <div class="selector-item" data-select-class="${escapeHtml(cls.id)}">
            <div class="selector-card-actions">
              <button class="selector-rename-btn" data-rename-class="${escapeHtml(
                cls.id
              )}" title="重新命名此班級">✏️</button>
              ${
                canDelete
                  ? `<button class="selector-delete-btn" data-delete-class="${escapeHtml(
                      cls.id
                    )}" title="刪除此班級">✕</button>`
                  : ''
              }
            </div>
            <div class="selector-icon">🏫</div>
            <div class="selector-name">${escapeHtml(cls.name)}</div>
            <div class="selector-meta">👥 全班 ${cls.count || 0} 人</div>
          </div>
        `;
      })
      .join('');

    const addBtnHtml = `
      <div class="selector-item add-new-card" id="addNewClassCardBtn">
        <div class="selector-icon">➕</div>
        <div class="selector-name">新增其他班級</div>
        <div class="selector-meta">建立新班級與名單</div>
      </div>
    `;

    els.classGridContainer.innerHTML = itemsHtml + addBtnHtml;
  }

  function renderSubjectGrid() {
    const classHierarchy = state.hierarchySummary[state.currentClassId] || {};

    const itemsHtml = state.subjects
      .map((sub) => {
        const subData = classHierarchy[sub.id] || { topicCount: 0, topics: [] };
        const totalSubmittedAcrossTopics = (subData.topics || []).reduce(
          (sum, t) => sum + (t.submitted || 0),
          0
        );
        const topicCount = subData.topicCount || 0;
        const hasUploads = totalSubmittedAcrossTopics > 0;
        const metaText = topicCount > 0 ? `📝 ${topicCount} 個報告項目` : '尚未建立報告';

        return `
          <div class="selector-item" data-select-subject="${escapeHtml(sub.id)}">
            <div class="selector-card-actions">
              <button class="selector-rename-btn" data-rename-subject="${escapeHtml(
                sub.id
              )}" title="重新命名此科目">✏️</button>
              ${
                !sub.isDefault
                  ? `<button class="selector-delete-btn" data-delete-subject="${escapeHtml(
                      sub.id
                    )}" title="刪除此自訂科目">✕</button>`
                  : ''
              }
            </div>
            <div class="selector-icon">${escapeHtml(sub.icon || '📘')}</div>
            <div class="selector-name">${escapeHtml(sub.name)}</div>
            <div class="selector-meta ${hasUploads ? 'has-uploads' : ''}">${metaText}</div>
          </div>
        `;
      })
      .join('');

    const addSubjectHtml = `
      <div class="selector-item add-new-card" id="addNewSubjectCardBtn">
        <div class="selector-icon">➕</div>
        <div class="selector-name">新增其他科目</div>
        <div class="selector-meta">自訂科目名稱</div>
      </div>
    `;

    els.subjectGridContainer.innerHTML = itemsHtml + addSubjectHtml;
  }

  function renderTopicGrid() {
    const classHierarchy = state.hierarchySummary[state.currentClassId] || {};
    const subData = classHierarchy[state.currentSubjectId] || {
      topicCount: 0,
      topics: []
    };
    const topics = subData.topics || [];

    const itemsHtml = topics
      .map((topic) => {
        const hasUploads = topic.submitted > 0;
        const metaText = hasUploads
          ? `✅ 已上傳 ${topic.submitted} / ${topic.total} 人`
          : `尚未上傳 (0 / ${topic.total} 人)`;

        return `
          <div class="selector-item" data-select-topic="${escapeHtml(topic.id)}">
            <div class="selector-card-actions">
              <button class="selector-rename-btn" data-rename-topic="${escapeHtml(
                topic.id
              )}" title="重新命名此報告項目">✏️</button>
              <button class="selector-delete-btn" data-delete-topic="${escapeHtml(
                topic.id
              )}" title="刪除此報告項目">✕</button>
            </div>
            <div class="selector-icon">📝</div>
            <div class="selector-name">${escapeHtml(topic.name)}</div>
            <div class="selector-meta ${hasUploads ? 'has-uploads' : ''}">${metaText}</div>
          </div>
        `;
      })
      .join('');

    const addTopicHtml = `
      <div class="selector-item add-new-card" id="addNewTopicCardBtn">
        <div class="selector-icon">➕</div>
        <div class="selector-name">新增報告項目</div>
        <div class="selector-meta">點此或於下方輸入建立新報告</div>
      </div>
    `;

    els.topicGridContainer.innerHTML = itemsHtml + addTopicHtml;
  }

  // ==================== Server Sync & Info ====================
  async function fetchServerInfo() {
    try {
      const res = await fetch('/api/info');
      const data = await res.json();
      state.serverInfo = data;
      if (Array.isArray(data.classes) && data.classes.length > 0) {
        state.classes = data.classes;
      }
      if (Array.isArray(data.subjects) && data.subjects.length > 0) {
        state.subjects = data.subjects;
      }
      if (data.hierarchySummary) {
        state.hierarchySummary = data.hierarchySummary;
      }

      applyClientRoleUI();
      updateNetworkUrlOptions();

      // Check URL query params (?classId=...&subjectId=...&topicId=...&upload=1) for direct QR jump
      const params = new URLSearchParams(window.location.search);
      const isUploadScan = params.get('upload') === '1';
      let qClass =
        params.get('classId') ||
        (isUploadScan && data.activeSession && data.activeSession.classId) ||
        '';
      let qSubject =
        params.get('subjectId') ||
        (isUploadScan && data.activeSession && data.activeSession.subjectId) ||
        '';
      let qTopic =
        params.get('topicId') ||
        (isUploadScan && data.activeSession && data.activeSession.topicId) ||
        '';

      // Fallback if upload=1 was scanned and activeSession wasn't set yet: find first available topic
      if (isUploadScan && (!qClass || !qSubject || !qTopic) && data.hierarchySummary) {
        for (const cid of Object.keys(data.hierarchySummary)) {
          for (const sid of Object.keys(data.hierarchySummary[cid] || {})) {
            const tList =
              (data.hierarchySummary[cid][sid] && data.hierarchySummary[cid][sid].topics) || [];
            if (tList.length > 0) {
              qClass = cid;
              qSubject = sid;
              qTopic = tList[0].id;
              break;
            }
          }
          if (qTopic) break;
        }
      }

      const qStep = params.get('step') || '';
      if (qClass && qSubject && qTopic && state.currentStep === 'class') {
        state.currentClassId = qClass;
        state.currentSubjectId = qSubject;
        await selectTopicAndGoToBoard(qTopic);
      } else if (qStep === 'topic' && qClass && qSubject && state.currentStep === 'class') {
        state.currentClassId = qClass;
        state.currentSubjectId = qSubject;
        goToStep('topic');
      } else if (qStep === 'subject' && qClass && state.currentStep === 'class') {
        state.currentClassId = qClass;
        goToStep('subject');
      } else {
        goToStep(state.currentStep);
      }
    } catch (err) {
      console.error('Failed to fetch server info:', err);
    }
  }

  function updateNetworkUrlOptions() {
    const { tunnel, isCloudHosted } = state.serverInfo;

    if (isCloudHosted) {
      state.selectedNetworkUrl = window.location.origin;
    } else if (tunnel && tunnel.tunnelStatus === 'running' && tunnel.tunnelUrl) {
      state.selectedNetworkUrl = tunnel.tunnelUrl;
    } else {
      state.selectedNetworkUrl = '';
      if (!tunnel || tunnel.tunnelStatus === 'stopped') {
        fetch('/api/tunnel', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'start' })
        }).catch(() => {});
      }
    }

    renderQrCodes();
    renderTunnelStatus();
  }

  function renderQrCodes() {
    if (state.currentClassId && state.currentSubjectId && state.currentTopicId) {
      if (els.miniQrTagText) {
        els.miniQrTagText.textContent = `${state.currentClassId}・${state.currentSubjectId}（${state.currentTopicId}）`;
      }
      if (els.qrModalInstruction) {
        els.qrModalInstruction.innerHTML = `請同學掃描下方 QR Code，即可直接進入 <strong>${escapeHtml(
          state.currentClassId
        )} ▸ ${escapeHtml(state.currentSubjectId)} ▸ ${escapeHtml(
          state.currentTopicId
        )}</strong> 上傳簡報：`;
      }
    }

    const { tunnel, isCloudHosted } = state.serverInfo;
    let baseUrl = '';
    if (isCloudHosted) {
      baseUrl = window.location.origin.replace(/\/$/, '');
    } else if (tunnel && tunnel.tunnelStatus === 'running' && tunnel.tunnelUrl) {
      baseUrl = tunnel.tunnelUrl.replace(/\/$/, '');
    }

    if (!baseUrl) {
      els.miniQrUrl.textContent = '⏳ 正在產生跨網路公開上傳網址...';
      els.largeQrUrlText.textContent = '⏳ 正在建立跨網路公開上傳網址，請稍候約 2 秒...';
      els.miniQrContainer.innerHTML =
        '<div style="display:flex;align-items:center;justify-content:center;width:88px;height:88px;font-size:0.75rem;color:#64748b;text-align:center;">連線公開通道中...</div>';
      els.largeQrContainer.innerHTML =
        '<div style="display:flex;align-items:center;justify-content:center;width:232px;height:232px;font-size:0.95rem;color:#64748b;text-align:center;">🌐 正在連線跨網路公開上傳通道...</div>';
      return;
    }

    const studentUploadUrl = state.currentShortCode
      ? `${baseUrl}/u/${state.currentShortCode}`
      : `${baseUrl}/u`;

    els.miniQrUrl.textContent = studentUploadUrl;
    els.largeQrUrlText.textContent = studentUploadUrl;

    if (window.renderQRCodeSVG) {
      els.miniQrContainer.innerHTML = window.renderQRCodeSVG(studentUploadUrl, 88);
      els.largeQrContainer.innerHTML = window.renderQRCodeSVG(studentUploadUrl, 232);
    }
  }

  function renderTunnelStatus() {
    const { tunnel, isCloudHosted } = state.serverInfo;
    if (isCloudHosted) {
      els.toggleTunnelBtn.classList.add('hidden');
      els.tunnelStatusText.textContent = `✅ 已部署為雲端公開網站：${window.location.origin}`;
      return;
    }
    if (!tunnel) return;
    if (tunnel.tunnelStatus === 'running' && tunnel.tunnelUrl) {
      els.toggleTunnelBtn.textContent = '🔄 重新整理跨網路通道';
      els.tunnelStatusText.textContent = `✅ 公開上傳通道已就緒：${tunnel.tunnelUrl}`;
    } else {
      els.toggleTunnelBtn.textContent = '⏳ 正在連線公開通道...';
      els.tunnelStatusText.textContent = tunnel.tunnelError || '正在自動建立跨網路公開上傳網址...';
    }
  }

  function connectSSE() {
    const evtSource = new EventSource('/api/events');
    evtSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (Array.isArray(data.classes)) {
          state.classes = data.classes;
        }
        if (Array.isArray(data.subjects)) {
          state.subjects = data.subjects;
        }
        if (data.hierarchySummary) {
          state.hierarchySummary = data.hierarchySummary;
        }
        if (data.tunnel) {
          state.serverInfo.tunnel = data.tunnel;
          updateNetworkUrlOptions();
        }
        if (data.type === 'tunnel' && data.payload) {
          state.serverInfo.tunnel = data.payload;
          updateNetworkUrlOptions();
        }

        if (
          state.currentStep === 'board' &&
          data.classId === state.currentClassId &&
          data.subjectId === state.currentSubjectId &&
          data.topicId === state.currentTopicId &&
          Array.isArray(data.presentations)
        ) {
          state.presentations = data.presentations;

          if (data.type === 'submitted' && data.payload) {
            const seatTag = data.payload.groupOrSeat ? `[${data.payload.groupOrSeat}] ` : '';
            showToast(`✅ ${seatTag}${data.payload.presenterName} 已完成簡報上傳！`);
          }
          if (data.type === 'reordered' && data.payload && data.payload.isLottery) {
            state.sortBy = 'order';
            els.sortSelect.value = 'order';
            showToast('🎲 已更新全班抽籤報告順序！');
          }
          renderAll();
        } else if (data.type === 'roster_updated' && data.classId === state.currentClassId) {
          if (state.currentStep === 'board') {
            fetchBoardPresentations(
              state.currentClassId,
              state.currentSubjectId,
              state.currentTopicId
            ).then(renderAll);
          }
          showToast('📋 班級座號與姓名名單已更新！');
        }

        if (state.currentStep === 'class') {
          renderClassGrid();
        } else if (state.currentStep === 'subject') {
          renderSubjectGrid();
        } else if (state.currentStep === 'topic') {
          renderTopicGrid();
        }
      } catch (e) {
        console.error('SSE parse error:', e);
      }
    };

    evtSource.onerror = () => {
      els.liveIndicator.innerHTML =
        '<span class="pulse-dot" style="background:#f59e0b"></span> 重新連線中...';
      setTimeout(() => {
        els.liveIndicator.innerHTML = '<span class="pulse-dot"></span> 即時同步中';
      }, 3000);
    };
  }

  // ==================== Rendering (Step 4 Board) ====================
  function renderAll() {
    renderHeaderAndStats();
    renderCards();
  }

  function renderHeaderAndStats() {
    if (state.currentStep === 'board') {
      document.title = `${state.currentClassId} ${state.currentSubjectId} (${state.currentTopicId}) — 報告彙整中心`;
    }

    const total = state.presentations.length;
    const unsubmitted = state.presentations.filter(
      (p) => !p.hasSubmitted || p.status === 'unsubmitted'
    ).length;
    const submitted = total - unsubmitted;
    const pending = state.presentations.filter(
      (p) => p.hasSubmitted && p.status === 'pending'
    ).length;
    const presenting = state.presentations.filter((p) => p.status === 'presenting').length;
    const done = state.presentations.filter((p) => p.status === 'done').length;

    els.statTotal.textContent = total;
    els.statUnsubmitted.textContent = unsubmitted;
    els.statPending.textContent = pending;
    els.statPresenting.textContent = presenting;
    els.statDone.textContent = done;

    els.tabCountAll.textContent = total;
    els.tabCountUnsubmitted.textContent = unsubmitted;
    els.tabCountSubmitted.textContent = submitted;
    els.tabCountPending.textContent = pending;
    els.tabCountPresenting.textContent = presenting;
    els.tabCountDone.textContent = done;

    const uploadPct = total > 0 ? Math.round((submitted / total) * 100) : 0;
    els.uploadProgressSummaryText.textContent = `已上傳 ${submitted} / ${total} 人 (${uploadPct}%)`;
    els.uploadSummaryBarFill.style.width = `${uploadPct}%`;

    const currentItem = state.presentations.find((p) => p.status === 'presenting');
    if (currentItem) {
      const seatTag = currentItem.groupOrSeat ? `[${currentItem.groupOrSeat}] ` : '';
      els.currentPresentingBanner.innerHTML = `🎙️ 正在報告：<strong>${escapeHtml(
        seatTag + currentItem.presenterName
      )}</strong>`;
    } else if (total > 0 && done === total) {
      els.currentPresentingBanner.innerHTML = '🎉 全班報告皆已完成！';
    } else {
      els.currentPresentingBanner.textContent = '🎓 上台報告完成進度';
    }

    const reportPct = total > 0 ? Math.round((done / total) * 100) : 0;
    els.progressPercentText.textContent = `已報告 ${done} / ${total} 人 (${reportPct}%)`;
    els.progressBarFill.style.width = `${reportPct}%`;
  }

  function getFilteredAndSortedPresentations() {
    let list = [...state.presentations];

    if (state.filterStatus === 'unsubmitted') {
      list = list.filter((p) => !p.hasSubmitted || p.status === 'unsubmitted');
    } else if (state.filterStatus === 'submitted') {
      list = list.filter((p) => p.hasSubmitted);
    } else if (state.filterStatus !== 'all') {
      list = list.filter((p) => p.status === state.filterStatus);
    }

    const q = state.searchQuery.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (p) =>
          (p.groupOrSeat || '').toLowerCase().includes(q) ||
          (p.presenterName || '').toLowerCase().includes(q) ||
          (p.title || '').toLowerCase().includes(q) ||
          (p.originalFileName || '').toLowerCase().includes(q) ||
          (p.note || '').toLowerCase().includes(q)
      );
    }

    list.sort((a, b) => {
      if (state.sortBy === 'seat_asc') {
        return compareSeat(a, b);
      }
      if (state.sortBy === 'seat_desc') {
        return compareSeat(b, a);
      }
      if (state.sortBy === 'uploaded_first') {
        const rank = { presenting: 0, pending: 1, done: 2, unsubmitted: 3 };
        const diff = (rank[a.status] ?? 3) - (rank[b.status] ?? 3);
        if (diff !== 0) return diff;
        return compareSeat(a, b);
      }
      if (state.sortBy === 'unsubmitted_first') {
        const rank = { unsubmitted: 0, pending: 1, presenting: 2, done: 3 };
        const diff = (rank[a.status] ?? 0) - (rank[b.status] ?? 0);
        if (diff !== 0) return diff;
        return compareSeat(a, b);
      }
      return (a.order || 0) - (b.order || 0);
    });

    return list;
  }

  function renderCards() {
    const list = getFilteredAndSortedPresentations();

    if (state.presentations.length === 0) {
      els.presentationsContainer.classList.add('hidden');
      els.emptyState.classList.remove('hidden');
      return;
    }

    els.emptyState.classList.add('hidden');
    els.presentationsContainer.classList.remove('hidden');

    if (list.length === 0) {
      els.presentationsContainer.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #64748b; background: #fff; border-radius: 12px; border: 1px solid #e2e8f0;">
          找不到符合篩選條件的同學或簡報項目
        </div>
      `;
      return;
    }

    els.presentationsContainer.innerHTML = list
      .map((item, idx) => {
        const statusMeta = getStatusMeta(item);
        const seatText = item.groupOrSeat || `${idx + 1}`;

        // ---- Case A: NOT UPLOADED YET (尚未上傳) ----
        if (!item.hasSubmitted || item.status === 'unsubmitted') {
          return `
            <article class="pres-card status-unsubmitted" draggable="true" data-id="${item.id}">
              <div>
                <div class="card-top">
                  <div class="card-badges">
                    <span class="order-badge" title="拖曳卡片可調整報告順序">順序 #${item.order || idx + 1}</span>
                  </div>
                  <span class="status-pill unsubmitted">${statusMeta.label}</span>
                </div>

                <div class="student-identity">
                  <div class="seat-number-box">${escapeHtml(seatText)}</div>
                  <div class="student-name-text">${escapeHtml(item.presenterName)}</div>
                </div>

                <div class="card-body">
                  <div class="pres-unsubmitted-hint">尚未上傳簡報檔案或連結</div>
                </div>
              </div>

              <div class="card-launch-area">
                <button class="btn-upload-slot" data-action="upload-for-student" data-id="${item.id}">
                  <span>📤 點此上傳檔案 / 貼上簡報連結</span>
                </button>

                <div class="card-sub-actions">
                  <div class="sub-btn-group">
                    <button class="sub-btn" data-action="upload-for-student" data-id="${item.id}">✏️ 設定</button>
                  </div>
                  <div class="sub-btn-group">
                    <button class="sub-btn danger" data-action="delete" data-id="${item.id}" title="從名單移除">🗑️</button>
                  </div>
                </div>
              </div>
            </article>
          `;
        }

        // ---- Case B: UPLOADED & READY (已上傳簡報) ----
        const typeMeta = getTypeMeta(item);
        const displayTopic = getDisplayTopic(item);

        let sourceDetail = '';
        if (item.originalFileName) {
          sourceDetail = `📎 原始檔名：${escapeHtml(item.originalFileName)} ${
            item.fileSize ? `(${formatBytes(item.fileSize)})` : ''
          }`;
        } else if (item.url) {
          sourceDetail = `🔗 連結：${escapeHtml(item.url)}`;
        }

        const noteHtml = item.note
          ? `<div class="pres-note">💡 備註：${escapeHtml(item.note)}</div>`
          : '';

        let subActionsHtml = '';
        if (item.type === 'pptx') {
          let dlHref = '';
          if (item.fileUrl) {
            dlHref = `${item.fileUrl}?download=1`;
          } else if (item.url) {
            const driveMatch = item.url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
            dlHref = driveMatch
              ? `https://drive.google.com/uc?export=download&id=${driveMatch[1]}`
              : item.url;
          }
          subActionsHtml = `
            <div class="card-sub-actions">
              <div class="sub-btn-group">
                <button class="sub-btn" data-action="launch-primary" data-id="${item.id}" title="使用 Google 簡報開啟">📊 用 Google 簡報開啟</button>
                ${
                  dlHref
                    ? `<a class="sub-btn" href="${escapeHtml(dlHref)}" target="_blank" rel="noopener" title="下載簡報檔案">⬇️ 下載</a>`
                    : ''
                }
              </div>
            </div>
          `;
        } else {
          subActionsHtml = `
            <div class="card-sub-actions">
              <div class="sub-btn-group">
                <button class="sub-btn" data-action="open-embed" data-id="${item.id}" title="在網頁內全螢幕開啟">⛶ 全螢幕開啟</button>
                <button class="sub-btn" data-action="open-newtab" data-id="${item.id}" title="在新分頁開啟簡報">↗️ 新分頁開啟</button>
              </div>
            </div>
          `;
        }

        return `
          <article class="pres-card status-${item.status}" draggable="true" data-id="${item.id}">
            <div>
              <div class="card-top">
                <div class="card-badges">
                  <span class="order-badge" title="拖曳卡片可調整報告順序">順序 #${item.order || idx + 1}</span>
                  <span class="type-badge ${typeMeta.badgeClass}">${typeMeta.icon} ${typeMeta.label}</span>
                </div>
                <button class="status-pill ${statusMeta.cls}" data-action="cycle-status" data-id="${item.id}" title="點擊切換狀態 (待報告 ➔ 進行中 ➔ 已完成)">
                  ${statusMeta.label}
                </button>
              </div>

              <div class="student-identity">
                <div class="seat-number-box">${escapeHtml(seatText)}</div>
                <div class="student-name-text">${escapeHtml(item.presenterName)}</div>
              </div>

              <div class="card-body">
                ${displayTopic ? `<div class="pres-title-box">📑 ${escapeHtml(displayTopic)}</div>` : ''}
                ${sourceDetail ? `<div class="pres-file-meta" title="${escapeHtml(sourceDetail)}">${sourceDetail}</div>` : ''}
                ${noteHtml}
              </div>
            </div>

            <div class="card-launch-area">
              <button class="btn-launch ${typeMeta.btnClass}" data-action="launch-primary" data-id="${item.id}">
                <span>${typeMeta.btnText}</span>
              </button>
              ${subActionsHtml}
            </div>
          </article>
        `;
      })
      .join('');

    attachDragAndDropEvents();
  }

  // ==================== Launching Presentations ====================
  function getCurrentBoardQuery() {
    return new URLSearchParams({
      classId: state.currentClassId,
      subjectId: state.currentSubjectId,
      topicId: state.currentTopicId
    }).toString();
  }

  async function markAsPresenting(id) {
    try {
      await fetch(`/api/presentations/${id}?${getCurrentBoardQuery()}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'presenting', autoCompletePrevious: true })
      });
    } catch (e) {
      console.error('Failed to update status:', e);
    }
  }

  async function launchPresentation(item, forceMode = null) {
    if (!item || !item.hasSubmitted) {
      showToast('⚠️ 該名同學尚未上傳簡報！');
      return;
    }
    const mode = forceMode || item.openMode || 'auto';

    if (item.type === 'pptx' && mode !== 'newtab') {
      if (item.url) {
        const driveMatch = item.url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
        if (driveMatch) {
          markAsPresenting(item.id);
          const gslidesEditUrl = `https://docs.google.com/presentation/d/${driveMatch[1]}/edit`;
          window.open(gslidesEditUrl, '_blank', 'noopener');
          showToast(`📊 已用 Google 簡報開啟「${item.presenterName}」的簡報`);
          return;
        }
      }
      if (item.storedFileName) {
        if (state.serverInfo && state.serverInfo.isCloudHosted) {
          markAsPresenting(item.id);
          const directPptxUrl = getFastFileUrl(item);
          const officeEmbedUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(
            directPptxUrl
          )}`;
          openFullscreenViewer(item, officeEmbedUrl, directPptxUrl);
          return;
        }

        const slideShowMode = mode !== 'powerpoint_normal';
        showToast(
          `🟧 正在講台電腦開啟「${item.presenterName}」的 PowerPoint (直接放映)...`
        );
        try {
          const res = await fetch(`/api/open-local/${item.id}?${getCurrentBoardQuery()}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ slideShowMode })
          });
          if (!res.ok) {
            window.open(item.fileUrl, '_blank');
          }
        } catch (err) {
          window.open(item.fileUrl, '_blank');
        }
        return;
      }
    }

    markAsPresenting(item.id);
    const { embedUrl, newTabUrl } = resolvePresentationUrls(item);

    if (mode === 'newtab' || (item.type === 'gslides' && !forceMode)) {
      window.open(newTabUrl, '_blank', 'noopener');
      showToast(`📊 已用 Google 簡報開啟「${item.presenterName}」的簡報`);
      return;
    }

    openFullscreenViewer(item, embedUrl, newTabUrl);
  }

  const preconnectedOrigins = new Set();
  function preconnectOrigin(urlStr) {
    try {
      const origin = new URL(urlStr).origin;
      if (preconnectedOrigins.has(origin)) return;
      preconnectedOrigins.add(origin);
      const link = document.createElement('link');
      link.rel = 'preconnect';
      link.href = origin;
      document.head.appendChild(link);
    } catch (e) {}
  }

  function warmPresentationAssets(item) {
    if (!item || !item.hasSubmitted) return;
    if (item.type === 'pptx' && item.storedFileName && state.serverInfo.isCloudHosted) {
      preconnectOrigin('https://view.officeapps.live.com');
      const directUrl = getFastFileUrl(item);
      if (directUrl) preconnectOrigin(directUrl);
    } else if (item.fileUrl) {
      const fastUrl = getFastFileUrl(item);
      if (fastUrl) preconnectOrigin(fastUrl);
    } else if (item.url) {
      preconnectOrigin(item.url);
    }
  }

  function openFullscreenViewer(item, embedUrl, newTabUrl, isPreviewOnly = false) {
    state.activeViewerItem = { item, embedUrl, newTabUrl, isPreviewOnly };
    els.viewerBadge.textContent = item.groupOrSeat || `#${item.order || ''}`;
    els.viewerPresenter.textContent = item.presenterName;
    const topic = getDisplayTopic(item);
    els.viewerTitle.textContent = topic ? `— ${topic}` : '';
    if (els.viewerCompleteNextBtn) {
      els.viewerCompleteNextBtn.classList.toggle('hidden', isPreviewOnly);
    }

    const viewerLoading = document.getElementById('viewerLoading');
    if (viewerLoading) {
      viewerLoading.classList.remove('hidden');
      els.viewerIframe.onload = () => viewerLoading.classList.add('hidden');
      setTimeout(() => viewerLoading.classList.add('hidden'), 15000);
    }

    els.viewerIframe.src = embedUrl;
    els.viewerOverlay.classList.remove('hidden');

    if (els.viewerOverlay.requestFullscreen) {
      els.viewerOverlay.requestFullscreen().catch(() => {});
    }
  }

  function closeFullscreenViewer() {
    els.viewerIframe.src = 'about:blank';
    els.viewerOverlay.classList.add('hidden');
    state.activeViewerItem = null;
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
  }

  // ==================== Drag & Drop Reordering ====================
  let draggedId = null;

  function attachDragAndDropEvents() {
    const cards = els.presentationsContainer.querySelectorAll('.pres-card');
    cards.forEach((card) => {
      card.addEventListener('dragstart', (e) => {
        draggedId = card.dataset.id;
        card.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
      });

      card.addEventListener('dragend', () => {
        card.classList.remove('dragging');
        draggedId = null;
      });

      card.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
      });

      card.addEventListener('drop', async (e) => {
        e.preventDefault();
        const targetId = card.dataset.id;
        if (!draggedId || draggedId === targetId) return;

        const ordered = [...state.presentations].sort((a, b) => (a.order || 0) - (b.order || 0));
        const fromIdx = ordered.findIndex((p) => p.id === draggedId);
        const toIdx = ordered.findIndex((p) => p.id === targetId);
        if (fromIdx === -1 || toIdx === -1) return;

        const [moved] = ordered.splice(fromIdx, 1);
        ordered.splice(toIdx, 0, moved);

        state.sortBy = 'order';
        els.sortSelect.value = 'order';

        await saveOrderToServer(ordered.map((p) => p.id));
      });
    });
  }

  async function saveOrderToServer(orderedIds, isLottery = false) {
    try {
      await fetch('/api/presentations/reorder', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          classId: state.currentClassId,
          subjectId: state.currentSubjectId,
          topicId: state.currentTopicId,
          orderedIds,
          isLottery
        })
      });
    } catch (err) {
      showToast('⚠️ 順序儲存失敗');
    }
  }

  // ==================== Upload / Edit Student Presentation Modal ====================
  function populateStudentDropdown(selectedId = '') {
    const sortedBySeat = [...state.presentations].sort(compareSeat);
    let optionsHtml = '';

    sortedBySeat.forEach((p) => {
      const seatLabel = p.groupOrSeat ? `[${p.groupOrSeat}] ` : '';
      const statusText = p.hasSubmitted ? '✅ 已上傳' : '❌ 尚未上傳';
      const isSelected = p.id === selectedId ? 'selected' : '';
      optionsHtml += `<option value="${escapeHtml(p.id)}" ${isSelected}>${escapeHtml(
        `${seatLabel}${p.presenterName} （${statusText}）`
      )}</option>`;
    });

    optionsHtml += `<option value="__NEW__" ${
      selectedId === '__NEW__' ? 'selected' : ''
    }>➕ 新增不在名單上的同學 / 組別...</option>`;

    els.studentSelectDropdown.innerHTML = optionsHtml;

    if (!selectedId && sortedBySeat.length > 0) {
      const firstUnsubmitted = sortedBySeat.find((p) => !p.hasSubmitted) || sortedBySeat[0];
      els.studentSelectDropdown.value = firstUnsubmitted.id;
      loadStudentIntoForm(firstUnsubmitted.id);
    } else if (selectedId && selectedId !== '__NEW__') {
      loadStudentIntoForm(selectedId);
    } else {
      loadStudentIntoForm('__NEW__');
    }
  }

  function loadStudentIntoForm(targetId) {
    state.pendingFile = null;
    els.fileInput.value = '';

    if (targetId === '__NEW__') {
      els.editItemId.value = '';
      els.manualStudentFields.classList.remove('hidden');
      els.toggleEditNameBtn.classList.add('hidden');
      els.inputGroupOrSeat.value = '';
      els.inputPresenterName.value = '';
      els.inputTitle.value = '';
      els.inputUrl.value = '';
      els.inputNote.value = '';
      state.editingExistingFile = null;
      switchSourceTab('file');
      updateSelectedFileUI();
      return;
    }

    const item = state.presentations.find((p) => p.id === targetId);
    if (!item) return;

    els.editItemId.value = item.id;
    els.manualStudentFields.classList.add('hidden');
    els.toggleEditNameBtn.classList.remove('hidden');

    els.inputGroupOrSeat.value = item.groupOrSeat || '';
    els.inputPresenterName.value = item.presenterName || '';
    els.inputTitle.value = item.title || '';
    els.inputUrl.value = item.url || '';
    els.inputNote.value = item.note || '';

    if (item.fileUrl) {
      state.editingExistingFile = {
        fileUrl: item.fileUrl,
        storedFileName: item.storedFileName,
        originalFileName: item.originalFileName,
        fileSize: item.fileSize,
        type: item.type
      };
      switchSourceTab('file');
      const radio = document.querySelector(
        `input[name="fileOpenMode"][value="${item.openMode || 'auto'}"]`
      );
      if (radio) radio.checked = true;
    } else if (item.url) {
      state.editingExistingFile = null;
      switchSourceTab('link');
      const radio = document.querySelector(
        `input[name="linkOpenMode"][value="${item.openMode || 'embed'}"]`
      );
      if (radio) radio.checked = true;
      updateDetectedLinkHint(item.url);
    } else {
      state.editingExistingFile = null;
      switchSourceTab('file');
    }

    updateSelectedFileUI();
  }

  function openUploadModalForStudent(studentId = '') {
    populateStudentDropdown(studentId);
    const isMobileStudent = isStudentUploadClient();
    const targetStudent = studentId
      ? state.presentations.find((p) => p.id === studentId)
      : null;

    if (!isMobileStudent && targetStudent) {
      els.studentPickerSection.classList.add('hidden');
      const seatPrefix = targetStudent.groupOrSeat ? `[${targetStudent.groupOrSeat}] ` : '';
      els.modalFormTitle.textContent = `📤 上傳 / 設定簡報 — ${seatPrefix}${targetStudent.presenterName}`;
    } else {
      els.studentPickerSection.classList.remove('hidden');
      els.modalFormTitle.textContent = `📤 上傳簡報（${state.currentClassId}・${state.currentSubjectId}・${state.currentTopicId}）`;
    }

    els.addEditModal.classList.remove('hidden');
  }

  function switchSourceTab(mode) {
    state.sourceMode = mode;
    document.querySelectorAll('.source-tab').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.source === mode);
    });
    els.fileSourcePanel.classList.toggle('hidden', mode !== 'file');
    els.linkSourcePanel.classList.toggle('hidden', mode !== 'link');
  }

  function updateSelectedFileUI() {
    if (state.pendingFile) {
      els.dropZonePrompt.classList.add('hidden');
      els.selectedFileInfo.classList.remove('hidden');
      els.fileInput.classList.add('hidden');
      const ftype = detectFileType(state.pendingFile.name);
      els.selectedFileIcon.textContent = ftype === 'pdf' ? '📄' : ftype === 'pptx' ? '🟧' : '📁';
      els.selectedFileName.textContent = state.pendingFile.name || '已選擇簡報檔案';
      els.selectedFileSize.textContent = formatBytes(state.pendingFile.size) || '雲端檔案';
    } else if (state.editingExistingFile) {
      els.dropZonePrompt.classList.add('hidden');
      els.selectedFileInfo.classList.remove('hidden');
      els.fileInput.classList.add('hidden');
      els.selectedFileIcon.textContent =
        state.editingExistingFile.type === 'pdf' ? '📄' : '🟧';
      els.selectedFileName.textContent = state.editingExistingFile.originalFileName;
      els.selectedFileSize.textContent = formatBytes(state.editingExistingFile.fileSize);
    } else {
      els.dropZonePrompt.classList.remove('hidden');
      els.selectedFileInfo.classList.add('hidden');
      els.fileInput.classList.remove('hidden');
    }
  }

  function updateDetectedLinkHint(url) {
    const ltype = detectLinkType(url);
    if (!url || !url.trim()) {
      els.detectedLinkBadge.innerHTML =
        '💡 支援直接貼上 Canva 檢視/編輯連結、Google 簡報編輯/播放連結，系統會自動轉換！';
      return;
    }
    if (ltype === 'canva') {
      els.detectedLinkBadge.innerHTML =
        '🎨 <strong>已偵測為 Canva 簡報！</strong> 系統會自動轉換為全螢幕播放格式。';
    } else if (ltype === 'gslides') {
      els.detectedLinkBadge.innerHTML =
        '📊 <strong>已偵測為 Google 簡報！</strong> 系統會自動轉換為全螢幕簡報模式。';
    } else if (ltype === 'pdf') {
      els.detectedLinkBadge.innerHTML = '📄 <strong>已偵測為線上 PDF 簡報連結！</strong>';
    } else {
      els.detectedLinkBadge.innerHTML = '🔗 <strong>已偵測為網頁簡報連結！</strong>';
    }
  }

  function uploadFileWithProgress(file) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', '/api/upload', true);
      xhr.timeout = 120000;
      xhr.setRequestHeader('Content-Type', 'application/octet-stream');
      xhr.setRequestHeader('X-File-Name', encodeURIComponent(file.name || 'presentation.bin'));

      els.uploadProgressWrap.classList.remove('hidden');
      els.uploadProgressBar.style.width = '0%';
      els.uploadProgressPercent.textContent = '0%';

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const pct = Math.round((e.loaded / e.total) * 100);
          els.uploadProgressBar.style.width = `${pct}%`;
          els.uploadProgressPercent.textContent = `${pct}%`;
          els.uploadProgressStatus.textContent =
            pct >= 100
              ? `⏳ 傳送完畢，正在儲存 ${file.name}...`
              : `正在上傳 ${file.name}...`;
        }
      };

      xhr.onload = () => {
        els.uploadProgressWrap.classList.add('hidden');
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            resolve(JSON.parse(xhr.responseText));
          } catch (e) {
            reject(new Error('伺服器回傳格式異常，請重試'));
          }
        } else {
          let errMsg = `檔案上傳失敗 (${xhr.status})`;
          try {
            const parsed = JSON.parse(xhr.responseText);
            if (parsed && parsed.error) errMsg = parsed.error;
          } catch (e) {}
          reject(new Error(errMsg));
        }
      };

      xhr.onerror = () => {
        els.uploadProgressWrap.classList.add('hidden');
        reject(new Error('網路連線異常，檔案上傳失敗'));
      };

      xhr.ontimeout = () => {
        els.uploadProgressWrap.classList.add('hidden');
        reject(new Error('上傳逾時，請確認網路連線後重試'));
      };

      xhr.send(file);
    });
  }

  // ==================== Roster Manager Logic ====================
  function openRosterModal() {
    els.rosterModalTitle.textContent = `📋 匯入 / 管理「${state.currentClassId || '204班'}」座號與姓名`;
    loadCurrentRosterToTextarea();
    els.rosterModal.classList.remove('hidden');
  }

  function loadCurrentRosterToTextarea() {
    const sorted = [...state.presentations].sort(compareSeat);
    els.rosterTextarea.value = sorted
      .map((p) => (p.groupOrSeat ? `${p.groupOrSeat}\t${p.presenterName}` : p.presenterName))
      .join('\n');
    renderRosterLivePreview();
  }

  function parseRosterText(rawText) {
    const lines = (rawText || '')
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => {
        if (!l) return false;
        if (/^(座號|組別|編號|seat|no)\s*[,，\t\s]\s*(姓名|名字|name)/i.test(l)) {
          return false;
        }
        return true;
      });

    return lines.map((line, idx) => {
      const cleaned = line.replace(/^["']|["']$/g, '');
      const match = cleaned.match(
        /^(第\s*\d+\s*組|\d{1,3})\s*(?:[\s,，.、\t:：;-]+)\s*(.+)$/
      );
      if (match) {
        let seat = match[1].replace(/\s+/g, '');
        if (/^\d+$/.test(seat) && seat.length === 1) {
          seat = seat.padStart(2, '0');
        }
        const namePart = match[2].split(/[,，\t]/)[0].trim();
        return {
          groupOrSeat: seat,
          presenterName: namePart || line
        };
      }
      return {
        groupOrSeat: String(idx + 1).padStart(2, '0'),
        presenterName: cleaned
      };
    });
  }

  function renderRosterLivePreview() {
    const parsed = parseRosterText(els.rosterTextarea.value);
    els.rosterParsedCountBadge.textContent = `共 ${parsed.length} 人`;
    if (parsed.length === 0) {
      els.rosterLivePreviewBox.innerHTML = `<div style="grid-column:1/-1;color:#94a3b8;text-align:center;padding:30px 10px;font-size:0.85rem;">在左側貼上座號與姓名後，此處會即時顯示解析結果</div>`;
      return;
    }
    els.rosterLivePreviewBox.innerHTML = parsed
      .map(
        (item) => `
        <div class="preview-student-chip">
          <span class="preview-seat-tag">${escapeHtml(item.groupOrSeat)}</span>
          <strong>${escapeHtml(item.presenterName)}</strong>
        </div>
      `
      )
      .join('');
  }

  function exportCurrentRosterCsv() {
    const sorted = [...state.presentations].sort(compareSeat);
    const rows = ['座號,姓名,上傳狀態,簡報類型,簡報主題或檔名'];
    sorted.forEach((p) => {
      const statusStr = p.hasSubmitted ? '已上傳' : '尚未上傳';
      const topic = getDisplayTopic(p).replace(/"/g, '""');
      rows.push(`"${p.groupOrSeat}","${p.presenterName}","${statusStr}","${p.type}","${topic}"`);
    });
    const csvContent = '\uFEFF' + rows.join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${state.currentClassId}_${state.currentSubjectId}_${state.currentTopicId}_名單.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // ==================== Lottery Logic ====================
  let isSpinning = false;

  function openLotteryModal() {
    state.lotteryWinner = null;
    els.startWinnerBtn.classList.add('hidden');
    els.slotDisplayGroup.textContent = '準備抽籤';
    els.slotDisplayName.textContent = '點擊下方按鈕開始滾動';
    els.slotDisplayTitle.textContent = '';
    renderShufflePreview();
    els.lotteryModal.classList.remove('hidden');
  }

  function spinSingleLottery() {
    if (isSpinning) return;
    const onlySubmitted = els.lotteryOnlySubmitted.checked;
    const candidates = state.presentations.filter((p) => {
      if (onlySubmitted) {
        return p.hasSubmitted && p.status === 'pending';
      }
      return p.status === 'pending' || p.status === 'unsubmitted';
    });

    if (candidates.length === 0) {
      showToast(
        onlySubmitted
          ? '⚠️ 目前沒有「已上傳且待報告」的同學可供抽籤！'
          : '⚠️ 目前沒有待報告的同學可供抽籤！'
      );
      return;
    }

    isSpinning = true;
    els.spinSingleBtn.disabled = true;
    els.startWinnerBtn.classList.add('hidden');

    let ticks = 0;
    const totalTicks = 24;
    const winner = candidates[Math.floor(Math.random() * candidates.length)];

    function step() {
      ticks++;
      const sample =
        ticks >= totalTicks
          ? winner
          : candidates[Math.floor(Math.random() * candidates.length)];
      els.slotDisplayGroup.textContent = sample.groupOrSeat
        ? `座號/組別：${sample.groupOrSeat}`
        : `順序 #${sample.order}`;
      els.slotDisplayName.textContent = sample.presenterName;
      els.slotDisplayTitle.textContent =
        getDisplayTopic(sample) || (sample.hasSubmitted ? '已上傳簡報' : '尚未上傳簡報');

      if (ticks < totalTicks) {
        setTimeout(step, 50 + Math.floor(ticks * 8));
      } else {
        isSpinning = false;
        els.spinSingleBtn.disabled = false;
        state.lotteryWinner = winner;
        els.slotDisplayGroup.textContent = `🎉 抽中：${
          winner.groupOrSeat || `#${winner.order}`
        }`;
        if (winner.hasSubmitted) {
          els.startWinnerBtn.classList.remove('hidden');
        }
        showToast(`🎯 恭喜抽中：${winner.presenterName}`);
      }
    }

    step();
  }

  function renderShufflePreview(list = state.presentations) {
    els.shufflePreviewList.innerHTML = list
      .map(
        (p, idx) => `
        <div class="shuffle-chip">
          <span class="shuffle-chip-num">#${idx + 1}</span>
          <span><strong>${escapeHtml(
            p.groupOrSeat ? `[${p.groupOrSeat}] ` : ''
          )}${escapeHtml(p.presenterName)}</strong> ${p.hasSubmitted ? '✅' : '❌'}</span>
        </div>
      `
      )
      .join('');
  }

  async function shuffleAllOrder() {
    if (state.presentations.length < 2) {
      showToast('⚠️ 至少需要 2 位名單才能進行順序洗牌');
      return;
    }

    const uploadedFirst = els.shuffleKeepDoneFirst.checked;
    let partA = [];
    let partB = [];

    if (uploadedFirst) {
      partA = state.presentations.filter((p) => p.hasSubmitted);
      partB = state.presentations.filter((p) => !p.hasSubmitted);
    } else {
      partA = [...state.presentations];
    }

    const shuffleArray = (arr) => {
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
    };

    shuffleArray(partA);
    shuffleArray(partB);

    const combined = [...partA, ...partB];
    renderShufflePreview(combined);
    await saveOrderToServer(
      combined.map((p) => p.id),
      true
    );
  }

  // ==================== Event Listeners ====================
  function bindEvents() {
    // Step Navigation Buttons
    els.homeLogoBtn.addEventListener('click', () => goToStep('class'));
    els.switchClassBtn.addEventListener('click', () => goToStep('class'));
    els.switchSubjectBtn.addEventListener('click', () => goToStep('subject'));
    els.switchTopicBtn.addEventListener('click', () => goToStep('topic'));
    els.backToClassStepBtn.addEventListener('click', () => goToStep('class'));
    els.backToSubjectStepBtn.addEventListener('click', () => goToStep('subject'));
    els.backToTopicBtn.addEventListener('click', () => goToStep('topic'));

    // Step 1: Class Grid Clicks
    els.classGridContainer.addEventListener('click', async (e) => {
      const renameBtn = e.target.closest('[data-rename-class]');
      if (renameBtn) {
        e.stopPropagation();
        const oldId = renameBtn.dataset.renameClass;
        const newName = prompt(`請輸入「${oldId}」的新班級名稱：`, oldId);
        if (!newName || !newName.trim() || newName.trim() === oldId) return;
        const res = await fetch('/api/classes', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ oldId, newName: newName.trim() })
        });
        if (res.ok) {
          if (state.currentClassId === oldId) state.currentClassId = newName.trim();
          await fetchServerInfo();
          showToast(`✏️ 已將班級重新命名為「${newName.trim()}」！`);
        } else {
          const err = await res.json();
          alert(err.error || '重新命名失敗');
        }
        return;
      }

      const delBtn = e.target.closest('[data-delete-class]');
      if (delBtn) {
        e.stopPropagation();
        const cid = delBtn.dataset.deleteClass;
        if (!confirm(`確定要刪除「${cid}」及其所有簡報資料嗎？`)) return;
        await fetch(`/api/classes/${encodeURIComponent(cid)}`, { method: 'DELETE' });
        fetchServerInfo();
        return;
      }

      if (e.target.closest('#addNewClassCardBtn')) {
        const newClassName = prompt('請輸入新班級名稱（例如：205班、301班）：');
        if (!newClassName || !newClassName.trim()) return;
        const res = await fetch('/api/classes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: newClassName.trim() })
        });
        if (res.ok) {
          await fetchServerInfo();
          showToast(`🏫 已新增「${newClassName.trim()}」！`);
        } else {
          const err = await res.json();
          alert(err.error || '新增班級失敗');
        }
        return;
      }

      const classCard = e.target.closest('[data-select-class]');
      if (classCard) {
        selectClassAndGoToSubject(classCard.dataset.selectClass);
      }
    });

    // Step 2: Subject Grid Clicks
    els.subjectGridContainer.addEventListener('click', async (e) => {
      const renameSubBtn = e.target.closest('[data-rename-subject]');
      if (renameSubBtn) {
        e.stopPropagation();
        const oldId = renameSubBtn.dataset.renameSubject;
        const newName = prompt(`請輸入科目「${oldId}」的新名稱：`, oldId);
        if (!newName || !newName.trim() || newName.trim() === oldId) return;
        const res = await fetch('/api/subjects', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ oldId, newName: newName.trim() })
        });
        if (res.ok) {
          if (state.currentSubjectId === oldId) state.currentSubjectId = newName.trim();
          await fetchServerInfo();
          showToast(`✏️ 已將科目重新命名為「${newName.trim()}」！`);
        } else {
          const err = await res.json();
          alert(err.error || '重新命名失敗');
        }
        return;
      }

      const delSubBtn = e.target.closest('[data-delete-subject]');
      if (delSubBtn) {
        e.stopPropagation();
        const sid = delSubBtn.dataset.deleteSubject;
        if (!confirm(`確定要刪除自訂科目「${sid}」嗎？`)) return;
        await fetch(`/api/subjects/${encodeURIComponent(sid)}`, { method: 'DELETE' });
        fetchServerInfo();
        return;
      }

      if (e.target.closest('#addNewSubjectCardBtn')) {
        const newSubName = prompt(
          '請輸入要新增的科目名稱（例如：地球科學、資訊科技、探究與實作、自主學習）：'
        );
        if (!newSubName || !newSubName.trim()) return;
        const res = await fetch('/api/subjects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: newSubName.trim(), icon: '📘' })
        });
        if (res.ok) {
          await fetchServerInfo();
          showToast(`📘 已新增科目「${newSubName.trim()}」！`);
        } else {
          const err = await res.json();
          alert(err.error || '新增科目失敗');
        }
        return;
      }

      const subCard = e.target.closest('[data-select-subject]');
      if (subCard) {
        selectSubjectAndGoToTopic(subCard.dataset.selectSubject);
      }
    });

    // Step 3: Topic Grid Clicks (選擇報告項目)
    els.topicGridContainer.addEventListener('click', async (e) => {
      const renameTopicBtn = e.target.closest('[data-rename-topic]');
      if (renameTopicBtn) {
        e.stopPropagation();
        const oldId = renameTopicBtn.dataset.renameTopic;
        const newName = prompt(`請輸入報告項目「${oldId}」的新名稱：`, oldId);
        if (!newName || !newName.trim() || newName.trim() === oldId) return;
        const res = await fetch('/api/topics', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            classId: state.currentClassId,
            subjectId: state.currentSubjectId,
            oldId,
            newName: newName.trim()
          })
        });
        if (res.ok) {
          if (state.currentTopicId === oldId) state.currentTopicId = newName.trim();
          await fetchServerInfo();
          showToast(`✏️ 已重新命名為「${newName.trim()}」！`);
        } else {
          const err = await res.json();
          alert(err.error || '重新命名失敗');
        }
        return;
      }

      const delTopicBtn = e.target.closest('[data-delete-topic]');
      if (delTopicBtn) {
        e.stopPropagation();
        const tid = delTopicBtn.dataset.deleteTopic;
        if (
          !confirm(
            `確定要刪除「${state.currentSubjectId} — ${tid}」及其所有已上傳的簡報檔案嗎？`
          )
        )
          return;
        const q = new URLSearchParams({
          classId: state.currentClassId,
          subjectId: state.currentSubjectId,
          topicId: tid
        });
        const res = await fetch(`/api/topics?${q.toString()}`, { method: 'DELETE' });
        if (!res.ok) {
          const err = await res.json();
          alert(err.error || '刪除失敗');
        } else {
          fetchServerInfo();
        }
        return;
      }

      if (e.target.closest('#addNewTopicCardBtn')) {
        const newTopicName = prompt(
          `請輸入「${state.currentSubjectId}」的新報告名稱（例如：第二次報告、期中報告、第一課賞析、期末專題）：`
        );
        if (!newTopicName || !newTopicName.trim()) return;
        const res = await fetch('/api/topics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            classId: state.currentClassId,
            subjectId: state.currentSubjectId,
            name: newTopicName.trim()
          })
        });
        if (res.ok) {
          await fetchServerInfo();
          showToast(`📝 已新增報告項目「${newTopicName.trim()}」！`);
        } else {
          const err = await res.json();
          alert(err.error || '新增報告項目失敗');
        }
        return;
      }

      const topicCard = e.target.closest('[data-select-topic]');
      if (topicCard) {
        selectTopicAndGoToBoard(topicCard.dataset.selectTopic);
      }
    });

    // Filter tabs & stat cards
    document.querySelectorAll('.filter-tab, .stat-item').forEach((el) => {
      el.addEventListener('click', () => {
        const filter = el.dataset.filter;
        if (!filter) return;
        state.filterStatus = filter;
        document.querySelectorAll('.filter-tab').forEach((tab) => {
          tab.classList.toggle('active', tab.dataset.filter === filter);
        });
        renderCards();
      });
    });

    els.searchInput.addEventListener('input', (e) => {
      state.searchQuery = e.target.value;
      renderCards();
    });

    els.sortSelect.addEventListener('change', (e) => {
      state.sortBy = e.target.value;
      renderCards();
    });

    els.manageMenuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      els.manageDropdown.classList.toggle('hidden');
    });
    document.addEventListener('click', () => {
      els.manageDropdown.classList.add('hidden');
    });

    const renameCurrentTopicBtn = document.getElementById('renameCurrentTopicBtn');
    if (renameCurrentTopicBtn) {
      renameCurrentTopicBtn.addEventListener('click', async () => {
        const oldId = state.currentTopicId;
        const newName = prompt(`請輸入報告項目「${oldId}」的新名稱：`, oldId);
        if (!newName || !newName.trim() || newName.trim() === oldId) return;
        const res = await fetch('/api/topics', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            classId: state.currentClassId,
            subjectId: state.currentSubjectId,
            oldId,
            newName: newName.trim()
          })
        });
        if (res.ok) {
          state.currentTopicId = newName.trim();
          els.switchTopicBtn.textContent = `📝 ${state.currentTopicId}`;
          await fetchServerInfo();
          renderQrCodes();
          renderAll();
          showToast(`✏️ 已重新命名為「${state.currentTopicId}」！`);
        } else {
          const err = await res.json();
          alert(err.error || '重新命名失敗');
        }
      });
    }

    els.openRosterModalBtn.addEventListener('click', openRosterModal);
    els.openRosterFromMenuBtn.addEventListener('click', openRosterModal);
    els.emptyRosterBtn.addEventListener('click', openRosterModal);

    els.sortSaveSeatBtn.addEventListener('click', async () => {
      const sorted = [...state.presentations].sort(compareSeat);
      state.sortBy = 'order';
      els.sortSelect.value = 'order';
      await saveOrderToServer(sorted.map((p) => p.id));
      showToast('🔢 已依「座號/組別」更新預設報告順序！');
    });

    els.resetAllStatusBtn.addEventListener('click', async () => {
      if (!confirm('確定要將本次報告所有已上傳簡報的同學重置為「📥 待報告」嗎？')) return;
      await fetch('/api/presentations/clear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          classId: state.currentClassId,
          subjectId: state.currentSubjectId,
          topicId: state.currentTopicId,
          mode: 'reset_status'
        })
      });
      showToast('🔄 已重置本次報告狀態');
    });

    els.newRoundBtn.addEventListener('click', async () => {
      if (
        !confirm(
          `🧹 確定要清空「${state.currentClassId} ▸ ${state.currentSubjectId} ▸ ${state.currentTopicId}」目前已上傳的簡報嗎？\n\n這會【保留全班座號與姓名名單】，僅將本次報告恢復為「尚未上傳」狀態，不影響其他報告項目！`
        )
      )
        return;
      await fetch('/api/presentations/clear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          classId: state.currentClassId,
          subjectId: state.currentSubjectId,
          topicId: state.currentTopicId,
          mode: 'new_round'
        })
      });
      showToast('🧹 已清空本次報告舊簡報，全班恢復為「尚未上傳」狀態！');
    });

    // Roster Modal Events
    els.rosterTextarea.addEventListener('input', renderRosterLivePreview);

    els.load204RosterBtn.addEventListener('click', () => {
      els.rosterTextarea.value = CLASS_204_DEFAULT_TEXT;
      renderRosterLivePreview();
      showToast('🎓 已載入 204 班 (1~35號) 名單，請點選下方「確認匯入」套用');
    });

    els.uploadRosterFileBtn.addEventListener('click', () => {
      els.rosterFileInput.click();
    });

    els.rosterFileInput.addEventListener('change', (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        els.rosterTextarea.value = String(reader.result || '');
        renderRosterLivePreview();
        showToast(`📂 已讀取檔案「${file.name}」，請確認預覽後點選儲存！`);
      };
      reader.readAsText(file, 'utf-8');
      els.rosterFileInput.value = '';
    });

    els.exportRosterCsvBtn.addEventListener('click', exportCurrentRosterCsv);

    document.querySelectorAll('[data-gen]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const g = btn.dataset.gen;
        if (g === 'seats-30') {
          const countStr = prompt('請輸入全班總人數（例如 35）：', '35');
          const count = parseInt(countStr, 10);
          if (!count || count < 1 || count > 200) return;
          const lines = [];
          for (let i = 1; i <= count; i++) {
            const num = String(i).padStart(2, '0');
            lines.push(`${num}\t${num}號同學`);
          }
          els.rosterTextarea.value = lines.join('\n');
          renderRosterLivePreview();
        } else if (g === 'groups-10') {
          const countStr = prompt('請輸入總組數（例如 10）：', '10');
          const count = parseInt(countStr, 10);
          if (!count || count < 1 || count > 100) return;
          const lines = [];
          for (let i = 1; i <= count; i++) {
            lines.push(`第${i}組\t第 ${i} 組`);
          }
          els.rosterTextarea.value = lines.join('\n');
          renderRosterLivePreview();
        }
      });
    });

    els.saveRosterBtn.addEventListener('click', async () => {
      const entries = parseRosterText(els.rosterTextarea.value);
      if (entries.length === 0) {
        alert('請輸入至少一位同學或組別名單！');
        return;
      }
      const modeRadio = document.querySelector('input[name="rosterImportMode"]:checked');
      const mode = modeRadio ? modeRadio.value : 'smart_sync';

      if (
        mode === 'replace' &&
        state.presentations.some((p) => p.hasSubmitted) &&
        !confirm('⚠️ 選擇「完全覆蓋並重置」將會清除目前已上傳的簡報檔案，確定要繼續嗎？')
      ) {
        return;
      }

      const res = await fetch('/api/roster/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          classId: state.currentClassId,
          subjectId: state.currentSubjectId,
          topicId: state.currentTopicId,
          entries,
          mode
        })
      });

      if (res.ok) {
        els.rosterModal.classList.add('hidden');
      } else {
        alert('名單匯入失敗');
      }
    });

    // Upload Modal triggers
    els.openAddModalBtn.addEventListener('click', () => openUploadModalForStudent(''));

    els.studentSelectDropdown.addEventListener('change', (e) => {
      loadStudentIntoForm(e.target.value);
    });

    els.toggleEditNameBtn.addEventListener('click', () => {
      els.manualStudentFields.classList.toggle('hidden');
    });

    const openQrModal = () => {
      renderQrCodes();
      els.qrModal.classList.remove('hidden');
    };
    els.openQrModalBtn.addEventListener('click', openQrModal);
    els.expandQrBtn.addEventListener('click', openQrModal);
    els.miniQrContainer.addEventListener('click', openQrModal);

    els.openLotteryModalBtn.addEventListener('click', openLotteryModal);

    document.querySelectorAll('[data-close]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const target = document.getElementById(btn.dataset.close);
        if (target) target.classList.add('hidden');
      });
    });

    const copyCurrentUrl = async () => {
      try {
        await navigator.clipboard.writeText(els.largeQrUrlText.textContent);
        showToast('📋 已複製連線網址！');
      } catch (e) {
        prompt('請複製以下網址：', els.largeQrUrlText.textContent);
      }
    };
    els.copyUrlBtn.addEventListener('click', copyCurrentUrl);
    els.modalCopyUrlBtn.addEventListener('click', copyCurrentUrl);

    els.networkUrlSelect.addEventListener('change', (e) => {
      state.selectedNetworkUrl = e.target.value;
      renderQrCodes();
    });

    els.toggleTunnelBtn.addEventListener('click', async () => {
      await fetch('/api/tunnel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'restart' })
      });
      fetchServerInfo();
    });

    document.querySelectorAll('.source-tab').forEach((btn) => {
      btn.addEventListener('click', () => switchSourceTab(btn.dataset.source));
    });

    let waitingForFilePicker = false;
    let pickerCheckTimers = [];

    const clearPickerTimers = () => {
      pickerCheckTimers.forEach((t) => clearTimeout(t));
      pickerCheckTimers = [];
    };

    const syncSelectedFileFromInput = () => {
      if (els.fileInput.files && els.fileInput.files[0]) {
        waitingForFilePicker = false;
        clearPickerTimers();
        const picked = els.fileInput.files[0];
        const isNewPick = !state.pendingFile || state.pendingFile.name !== picked.name;
        state.pendingFile = picked;
        updateSelectedFileUI();
        if (isNewPick) {
          showToast(`📎 已附加檔案：${picked.name}`);
        }
        return true;
      }
      return false;
    };

    const startReturnPickerCheck = () => {
      if (!waitingForFilePicker) return;
      clearPickerTimers();
      [100, 400, 900, 1800].forEach((delay, idx, arr) => {
        const t = setTimeout(() => {
          if (syncSelectedFileFromInput()) return;
          if (idx === arr.length - 1 && waitingForFilePicker) {
            waitingForFilePicker = false;
            showToast(
              '⚠️ 手機未回傳檔案：若選取的是雲端原生簡報或未下載離線檔，請先匯出為 PDF，或改用「🔗 貼上雲端簡報連結」',
              5500
            );
          }
        }, delay);
        pickerCheckTimers.push(t);
      });
    };

    els.fileInput.addEventListener('click', () => {
      waitingForFilePicker = true;
    });
    els.fileInput.addEventListener('change', syncSelectedFileFromInput);
    els.fileInput.addEventListener('input', syncSelectedFileFromInput);
    window.addEventListener('focus', startReturnPickerCheck);
    window.addEventListener('pageshow', startReturnPickerCheck);
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) startReturnPickerCheck();
    });

    els.removeFileBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      waitingForFilePicker = false;
      clearPickerTimers();
      state.pendingFile = null;
      state.editingExistingFile = null;
      els.fileInput.value = '';
      updateSelectedFileUI();
    });

    els.dropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      els.dropZone.classList.add('dragover');
    });

    els.dropZone.addEventListener('dragleave', () => {
      els.dropZone.classList.remove('dragover');
    });

    els.dropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      els.dropZone.classList.remove('dragover');
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        state.pendingFile = e.dataTransfer.files[0];
        updateSelectedFileUI();
      }
    });

    els.inputUrl.addEventListener('input', (e) => {
      updateDetectedLinkHint(e.target.value);
    });

    // Submit Presentation Form
    els.presentationForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const selectedStudentId = els.studentSelectDropdown.value;
      const isNewStudent = selectedStudentId === '__NEW__' || !els.editItemId.value;

      const groupOrSeat = els.inputGroupOrSeat.value.trim();
      const presenterName = els.inputPresenterName.value.trim();
      const title = els.inputTitle.value.trim();
      const note = els.inputNote.value.trim();

      if (isNewStudent && !presenterName) {
        alert('請輸入報告者姓名或組別名稱！');
        return;
      }

      els.submitPresentationBtn.disabled = true;

      try {
        let payload = {
          classId: state.currentClassId,
          subjectId: state.currentSubjectId,
          topicId: state.currentTopicId,
          groupOrSeat,
          presenterName,
          title,
          note
        };

        if (state.sourceMode === 'file') {
          if (!state.pendingFile && els.fileInput.files && els.fileInput.files[0]) {
            state.pendingFile = els.fileInput.files[0];
          }
          if (!state.pendingFile && !state.editingExistingFile) {
            alert('請選擇要上傳的簡報檔案（PDF 或 PowerPoint），或切換至「貼上雲端簡報連結」！');
            els.submitPresentationBtn.disabled = false;
            return;
          }

          const openModeRadio = document.querySelector('input[name="fileOpenMode"]:checked');
          payload.openMode = openModeRadio ? openModeRadio.value : 'auto';
          payload.url = '';

          if (state.pendingFile) {
            const uploaded = await uploadFileWithProgress(state.pendingFile);
            payload.fileUrl = uploaded.fileUrl;
            payload.storedFileName = uploaded.storedFileName;
            payload.originalFileName = uploaded.originalFileName;
            payload.fileSize = uploaded.fileSize;
            payload.type = detectFileType(uploaded.originalFileName);
          } else if (state.editingExistingFile) {
            Object.assign(payload, state.editingExistingFile);
          }
        } else {
          const urlVal = els.inputUrl.value.trim();
          if (!urlVal) {
            alert('請貼上 Canva 或 Google 簡報連結網址！');
            els.submitPresentationBtn.disabled = false;
            return;
          }
          const openModeRadio = document.querySelector('input[name="linkOpenMode"]:checked');
          payload.openMode = openModeRadio ? openModeRadio.value : 'embed';
          payload.url = urlVal;
          payload.type = detectLinkType(urlVal);
          payload.fileUrl = '';
          payload.storedFileName = '';
          payload.originalFileName = '';
          payload.fileSize = 0;
        }

        const qStr = getCurrentBoardQuery();
        let saveRes;

        if (!isNewStudent && els.editItemId.value) {
          saveRes = await fetch(`/api/presentations/${els.editItemId.value}?${qStr}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
        } else {
          saveRes = await fetch(`/api/presentations?${qStr}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
        }

        if (!saveRes.ok) {
          let errMsg = `儲存失敗 (${saveRes.status})`;
          try {
            const errData = await saveRes.json();
            if (errData && errData.error) errMsg = errData.error;
          } catch (e) {}
          throw new Error(errMsg);
        }

        els.addEditModal.classList.add('hidden');
        await fetchBoardPresentations(
          state.currentClassId,
          state.currentSubjectId,
          state.currentTopicId
        );
        renderAll();
        showToast('✅ 簡報已成功上傳並儲存！');
      } catch (err) {
        alert(err.message || '儲存失敗，請重試');
      } finally {
        els.submitPresentationBtn.disabled = false;
      }
    });

    // Hover Preconnect / Pre-warm for faster presentation launch
    els.presentationsContainer.addEventListener('pointerover', (e) => {
      const btn = e.target.closest('.btn-launch, [data-action="open-embed"]');
      if (!btn) return;
      const item = state.presentations.find((p) => p.id === btn.dataset.id);
      if (item) warmPresentationAssets(item);
    });

    // Card Actions Delegation
    els.presentationsContainer.addEventListener('click', async (e) => {
      const btn = e.target.closest('[data-action]');
      if (!btn) return;
      const action = btn.dataset.action;
      const id = btn.dataset.id;
      const item = state.presentations.find((p) => p.id === id);
      if (!item) return;

      const qStr = getCurrentBoardQuery();

      if (action === 'upload-for-student') {
        openUploadModalForStudent(item.id);
      } else if (action === 'launch-primary') {
        launchPresentation(item);
      } else if (action === 'open-embed') {
        launchPresentation(item, 'embed');
      } else if (action === 'open-newtab') {
        launchPresentation(item, 'newtab');
      } else if (action === 'open-ppt-normal') {
        launchPresentation(item, 'powerpoint_normal');
      } else if (action === 'cycle-status') {
        if (!item.hasSubmitted) return;
        const nextMap = { pending: 'presenting', presenting: 'done', done: 'pending' };
        const nextStatus = nextMap[item.status] || 'pending';
        await fetch(`/api/presentations/${id}?${qStr}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: nextStatus })
        });
      } else if (action === 'clear-submission') {
        if (
          !confirm(
            `確定要清除「${item.presenterName}」在「${state.currentSubjectId} — ${state.currentTopicId}」已上傳的簡報嗎？（將保留該同學姓名，並恢復為「尚未上傳」狀態）`
          )
        )
          return;
        await fetch(`/api/presentations/${id}?${qStr}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ clearSubmission: true })
        });
        showToast(`🔄 已將「${item.presenterName}」重置為尚未上傳`);
      } else if (action === 'delete') {
        if (!confirm(`確定要從名單中移除「${item.presenterName}」嗎？`)) return;
        await fetch(`/api/presentations/${id}?${qStr}`, { method: 'DELETE' });
        showToast('🗑️ 已從名單移除');
      }
    });

    // Lottery Tabs & Buttons
    document.querySelectorAll('.lottery-tab').forEach((tab) => {
      tab.addEventListener('click', () => {
        const target = tab.dataset.ltab;
        document.querySelectorAll('.lottery-tab').forEach((t) =>
          t.classList.toggle('active', t.dataset.ltab === target)
        );
        els.lotterySinglePanel.classList.toggle('hidden', target !== 'single');
        els.lotteryShufflePanel.classList.toggle('hidden', target !== 'shuffle');
      });
    });

    els.spinSingleBtn.addEventListener('click', spinSingleLottery);
    els.startWinnerBtn.addEventListener('click', () => {
      if (state.lotteryWinner) {
        els.lotteryModal.classList.add('hidden');
        launchPresentation(state.lotteryWinner);
      }
    });
    els.runShuffleBtn.addEventListener('click', shuffleAllOrder);

    // Modal 5: Google Drive Multi-Folder Binding & Auto Sync
    const openGdriveImportBtn = document.getElementById('openGdriveImportBtn');
    const quickGdriveSyncBtn = document.getElementById('quickGdriveSyncBtn');
    const gdriveImportModal = document.getElementById('gdriveImportModal');
    const gdriveFolderLabelInput = document.getElementById('gdriveFolderLabelInput');
    const gdriveFolderUrlInput = document.getElementById('gdriveFolderUrlInput');
    const gdriveBindBtn = document.getElementById('gdriveBindBtn');
    const gdriveSyncAllBtn = document.getElementById('gdriveSyncAllBtn');
    const gdriveBindingCount = document.getElementById('gdriveBindingCount');
    const gdriveBindingsList = document.getElementById('gdriveBindingsList');
    const gdriveUnmatchedSection = document.getElementById('gdriveUnmatchedSection');
    const gdriveUnmatchedList = document.getElementById('gdriveUnmatchedList');
    const gdriveImportUnmatchedBtn = document.getElementById('gdriveImportUnmatchedBtn');
    let currentUnmatchedFiles = [];

    function renderUnmatchedFiles(files) {
      currentUnmatchedFiles = Array.isArray(files) ? files : [];
      if (!gdriveUnmatchedSection || !gdriveUnmatchedList) return;
      if (currentUnmatchedFiles.length === 0) {
        gdriveUnmatchedSection.classList.add('hidden');
        gdriveUnmatchedList.innerHTML = '';
        return;
      }

      const sortedStudents = [...state.presentations].sort(compareSeat);
      gdriveUnmatchedList.innerHTML = currentUnmatchedFiles
        .map((file, idx) => {
          const icon =
            file.type === 'gslides'
              ? '📊'
              : file.type === 'pdf'
              ? '📄'
              : file.type === 'pptx'
              ? '🟧'
              : '🔗';
          const optionsHtml = [
            '<option value="">-- 請選擇同學或組別 --</option>',
            '<option value="__NEW__">➕ 新增為獨立報告卡片</option>',
            ...sortedStudents.map((s) => {
              const seat = s.groupOrSeat ? `[${s.groupOrSeat}] ` : '';
              return `<option value="${escapeHtml(s.id)}">${escapeHtml(
                `${seat}${s.presenterName}`
              )}</option>`;
            })
          ].join('');

          return `
            <div class="gdrive-preview-row">
              <div class="gdrive-file-info" title="${escapeHtml(file.fileName)}">
                ${icon} ${escapeHtml(file.fileName)}
              </div>
              <button
                type="button"
                class="btn btn-xs btn-outline"
                data-preview-unmatched="${idx}"
                title="預覽此簡報內容以便辨認是哪位同學"
              >
                👁️ 預覽
              </button>
              <select class="gdrive-student-select" data-unmatched-idx="${idx}">
                ${optionsHtml}
              </select>
            </div>
          `;
        })
        .join('');
      gdriveUnmatchedSection.classList.remove('hidden');
    }

    function renderGdriveBindings() {
      const list = Array.isArray(state.gdriveBindings) ? state.gdriveBindings : [];
      if (gdriveBindingCount) gdriveBindingCount.textContent = list.length;
      if (quickGdriveSyncBtn) {
        quickGdriveSyncBtn.classList.toggle('hidden', list.length === 0);
      }
      if (!gdriveBindingsList) return;

      if (list.length === 0) {
        gdriveBindingsList.innerHTML =
          '<div class="hint" style="padding: 12px; text-align: center;">目前尚未綁定任何 Google 雲端資料夾</div>';
        return;
      }

      gdriveBindingsList.innerHTML = list
        .map((b) => {
          const syncTime = b.lastSyncedAt
            ? new Date(b.lastSyncedAt).toLocaleTimeString('zh-TW')
            : '尚未同步';
          const errHtml = b.lastError
            ? `<div style="color:#dc2626;font-size:0.78rem;">⚠️ ${escapeHtml(b.lastError)}</div>`
            : '';
          return `
            <div class="gdrive-binding-card">
              <div class="gdrive-binding-info">
                <div class="gdrive-binding-title">📁 ${escapeHtml(b.label || b.folderId)}</div>
                <div class="gdrive-binding-meta">共 ${b.fileCount || 0} 個檔案・上次同步：${escapeHtml(
            syncTime
          )}・${escapeHtml(b.folderUrl)}</div>
                ${errHtml}
              </div>
              <button
                type="button"
                class="btn btn-xs btn-outline"
                data-unbind-folder="${escapeHtml(b.folderId)}"
                style="color:#dc2626;border-color:#fca5a5;"
              >
                ✕ 解除綁定
              </button>
            </div>
          `;
        })
        .join('');
    }

    async function runManualGdriveSync(triggerBtn = null) {
      const origText = triggerBtn ? triggerBtn.textContent : '';
      if (triggerBtn) {
        triggerBtn.disabled = true;
        triggerBtn.textContent = '⏳ 同步中...';
      }
      try {
        const res = await fetch('/api/gdrive-sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            classId: state.currentClassId,
            subjectId: state.currentSubjectId,
            topicId: state.currentTopicId
          })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || '同步失敗');
        state.gdriveBindings = data.bindings || [];
        if (Array.isArray(data.presentations)) {
          state.presentations = data.presentations;
        }
        renderGdriveBindings();
        renderUnmatchedFiles(data.unmatchedFiles || []);
        renderAll();
        showToast(
          data.updatedCount > 0
            ? `✅ 已同步更新 ${data.updatedCount} 位同學的簡報！`
            : '✅ 雲端資料夾已是最新狀態'
        );
      } catch (err) {
        alert(err.message || '同步失敗');
      } finally {
        if (triggerBtn) {
          triggerBtn.disabled = false;
          triggerBtn.textContent = origText;
        }
      }
    }

    if (openGdriveImportBtn && gdriveImportModal) {
      openGdriveImportBtn.addEventListener('click', async () => {
        const q = getCurrentBoardQuery();
        try {
          const res = await fetch(`/api/gdrive-bindings?${q}`);
          const data = await res.json();
          if (Array.isArray(data.bindings)) state.gdriveBindings = data.bindings;
        } catch (e) {}
        renderGdriveBindings();
        gdriveImportModal.classList.remove('hidden');
      });

      if (quickGdriveSyncBtn) {
        quickGdriveSyncBtn.addEventListener('click', () => runManualGdriveSync(quickGdriveSyncBtn));
      }

      if (gdriveSyncAllBtn) {
        gdriveSyncAllBtn.addEventListener('click', () => runManualGdriveSync(gdriveSyncAllBtn));
      }

      gdriveBindBtn.addEventListener('click', async () => {
        const folderUrl = gdriveFolderUrlInput.value.trim();
        const label = gdriveFolderLabelInput ? gdriveFolderLabelInput.value.trim() : '';
        if (!folderUrl) {
          alert('請貼上 Google 雲端資料夾網址！');
          return;
        }
        gdriveBindBtn.disabled = true;
        gdriveBindBtn.textContent = '⏳ 綁定與同步中...';
        try {
          const res = await fetch('/api/gdrive-bindings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              classId: state.currentClassId,
              subjectId: state.currentSubjectId,
              topicId: state.currentTopicId,
              folderUrl,
              label
            })
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || '綁定失敗');
          state.gdriveBindings = data.bindings || [];
          if (Array.isArray(data.presentations)) {
            state.presentations = data.presentations;
          }
          gdriveFolderUrlInput.value = '';
          if (gdriveFolderLabelInput) gdriveFolderLabelInput.value = '';
          renderGdriveBindings();
          renderUnmatchedFiles(data.unmatchedFiles || []);
          renderAll();
          showToast(
            `✅ 已綁定資料夾（共 ${data.fileCount || 0} 個檔案，更新 ${data.updatedCount || 0} 位同學）`
          );
        } catch (err) {
          alert(err.message || '綁定失敗');
        } finally {
          gdriveBindBtn.disabled = false;
          gdriveBindBtn.textContent = '🔗 綁定並同步';
        }
      });

      gdriveBindingsList.addEventListener('click', async (e) => {
        const unbindBtn = e.target.closest('[data-unbind-folder]');
        if (!unbindBtn) return;
        const folderId = unbindBtn.dataset.unbindFolder;
        if (!confirm('確定要解除綁定此雲端資料夾嗎？（已匯入的簡報會保留）')) return;
        const q = new URLSearchParams({
          classId: state.currentClassId,
          subjectId: state.currentSubjectId,
          topicId: state.currentTopicId,
          folderId
        });
        const res = await fetch(`/api/gdrive-bindings?${q.toString()}`, { method: 'DELETE' });
        const data = await res.json();
        if (res.ok) {
          state.gdriveBindings = data.bindings || [];
          renderGdriveBindings();
          showToast('🗑️ 已解除綁定資料夾');
        }
      });

      if (gdriveUnmatchedList) {
        gdriveUnmatchedList.addEventListener('click', (e) => {
          const previewBtn = e.target.closest('[data-preview-unmatched]');
          if (!previewBtn) return;
          const idx = parseInt(previewBtn.dataset.previewUnmatched, 10);
          const file = currentUnmatchedFiles[idx];
          if (!file) return;
          const { embedUrl, newTabUrl } = resolvePresentationUrls(file);
          openFullscreenViewer(
            {
              groupOrSeat: '未配對',
              presenterName: file.fileName,
              title: '預覽內容辨認同學'
            },
            embedUrl,
            newTabUrl,
            true
          );
        });
      }

      if (gdriveImportUnmatchedBtn) {
        gdriveImportUnmatchedBtn.addEventListener('click', async () => {
          const selects = gdriveUnmatchedList.querySelectorAll('[data-unmatched-idx]');
          const mappings = [];
          selects.forEach((sel) => {
            const idx = parseInt(sel.dataset.unmatchedIdx, 10);
            const studentId = sel.value;
            const file = currentUnmatchedFiles[idx];
            if (studentId && file) {
              mappings.push({
                studentId,
                fileId: file.fileId,
                fileName: file.fileName,
                type: file.type,
                url: file.url
              });
            }
          });
          if (mappings.length === 0) {
            alert('請先為未配對的檔案選擇對應同學或「新增為獨立報告卡片」！');
            return;
          }
          gdriveImportUnmatchedBtn.disabled = true;
          try {
            const res = await fetch('/api/gdrive-import', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                classId: state.currentClassId,
                subjectId: state.currentSubjectId,
                topicId: state.currentTopicId,
                mappings
              })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || '匯入失敗');
            if (Array.isArray(data.presentations)) {
              state.presentations = data.presentations;
            }
            const mappedIds = new Set(mappings.map((m) => m.fileId));
            renderUnmatchedFiles(
              currentUnmatchedFiles.filter((f) => !mappedIds.has(f.fileId))
            );
            renderAll();
            showToast(`✅ 已成功匯入 ${data.importedCount} 個指定檔案！`);
          } catch (err) {
            alert(err.message || '匯入失敗');
          } finally {
            gdriveImportUnmatchedBtn.disabled = false;
          }
        });
      }
    }

    // Fullscreen Viewer Controls
    els.viewerReloadBtn.addEventListener('click', () => {
      if (state.activeViewerItem) {
        els.viewerIframe.src = state.activeViewerItem.embedUrl;
      }
    });

    els.viewerOpenNewTabBtn.addEventListener('click', () => {
      if (state.activeViewerItem) {
        window.open(state.activeViewerItem.newTabUrl, '_blank', 'noopener');
      }
    });

    els.viewerFullscreenBtn.addEventListener('click', () => {
      if (!document.fullscreenElement) {
        els.viewerOverlay.requestFullscreen().catch(() => {});
      } else {
        document.exitFullscreen().catch(() => {});
      }
    });

    els.viewerCompleteNextBtn.addEventListener('click', async () => {
      if (state.activeViewerItem && state.activeViewerItem.item) {
        const id = state.activeViewerItem.item.id;
        await fetch(`/api/presentations/${id}?${getCurrentBoardQuery()}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'done' })
        });
        showToast(`✅ 已將「${state.activeViewerItem.item.presenterName}」標記為已完成報告！`);
      }
      closeFullscreenViewer();
    });

    els.viewerCloseBtn.addEventListener('click', closeFullscreenViewer);
  }

  // ==================== Initialize ====================
  bindEvents();
  fetchServerInfo();
  connectSSE();
})();
