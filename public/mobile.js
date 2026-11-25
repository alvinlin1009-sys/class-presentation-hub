(function () {
  const state = {
    classId: '',
    subjectId: '',
    topicId: '',
    presentations: [],
    sourceMode: 'file',
    pendingFile: null,
    editingExistingFile: null
  };

  const els = {
    mClassTag: document.getElementById('mClassTag'),
    mSubjectTag: document.getElementById('mSubjectTag'),
    mTopicTag: document.getElementById('mTopicTag'),
    mLiveBadge: document.getElementById('mLiveBadge'),
    mSubmittedCount: document.getElementById('mSubmittedCount'),

    mUploadView: document.getElementById('mUploadView'),
    mStatusView: document.getElementById('mStatusView'),

    mSuccessCard: document.getElementById('mSuccessCard'),
    mSuccessTitle: document.getElementById('mSuccessTitle'),
    mSuccessDesc: document.getElementById('mSuccessDesc'),
    mEditAgainBtn: document.getElementById('mEditAgainBtn'),
    mGoStatusBtn: document.getElementById('mGoStatusBtn'),

    mUploadForm: document.getElementById('mUploadForm'),
    mStudentSelect: document.getElementById('mStudentSelect'),
    mStudentStatusHint: document.getElementById('mStudentStatusHint'),
    mManualStudentBox: document.getElementById('mManualStudentBox'),
    mManualSeat: document.getElementById('mManualSeat'),
    mManualName: document.getElementById('mManualName'),

    mFilePanel: document.getElementById('mFilePanel'),
    mLinkPanel: document.getElementById('mLinkPanel'),
    mFileInput: document.getElementById('mFileInput'),
    mFilePrompt: document.getElementById('mFilePrompt'),
    mFileSelected: document.getElementById('mFileSelected'),
    mFileIcon: document.getElementById('mFileIcon'),
    mFileName: document.getElementById('mFileName'),
    mFileSize: document.getElementById('mFileSize'),
    mClearFileBtn: document.getElementById('mClearFileBtn'),

    mProgressBox: document.getElementById('mProgressBox'),
    mProgressText: document.getElementById('mProgressText'),
    mProgressPct: document.getElementById('mProgressPct'),
    mProgressFill: document.getElementById('mProgressFill'),

    mUrlInput: document.getElementById('mUrlInput'),
    mLinkDetectHint: document.getElementById('mLinkDetectHint'),
    mTitleInput: document.getElementById('mTitleInput'),
    mNoteInput: document.getElementById('mNoteInput'),
    mSubmitBtn: document.getElementById('mSubmitBtn'),

    mStatSub: document.getElementById('mStatSub'),
    mStatUnsub: document.getElementById('mStatUnsub'),
    mStatDone: document.getElementById('mStatDone'),
    mRosterList: document.getElementById('mRosterList'),
    mToast: document.getElementById('mToast')
  };

  let toastTimer = null;
  function showToast(msg, duration = 3500) {
    els.mToast.textContent = msg;
    els.mToast.classList.remove('hidden');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      els.mToast.classList.add('hidden');
    }, duration);
  }

  function escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function formatBytes(bytes) {
    if (!bytes || bytes <= 0) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  function detectFileType(fileName) {
    const ext = (fileName || '').split('.').pop().toLowerCase();
    if (ext === 'pdf') return 'pdf';
    if (['pptx', 'ppt', 'ppsx'].includes(ext)) return 'pptx';
    return 'file';
  }

  function detectLinkType(url) {
    const u = (url || '').trim().toLowerCase();
    if (!u) return 'link';
    if (u.includes('canva.com/')) return 'canva';
    if (u.includes('docs.google.com/presentation/')) return 'gslides';
    if (u.endsWith('.pdf') || u.includes('.pdf?')) return 'pdf';
    return 'link';
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

  function switchMainTab(tab) {
    document.querySelectorAll('.m-nav-tab').forEach((b) => {
      b.classList.toggle('active', b.dataset.mtab === tab);
    });
    els.mUploadView.classList.toggle('hidden', tab !== 'upload');
    els.mStatusView.classList.toggle('hidden', tab !== 'status');
  }

  function switchSourceMode(mode) {
    state.sourceMode = mode;
    document.querySelectorAll('.m-source-btn').forEach((b) => {
      b.classList.toggle('active', b.dataset.msource === mode);
    });
    els.mFilePanel.classList.toggle('hidden', mode !== 'file');
    els.mLinkPanel.classList.toggle('hidden', mode !== 'link');
  }

  function updateFileUI() {
    if (state.pendingFile) {
      els.mFilePrompt.classList.add('hidden');
      els.mFileSelected.classList.remove('hidden');
      els.mFileInput.classList.add('hidden');
      const ft = detectFileType(state.pendingFile.name);
      els.mFileIcon.textContent = ft === 'pdf' ? '📄' : ft === 'pptx' ? '🟧' : '📁';
      els.mFileName.textContent = state.pendingFile.name || '已選取簡報檔案';
      els.mFileSize.textContent = formatBytes(state.pendingFile.size) || '雲端檔案';
    } else if (state.editingExistingFile) {
      els.mFilePrompt.classList.add('hidden');
      els.mFileSelected.classList.remove('hidden');
      els.mFileInput.classList.add('hidden');
      els.mFileIcon.textContent = state.editingExistingFile.type === 'pdf' ? '📄' : '🟧';
      els.mFileName.textContent = state.editingExistingFile.originalFileName || '已上傳簡報';
      els.mFileSize.textContent = formatBytes(state.editingExistingFile.fileSize);
    } else {
      els.mFilePrompt.classList.remove('hidden');
      els.mFileSelected.classList.add('hidden');
      els.mFileInput.classList.remove('hidden');
    }
  }

  function populateStudents(preserveId = '') {
    const sorted = [...state.presentations].sort(compareSeat);
    const currentId = preserveId || els.mStudentSelect.value;

    let html = sorted
      .map((p) => {
        const seat = p.groupOrSeat ? `[${p.groupOrSeat}] ` : '';
        const mark = p.hasSubmitted ? '✅ 已上傳' : '❌ 未上傳';
        return `<option value="${escapeHtml(p.id)}">${escapeHtml(`${seat}${p.presenterName}（${mark}）`)}</option>`;
      })
      .join('');

    html += '<option value="__NEW__">➕ 新增不在名單上的同學 / 組別...</option>';
    els.mStudentSelect.innerHTML = html;

    if (currentId && (currentId === '__NEW__' || sorted.some((p) => p.id === currentId))) {
      els.mStudentSelect.value = currentId;
    } else if (sorted.length > 0) {
      const firstUnsub = sorted.find((p) => !p.hasSubmitted) || sorted[0];
      els.mStudentSelect.value = firstUnsub.id;
    } else {
      els.mStudentSelect.value = '__NEW__';
    }

    onStudentChanged(false);
  }

  function onStudentChanged(clearPending = true) {
    const val = els.mStudentSelect.value;
    if (clearPending) {
      state.pendingFile = null;
      els.mFileInput.value = '';
    }

    if (val === '__NEW__') {
      els.mManualStudentBox.classList.remove('hidden');
      els.mStudentStatusHint.textContent = '請填寫座號與姓名後上傳簡報。';
      state.editingExistingFile = null;
      els.mTitleInput.value = '';
      els.mUrlInput.value = '';
      els.mNoteInput.value = '';
      updateFileUI();
      return;
    }

    els.mManualStudentBox.classList.add('hidden');
    const item = state.presentations.find((p) => p.id === val);
    if (!item) return;

    els.mManualSeat.value = item.groupOrSeat || '';
    els.mManualName.value = item.presenterName || '';
    els.mTitleInput.value = item.title || '';
    els.mUrlInput.value = item.url || '';
    els.mNoteInput.value = item.note || '';

    if (item.hasSubmitted) {
      els.mStudentStatusHint.textContent = '✅ 目前已有上傳紀錄，若重新送出將會覆蓋舊簡報。';
      els.mStudentStatusHint.style.color = '#15803d';
    } else {
      els.mStudentStatusHint.textContent = '❌ 尚未上傳簡報，請選擇檔案或貼上連結。';
      els.mStudentStatusHint.style.color = '#b91c1c';
    }

    if (!state.pendingFile) {
      if (item.fileUrl) {
        state.editingExistingFile = {
          fileUrl: item.fileUrl,
          storedFileName: item.storedFileName,
          originalFileName: item.originalFileName,
          fileSize: item.fileSize,
          type: item.type
        };
        switchSourceMode('file');
      } else if (item.url) {
        state.editingExistingFile = null;
        switchSourceMode('link');
      } else {
        state.editingExistingFile = null;
        switchSourceMode('file');
      }
    }

    updateFileUI();
  }

  function renderStatusList() {
    const total = state.presentations.length;
    const submitted = state.presentations.filter((p) => p.hasSubmitted).length;
    const unsubmitted = total - submitted;
    const done = state.presentations.filter((p) => p.status === 'done').length;

    els.mSubmittedCount.textContent = `${submitted}/${total}`;
    els.mStatSub.textContent = submitted;
    els.mStatUnsub.textContent = unsubmitted;
    els.mStatDone.textContent = done;

    const sorted = [...state.presentations].sort(compareSeat);
    els.mRosterList.innerHTML = sorted
      .map((p) => {
        let badgeCls = 'unsub';
        let badgeTxt = '尚未上傳';
        if (p.hasSubmitted) {
          if (p.status === 'presenting') {
            badgeCls = 'pres';
            badgeTxt = '報告中';
          } else if (p.status === 'done') {
            badgeCls = 'done';
            badgeTxt = '已完成';
          } else {
            badgeCls = 'pend';
            badgeTxt = '已上傳';
          }
        }
        return `
          <div class="m-roster-row ${p.hasSubmitted ? 'submitted' : ''}">
            <div class="m-roster-left">
              ${p.groupOrSeat ? `<span class="m-seat">${escapeHtml(p.groupOrSeat)}</span>` : ''}
              <span class="m-name">${escapeHtml(p.presenterName)}</span>
            </div>
            <span class="m-badge ${badgeCls}">${badgeTxt}</span>
          </div>
        `;
      })
      .join('');
  }

  async function loadBoardData(preserveSelected = true) {
    const q = new URLSearchParams({
      classId: state.classId,
      subjectId: state.subjectId,
      topicId: state.topicId
    });
    const res = await fetch(`/api/presentations?${q.toString()}`);
    const data = await res.json();
    if (Array.isArray(data.presentations)) {
      state.presentations = data.presentations;
      populateStudents(preserveSelected ? els.mStudentSelect.value : '');
      renderStatusList();
    }
  }

  async function init() {
    try {
      const infoRes = await fetch('/api/info');
      const info = await infoRes.json();

      const params = new URLSearchParams(window.location.search);
      let cId = params.get('classId') || (info.activeSession && info.activeSession.classId) || '';
      let sId = params.get('subjectId') || (info.activeSession && info.activeSession.subjectId) || '';
      let tId = params.get('topicId') || (info.activeSession && info.activeSession.topicId) || '';

      if ((!cId || !sId || !tId) && info.hierarchySummary) {
        for (const cid of Object.keys(info.hierarchySummary)) {
          for (const sid of Object.keys(info.hierarchySummary[cid] || {})) {
            const tList =
              (info.hierarchySummary[cid][sid] && info.hierarchySummary[cid][sid].topics) || [];
            if (tList.length > 0) {
              cId = cid;
              sId = sid;
              tId = tList[0].id;
              break;
            }
          }
          if (tId) break;
        }
      }

      state.classId = cId || (info.classes[0] && info.classes[0].id) || '204班';
      state.subjectId = sId || (info.subjects[0] && info.subjects[0].id) || '國文';
      state.topicId = tId;

      els.mClassTag.textContent = `🏫 ${state.classId}`;
      els.mSubjectTag.textContent = `📘 ${state.subjectId}`;
      els.mTopicTag.textContent = state.topicId ? `📝 ${state.topicId}` : '未指定報告項目';

      if (!state.topicId) {
        showToast('⚠️ 講台電腦尚未選擇報告項目，請先請老師開啟報告頁面');
        return;
      }

      await loadBoardData(false);
      connectSSE();
    } catch (err) {
      showToast('⚠️ 無法連線伺服器，請重新掃描 QR Code');
    }
  }

  function connectSSE() {
    const evt = new EventSource('/api/events');
    evt.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (
          data.classId === state.classId &&
          data.subjectId === state.subjectId &&
          data.topicId === state.topicId &&
          Array.isArray(data.presentations)
        ) {
          state.presentations = data.presentations;
          populateStudents(els.mStudentSelect.value);
          renderStatusList();
        }
      } catch (err) {}
    };
    evt.onerror = () => {
      els.mLiveBadge.textContent = '● 重新連線中';
      els.mLiveBadge.style.color = '#fde68a';
      setTimeout(() => {
        els.mLiveBadge.textContent = '● 即時連線';
        els.mLiveBadge.style.color = '#86efac';
      }, 2500);
    };
  }

  function uploadFile(file) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', '/api/upload', true);
      xhr.timeout = 120000;
      xhr.setRequestHeader('Content-Type', 'application/octet-stream');
      xhr.setRequestHeader('X-File-Name', encodeURIComponent(file.name || 'presentation.bin'));

      els.mProgressBox.classList.remove('hidden');
      els.mProgressFill.style.width = '0%';
      els.mProgressPct.textContent = '0%';

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const pct = Math.round((e.loaded / e.total) * 100);
          els.mProgressFill.style.width = `${pct}%`;
          els.mProgressPct.textContent = `${pct}%`;
          els.mProgressText.textContent =
            pct >= 100 ? '⏳ 傳送完畢，正在儲存...' : `正在上傳 ${file.name}...`;
        }
      };

      xhr.onload = () => {
        els.mProgressBox.classList.add('hidden');
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(JSON.parse(xhr.responseText));
        } else {
          reject(new Error(`檔案上傳失敗 (${xhr.status})`));
        }
      };

      xhr.onerror = () => {
        els.mProgressBox.classList.add('hidden');
        reject(new Error('網路連線異常，請重試'));
      };

      xhr.ontimeout = () => {
        els.mProgressBox.classList.add('hidden');
        reject(new Error('上傳逾時，請確認網路連線後重試'));
      };

      xhr.send(file);
    });
  }

  // Event Bindings
  document.querySelectorAll('.m-nav-tab').forEach((btn) => {
    btn.addEventListener('click', () => switchMainTab(btn.dataset.mtab));
  });

  document.querySelectorAll('.m-source-btn').forEach((btn) => {
    btn.addEventListener('click', () => switchSourceMode(btn.dataset.msource));
  });

  els.mStudentSelect.addEventListener('change', () => onStudentChanged(true));

  let waitingPicker = false;
  let pickerTimers = [];
  const syncPickedFile = () => {
    if (els.mFileInput.files && els.mFileInput.files[0]) {
      waitingPicker = false;
      pickerTimers.forEach((t) => clearTimeout(t));
      pickerTimers = [];
      const f = els.mFileInput.files[0];
      const isNew = !state.pendingFile || state.pendingFile.name !== f.name;
      state.pendingFile = f;
      updateFileUI();
      if (isNew) showToast(`📎 已附加：${f.name}`);
      return true;
    }
    return false;
  };

  const checkPickerOnReturn = () => {
    if (!waitingPicker) return;
    pickerTimers.forEach((t) => clearTimeout(t));
    pickerTimers = [100, 400, 900, 1800].map((ms, idx, arr) =>
      setTimeout(() => {
        if (syncPickedFile()) return;
        if (idx === arr.length - 1 && waitingPicker) {
          waitingPicker = false;
          showToast(
            '⚠️ 未收到檔案：若是雲端原生簡報，請先匯出 PDF 或改用「貼上連結」',
            4500
          );
        }
      }, ms)
    );
  };

  els.mFileInput.addEventListener('click', () => {
    waitingPicker = true;
  });
  els.mFileInput.addEventListener('change', syncPickedFile);
  els.mFileInput.addEventListener('input', syncPickedFile);
  window.addEventListener('focus', checkPickerOnReturn);
  window.addEventListener('pageshow', checkPickerOnReturn);
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) checkPickerOnReturn();
  });

  els.mClearFileBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    waitingPicker = false;
    state.pendingFile = null;
    state.editingExistingFile = null;
    els.mFileInput.value = '';
    updateFileUI();
  });

  els.mUrlInput.addEventListener('input', (e) => {
    const t = detectLinkType(e.target.value);
    if (t === 'canva') {
      els.mLinkDetectHint.textContent = '🎨 已偵測為 Canva 簡報，將自動轉為全螢幕播放！';
    } else if (t === 'gslides') {
      els.mLinkDetectHint.textContent = '📊 已偵測為 Google 簡報，將自動轉為全螢幕播放！';
    } else {
      els.mLinkDetectHint.textContent = '💡 支援 Canva 分享連結、Google 簡報連結，系統會自動轉為全螢幕播放模式！';
    }
  });

  els.mUploadForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const selId = els.mStudentSelect.value;
    const isNew = selId === '__NEW__';
    const seat = els.mManualSeat.value.trim();
    const name = els.mManualName.value.trim();

    if (isNew && !name) {
      alert('請輸入你的姓名或組別名稱！');
      return;
    }

    els.mSubmitBtn.disabled = true;
    els.mSubmitBtn.textContent = '⏳ 正在上傳與儲存...';

    try {
      const payload = {
        classId: state.classId,
        subjectId: state.subjectId,
        topicId: state.topicId,
        groupOrSeat: seat,
        presenterName: name,
        title: els.mTitleInput.value.trim(),
        note: els.mNoteInput.value.trim()
      };

      if (state.sourceMode === 'file') {
        if (!state.pendingFile && els.mFileInput.files && els.mFileInput.files[0]) {
          state.pendingFile = els.mFileInput.files[0];
        }
        if (!state.pendingFile && !state.editingExistingFile) {
          alert('請先選擇要上傳的簡報檔案，或切換為「貼上連結」！');
          return;
        }
        payload.openMode = 'auto';
        payload.url = '';
        if (state.pendingFile) {
          const uploaded = await uploadFile(state.pendingFile);
          payload.fileUrl = uploaded.fileUrl;
          payload.storedFileName = uploaded.storedFileName;
          payload.originalFileName = uploaded.originalFileName;
          payload.fileSize = uploaded.fileSize;
          payload.type = detectFileType(uploaded.originalFileName);
        } else {
          Object.assign(payload, state.editingExistingFile);
        }
      } else {
        const urlVal = els.mUrlInput.value.trim();
        if (!urlVal) {
          alert('請貼上 Canva 或 Google 簡報網址！');
          return;
        }
        payload.openMode = 'embed';
        payload.url = urlVal;
        payload.type = detectLinkType(urlVal);
        payload.fileUrl = '';
        payload.storedFileName = '';
        payload.originalFileName = '';
        payload.fileSize = 0;
      }

      const qStr = new URLSearchParams({
        classId: state.classId,
        subjectId: state.subjectId,
        topicId: state.topicId
      }).toString();

      const res = await fetch(
        isNew ? `/api/presentations?${qStr}` : `/api/presentations/${selId}?${qStr}`,
        {
          method: isNew ? 'POST' : 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        }
      );

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || '儲存失敗');
      }

      const savedData = await res.json();
      await loadBoardData(true);
      if (isNew && savedData.item && savedData.item.id) {
        els.mStudentSelect.value = savedData.item.id;
      }

      els.mUploadForm.classList.add('hidden');
      els.mSuccessCard.classList.remove('hidden');
      const displaySeat = seat ? `[${seat}] ` : '';
      els.mSuccessTitle.textContent = `${displaySeat}${name} 上傳成功！`;
      els.mSuccessDesc.textContent =
        payload.originalFileName || payload.title || '雲端簡報連結已綁定到講台電腦';
      showToast('✅ 簡報已成功送出！');
    } catch (err) {
      alert(err.message || '上傳失敗，請重試');
    } finally {
      els.mSubmitBtn.disabled = false;
      els.mSubmitBtn.textContent = '✅ 確認上傳並送出';
    }
  });

  els.mEditAgainBtn.addEventListener('click', () => {
    els.mSuccessCard.classList.add('hidden');
    els.mUploadForm.classList.remove('hidden');
    onStudentChanged(true);
  });

  els.mGoStatusBtn.addEventListener('click', () => {
    switchMainTab('status');
  });

  init();
})();
