// Minimal interactivity for the static mockup screens: clicking a list
// row opens its ticket, clicking the vote button votes instead - it must
// not also trigger the row's navigation.
(function () {
  // A ticket created on new-ticket.html is handed off to my-tickets.html
  // through localStorage (there's no backend, and a full page redirect
  // can't carry JS state) - see createTicketAndRedirect() / renderStoredTickets().
  var STORAGE_KEY = 'feedbackMockup:tickets';
  var OPEN_KEY = 'feedbackMockup:openTicketId';
  var CATEGORY_TAG_CLASS = {
    'Баг': 'tag-danger',
    'Идея': 'tag-info',
    'Отзыв': 'tag-neutral',
    'Другое': 'tag-neutral'
  };
  var CATEGORY_OPTIONS = ['Баг', 'Идея', 'Отзыв', 'Другое'];

  function isInsideLikeButton(el) {
    return !!(el && el.closest && el.closest('.like-btn'));
  }

  // Chat message timestamps show a clock time (HH:MM), not a relative
  // label - that's reserved for the ticket list's row-time and comments.
  function formatClockTime(date) {
    var hours = String(date.getHours()).padStart(2, '0');
    var minutes = String(date.getMinutes()).padStart(2, '0');
    return hours + ':' + minutes;
  }

  function minutesAgoClockTime(minutes) {
    return formatClockTime(new Date(Date.now() - minutes * 60000));
  }

  // Textarea autosize shared by the ticket compose bar and the comments
  // box: grows line-by-line up to maxLines, then the (already styled)
  // scrollbar takes over. No CSS transition on height - see styles.css.
  function autoGrowTextarea(textarea, maxLines) {
    var style = getComputedStyle(textarea);
    var lineHeight = parseFloat(style.lineHeight) || 21;
    var paddingY = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
    var maxHeight = Math.round(lineHeight * maxLines + paddingY);
    textarea.style.height = 'auto';
    var nextHeight = Math.min(textarea.scrollHeight, maxHeight);
    textarea.style.height = nextHeight + 'px';
    textarea.style.overflowY = textarea.scrollHeight > maxHeight ? 'auto' : 'hidden';
  }

  var FILE_ICON =
    '<svg class="icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
    '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/></svg>';
  var REMOVE_ICON =
    '<svg class="icon" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">' +
    '<path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>';
  var LIKE_ICON =
    '<svg class="icon" width="14" height="14" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
    '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>';
  // lucide "corner-down-right" - the comment's reply-style connector.
  var REPLY_ICON =
    '<svg class="icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
    '<polyline points="15 10 20 15 15 20"/><path d="M4 4v7a4 4 0 0 0 4 4h12"/></svg>';
  var CHEVRON_LEFT_ICON =
    '<svg class="icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
    '<path d="m15 18-6-6 6-6"/></svg>';
  var CHEVRON_RIGHT_ICON =
    '<svg class="icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
    '<path d="m9 18 6-6-6-6"/></svg>';
  // lucide "check-check" / "check" - read receipt on a sent message:
  // two ticks once it's been read, one while it's still just sent.
  var READ_ICON =
    '<svg class="icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
    '<path d="M18 6 7 17l-5-5"/><path d="m22 10-7.5 7.5L13 16"/></svg>';
  var SENT_ICON =
    '<svg class="icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
    '<path d="M20 6 9 17l-5-5"/></svg>';
  // Read-only attachment chip for a sent message bubble - same look as
  // the compose bar's own preview, minus the remove button. Clicking it
  // opens the file, same as a compose-bar chip.
  function buildAttachmentPreview(record) {
    var chip = document.createElement('div');
    chip.className = 'attachment-chip';
    var isImage = record.file.type.indexOf('image/') === 0;
    if (isImage) {
      var img = document.createElement('img');
      img.className = 'attachment-thumb';
      img.src = record.url;
      img.alt = record.file.name;
      chip.appendChild(img);
    } else {
      var fileWrap = document.createElement('div');
      fileWrap.className = 'attachment-file';
      fileWrap.innerHTML = FILE_ICON;
      var nameEl = document.createElement('span');
      nameEl.className = 'attachment-filename';
      nameEl.textContent = record.file.name;
      nameEl.title = record.file.name;
      fileWrap.appendChild(nameEl);
      chip.appendChild(fileWrap);
    }
    if (record.url) {
      chip.addEventListener('click', function () {
        window.open(record.url, '_blank', 'noopener');
      });
    }
    return chip;
  }

  // The time + read-receipt block. Embedded at the end of the text (see
  // buildMessage) it floats right so a short message stays one compact
  // line - "Ok  19:51 ✓✓" - instead of always getting its own row.
  function buildMessageMeta(time, mine, read) {
    var metaEl = document.createElement('span');
    metaEl.className = 'msg-meta';
    var timeEl = document.createElement('span');
    timeEl.className = 'msg-time';
    timeEl.textContent = time;
    metaEl.appendChild(timeEl);
    // Read receipt - only a message of mine has someone else's read
    // status to show: two ticks once it's been read, one while it hasn't.
    if (mine) {
      var readEl = document.createElement('span');
      readEl.className = 'msg-read-icon';
      readEl.innerHTML = read ? READ_ICON : SENT_ICON;
      metaEl.appendChild(readEl);
    }
    return metaEl;
  }

  function buildMessage(text, time, mine, attachmentRecords, senderName, read) {
    var rowEl = document.createElement('div');
    rowEl.className = 'msg-row' + (mine ? ' mine' : '');
    var bubble = document.createElement('div');
    bubble.className = 'msg-bubble' + (mine ? ' mine' : '');

    // Who sent it, on their bubbles only - a sent bubble is unambiguous.
    if (!mine && senderName) {
      var senderEl = document.createElement('div');
      senderEl.className = 'msg-sender';
      senderEl.textContent = senderName;
      bubble.appendChild(senderEl);
    }

    if (attachmentRecords && attachmentRecords.length) {
      var attachWrap = document.createElement('div');
      attachWrap.className = 'msg-attachments';
      attachmentRecords.forEach(function (record) {
        attachWrap.appendChild(buildAttachmentPreview(record));
      });
      bubble.appendChild(attachWrap);
    }

    if (text) {
      var textEl = document.createElement('p');
      textEl.className = 'msg-text';
      textEl.appendChild(document.createTextNode(text));
      textEl.appendChild(buildMessageMeta(time, mine, read));
      bubble.appendChild(textEl);
    } else {
      bubble.appendChild(buildMessageMeta(time, mine, read));
    }

    rowEl.appendChild(bubble);
    return rowEl;
  }

  function buildComment(author, time, text) {
    var item = document.createElement('div');
    item.className = 'comment-item';
    var body = document.createElement('div');
    body.className = 'comment-body';
    var meta = document.createElement('div');
    meta.className = 'comment-meta';
    var authorEl = document.createElement('span');
    authorEl.className = 'comment-author';
    authorEl.textContent = author;
    var timeEl = document.createElement('span');
    timeEl.className = 'comment-time';
    timeEl.textContent = time;
    meta.appendChild(authorEl);
    meta.appendChild(timeEl);
    var textEl = document.createElement('div');
    textEl.className = 'comment-text';
    textEl.innerHTML = REPLY_ICON;
    var textSpan = document.createElement('span');
    textSpan.textContent = text;
    textEl.appendChild(textSpan);
    body.appendChild(meta);
    body.appendChild(textEl);
    item.appendChild(body);
    return item;
  }

  // Example seed comment shown on someone else's ticket, so the pattern
  // ("visible to the team, who left it") reads clearly in the mockup.
  var COMMENT_SEED = {
    author: 'Мария Волкова',
    time: '3 ч назад',
    text: 'Уточните шаги воспроизведения перед тем как брать в работу.'
  };

  function wireLikeButton(btn) {
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      var countEl = btn.querySelector('.like-count');
      var count = parseInt(countEl.textContent, 10);
      var liked = btn.classList.toggle('liked');
      countEl.textContent = String(liked ? count + 1 : count - 1);
    });
  }

  // --- New-ticket creation: handed to my-tickets.html via localStorage ---

  function loadStoredTickets() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    } catch (e) {
      return [];
    }
  }

  function fileToDataUrl(file) {
    return new Promise(function (resolve) {
      var reader = new FileReader();
      reader.onload = function () { resolve(reader.result); };
      reader.readAsDataURL(file);
    });
  }

  // Object URLs die with the page that created them, so anything crossing
  // the redirect to my-tickets.html has to be a persistable data URL.
  function serializeAttachments(records) {
    return Promise.all(records.map(function (record) {
      var isImage = record.file.type.indexOf('image/') === 0;
      if (isImage) {
        return fileToDataUrl(record.file).then(function (dataUrl) {
          return { name: record.file.name, isImage: true, dataUrl: dataUrl };
        });
      }
      return Promise.resolve({ name: record.file.name, isImage: false, dataUrl: null });
    }));
  }

  function createTicketAndRedirect(subjectInput, textarea, attachments) {
    var subject = subjectInput.value.trim();
    var text = textarea.value.trim();
    if (!subject || (!text && attachments.length === 0)) return;

    var activePill = document.querySelector('.pills .pill.is-active');
    var categoryLabel = activePill ? activePill.textContent.trim() : 'Баг';
    var tagClass = CATEGORY_TAG_CLASS[categoryLabel] || 'tag-neutral';

    serializeAttachments(attachments).then(function (serialized) {
      var ticket = {
        id: 'local-' + Date.now(),
        categoryLabel: categoryLabel,
        categoryTagClass: tagClass,
        statusLabel: 'Открыто',
        statusTagClass: 'tag-warning',
        title: subject,
        snippet: subject,
        time: 'только что',
        messageTime: formatClockTime(new Date()),
        message: text,
        attachments: serialized,
        votable: categoryLabel === 'Баг' || categoryLabel === 'Идея',
        likeCount: 0
      };
      var stored = loadStoredTickets();
      stored.unshift(ticket);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
        localStorage.setItem(OPEN_KEY, ticket.id);
      } catch (e) {
        // Storage full/unavailable - still navigate, it just won't be there.
      }
      window.location.href = 'my-tickets.html';
    });
  }

  function buildTicketRow(ticket, variant) {
    var row = document.createElement('div');
    row.className = 'list-row ' + (variant === 'wide' ? 'list-row-wide' : 'list-row-lg');
    row.tabIndex = 0;
    row.setAttribute('role', 'button');
    row.dataset.ticketId = ticket.id;
    row.dataset.message = ticket.message || '';
    row.dataset.messageTime = ticket.messageTime || formatClockTime(new Date());
    if (ticket.attachments && ticket.attachments.length) {
      row.dataset.attachments = JSON.stringify(ticket.attachments);
    }

    var catCol = document.createElement('span');
    catCol.className = 'row-cat-col';
    var catTag = document.createElement('span');
    catTag.className = 'tag ' + ticket.categoryTagClass;
    catTag.textContent = ticket.categoryLabel;
    catCol.appendChild(catTag);
    row.appendChild(catCol);

    var body = document.createElement('span');
    body.className = 'row-body row-body-lg';
    var titleEl = document.createElement('span');
    titleEl.className = 'row-title';
    titleEl.textContent = ticket.title;
    var snippetEl = document.createElement('span');
    snippetEl.className = 'row-snippet';
    snippetEl.textContent = ticket.snippet;
    body.appendChild(titleEl);
    body.appendChild(snippetEl);
    row.appendChild(body);

    if (variant === 'wide') {
      var authorCol = document.createElement('span');
      authorCol.className = 'row-author-col';
      var avatar = document.createElement('span');
      avatar.className = 'row-avatar';
      avatar.textContent = 'ВЫ';
      var name = document.createElement('span');
      name.className = 'row-author-name';
      name.textContent = 'Вы';
      authorCol.appendChild(avatar);
      authorCol.appendChild(name);
      row.appendChild(authorCol);
    }

    var statusCol = document.createElement('span');
    statusCol.className = 'row-status-col';
    var statusTag = document.createElement('span');
    statusTag.className = 'tag ' + ticket.statusTagClass;
    statusTag.textContent = ticket.statusLabel;
    statusCol.appendChild(statusTag);
    row.appendChild(statusCol);

    if (ticket.votable) {
      var likeBtn = document.createElement('button');
      likeBtn.type = 'button';
      likeBtn.className = 'like-btn';
      likeBtn.innerHTML = LIKE_ICON + '<span class="like-count">' + ticket.likeCount + '</span>';
      wireLikeButton(likeBtn);
      row.appendChild(likeBtn);
    }

    var timeEl = document.createElement('span');
    timeEl.className = variant === 'wide' ? 'row-time' : 'row-time row-time-lg';
    timeEl.textContent = ticket.time;
    row.appendChild(timeEl);

    return row;
  }

  // Newest ticket first: reverse so each insertBefore(firstChild) push
  // ends with the most recently created ticket on top.
  function renderStoredTickets(listEl, variant) {
    if (!listEl) return;
    loadStoredTickets().slice().reverse().forEach(function (ticket) {
      listEl.insertBefore(buildTicketRow(ticket, variant), listEl.firstChild);
    });
  }

  // --- Static wiring shared by every page ---

  function openTicketViaAllTickets(ticketId) {
    try {
      localStorage.setItem(OPEN_KEY, ticketId);
    } catch (e) {}
    window.location.href = 'all-tickets.html';
  }

  // The "recent tickets" preview on new-ticket.html isn't a messenger
  // itself - clicking a row there hands off to all-tickets.html and
  // opens that same ticket there (rows inside a messenger's own list are
  // wired by initMessenger() instead, not here).
  document.querySelectorAll('.list-row[data-ticket-id]').forEach(function (row) {
    if (row.closest('.messenger-list')) return;

    row.addEventListener('click', function (e) {
      if (isInsideLikeButton(e.target)) return;
      openTicketViaAllTickets(row.dataset.ticketId);
    });

    row.addEventListener('keydown', function (e) {
      if (isInsideLikeButton(e.target)) return;
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openTicketViaAllTickets(row.dataset.ticketId);
      }
    });
  });

  document.querySelectorAll('.like-btn').forEach(wireLikeButton);

  // The "static" demo conversations (new-ticket.html's greeting,
  // ticket-detail.html's two messages) are just data - a
  // .chat-messages[data-demo] holds a JSON array of {text, mine,
  // sender, minutesAgo, read} - rendered through the exact same
  // buildMessage() every real message goes through, so there's no
  // hand-written bubble markup anywhere to drift out of sync with it.
  document.querySelectorAll('.chat-messages[data-demo]').forEach(function (container) {
    var items;
    try {
      items = JSON.parse(container.dataset.demo);
    } catch (e) {
      items = [];
    }
    items.forEach(function (item) {
      var time = formatClockTime(new Date(Date.now() - (item.minutesAgo || 0) * 60000));
      container.appendChild(buildMessage(item.text, time, !!item.mine, null, item.sender || null, !!item.read));
    });
  });

  // Category pills (New ticket): single-select, radio-style.
  document.querySelectorAll('.pills .pill').forEach(function (pill) {
    pill.addEventListener('click', function () {
      pill.parentElement.querySelectorAll('.pill').forEach(function (p) {
        p.classList.remove('is-active');
      });
      pill.classList.add('is-active');
    });
  });

  // Compose bar: textarea grows line-by-line up to 3 lines (then a
  // scrollbar takes over) and attach/send stay pinned to the bottom
  // edge via .compose-bar's align-items: flex-end - see styles.css.
  // On new-ticket.html the same bar creates a ticket instead of replying
  // to one - see createTicketAndRedirect().
  document.querySelectorAll('.compose-bar').forEach(function (bar) {
    var textarea = bar.querySelector('.compose-input');
    var sendBtn = bar.querySelector('.compose-send');
    var attachBtn = bar.querySelector('.compose-attach');
    var fileInput = bar.querySelector('.compose-file-input');
    var panel = bar.closest('.chat-panel');
    var attachmentsBox = panel ? panel.querySelector('.compose-attachments') : null;
    var chatMessages = panel ? panel.querySelector('.chat-messages') : null;
    var subjectInput = panel ? panel.querySelector('.chat-header-input') : null;
    if (!textarea) return;

    var attachments = [];

    function updateSendState() {
      if (!sendBtn) return;
      var hasContent = textarea.value.trim().length > 0 || attachments.length > 0;
      var hasSubject = !subjectInput || subjectInput.value.trim().length > 0;
      sendBtn.disabled = !(hasContent && hasSubject);
    }

    function clearAttachments() {
      attachments.forEach(function (a) {
        if (a.url) URL.revokeObjectURL(a.url);
      });
      attachments = [];
      if (attachmentsBox) {
        attachmentsBox.innerHTML = '';
        attachmentsBox.classList.remove('has-items');
      }
    }

    // Exposed so a messenger can reset this bar (text + attachments)
    // when it switches to a different ticket - see initMessenger().
    bar.resetCompose = function () {
      textarea.value = '';
      autoGrowTextarea(textarea, 3);
      clearAttachments();
      updateSendState();
    };

    textarea.addEventListener('input', function () {
      autoGrowTextarea(textarea, 3);
      updateSendState();
    });

    if (subjectInput) {
      subjectInput.addEventListener('input', updateSendState);
    }

    if (attachBtn && fileInput) {
      attachBtn.addEventListener('click', function () {
        fileInput.click();
      });

      fileInput.addEventListener('change', function () {
        Array.prototype.forEach.call(fileInput.files, addAttachment);
        fileInput.value = '';
      });
    }

    function addAttachment(file) {
      if (!attachmentsBox) return;
      var isImage = file.type.indexOf('image/') === 0;
      // Every attachment gets an object URL, not just images, so a
      // non-image chip can also be opened - see the chip click handler.
      var url = URL.createObjectURL(file);
      var record = { file: file, url: url };

      var chip = document.createElement('div');
      chip.className = 'attachment-chip';

      if (isImage) {
        var img = document.createElement('img');
        img.className = 'attachment-thumb';
        img.src = url;
        img.alt = file.name;
        chip.appendChild(img);
      } else {
        var fileWrap = document.createElement('div');
        fileWrap.className = 'attachment-file';
        fileWrap.innerHTML = FILE_ICON;
        var nameEl = document.createElement('span');
        nameEl.className = 'attachment-filename';
        nameEl.textContent = file.name;
        nameEl.title = file.name;
        fileWrap.appendChild(nameEl);
        chip.appendChild(fileWrap);
      }

      chip.addEventListener('click', function (e) {
        if (e.target.closest('.attachment-remove')) return;
        window.open(url, '_blank', 'noopener');
      });

      var removeBtn = document.createElement('button');
      removeBtn.type = 'button';
      removeBtn.className = 'attachment-remove';
      removeBtn.setAttribute('aria-label', 'Удалить ' + file.name);
      removeBtn.innerHTML = REMOVE_ICON;
      removeBtn.addEventListener('click', function () {
        if (record.url) URL.revokeObjectURL(record.url);
        attachments = attachments.filter(function (a) { return a !== record; });
        chip.remove();
        attachmentsBox.classList.toggle('has-items', attachments.length > 0);
        updateSendState();
      });
      chip.appendChild(removeBtn);

      attachments.push(record);
      attachmentsBox.appendChild(chip);
      attachmentsBox.classList.add('has-items');
      updateSendState();
    }

    if (sendBtn) {
      sendBtn.addEventListener('click', function () {
        if (subjectInput) {
          createTicketAndRedirect(subjectInput, textarea, attachments);
          return;
        }

        var text = textarea.value.trim();
        if (!text && attachments.length === 0) return;
        if (chatMessages) {
          // Freshly sent - one tick, not read yet.
          chatMessages.appendChild(buildMessage(text, formatClockTime(new Date()), true, attachments, null, false));
          chatMessages.scrollTop = chatMessages.scrollHeight;
        }
        // The sent bubble now owns these attachments - clear the compose
        // row's chips without revoking their object URLs (bar.resetCompose
        // does that for a genuinely discarded draft, e.g. switching tickets).
        attachments = [];
        if (attachmentsBox) {
          attachmentsBox.innerHTML = '';
          attachmentsBox.classList.remove('has-items');
        }
        textarea.value = '';
        autoGrowTextarea(textarea, 3);
        updateSendState();
      });
    }

    autoGrowTextarea(textarea, 3);
    updateSendState();
  });

  // Comments box (My tickets / All tickets): its own textarea + send,
  // independent of the ticket chat - see initMessenger() for how a
  // comment is added and how the panel resets between tickets.
  document.querySelectorAll('.comments-compose').forEach(function (bar) {
    var input = bar.querySelector('.comments-input');
    var sendBtn = bar.querySelector('.comments-send');
    if (!input || !sendBtn) return;
    var list = bar.closest('.messenger-comments').querySelector('.comments-list');

    input.addEventListener('input', function () {
      autoGrowTextarea(input, 3);
      sendBtn.disabled = input.value.trim().length === 0;
    });

    sendBtn.addEventListener('click', function () {
      var text = input.value.trim();
      if (!text) return;
      var empty = list.querySelector('.comments-empty');
      if (empty) empty.remove();
      list.appendChild(buildComment('Вы', 'сейчас', text));
      list.scrollTop = list.scrollHeight;
      input.value = '';
      autoGrowTextarea(input, 3);
      sendBtn.disabled = true;
    });
  });

  // Filter bar (My tickets / All tickets): GitLab-style token filters on
  // top of free-text search. Focusing the search field offers a filter
  // type first (Category, then - unless this is My tickets, where every
  // row is already yours - User); picking a type then offers its values;
  // picking a value adds a removable chip and filters the list.
  function initFilterBar(root) {
    var bar = root.querySelector('.filter-bar');
    if (!bar) return;
    var input = bar.querySelector('.search-input');
    var dropdown = bar.querySelector('.filter-dropdown');
    var chipsBox = bar.querySelector('.filter-chips');
    var listEl = root.querySelector('.messenger-list .list');
    var emptyEl = root.querySelector('.messenger-list .list-empty');
    var allowAuthorFilter = bar.dataset.userFilter === 'true';
    if (!input || !dropdown || !chipsBox || !listEl) return;

    var active = { category: null, author: null };
    var state = 'root';

    function rows() {
      return Array.prototype.slice.call(listEl.querySelectorAll('.list-row'));
    }

    function authorOptions() {
      var seen = {};
      var names = [];
      rows().forEach(function (row) {
        var nameEl = row.querySelector('.row-author-name');
        var name = nameEl ? nameEl.textContent.trim() : 'Вы';
        if (!seen[name]) {
          seen[name] = true;
          names.push(name);
        }
      });
      return names;
    }

    function applyFilters() {
      var text = input.value.trim().toLowerCase();
      var visibleCount = 0;
      rows().forEach(function (row) {
        var title = row.querySelector('.row-title').textContent.toLowerCase();
        var snippet = row.querySelector('.row-snippet').textContent.toLowerCase();
        var matchesText = !text || title.indexOf(text) !== -1 || snippet.indexOf(text) !== -1;

        var catTag = row.querySelector('.row-cat-col .tag');
        var matchesCategory = !active.category || (catTag && catTag.textContent.trim() === active.category);

        var authorNameEl = row.querySelector('.row-author-name');
        var author = authorNameEl ? authorNameEl.textContent.trim() : 'Вы';
        var matchesAuthor = !active.author || author === active.author;

        var visible = matchesText && matchesCategory && matchesAuthor;
        row.classList.toggle('is-filtered-out', !visible);
        if (visible) visibleCount++;
      });
      if (emptyEl) emptyEl.hidden = visibleCount > 0;
    }

    function buildChip(key, value, onRemove) {
      var chip = document.createElement('span');
      chip.className = 'filter-chip';
      var keyEl = document.createElement('span');
      keyEl.className = 'filter-chip-key';
      keyEl.textContent = key + ':';
      chip.appendChild(keyEl);
      chip.appendChild(document.createTextNode(' ' + value));
      var removeBtn = document.createElement('button');
      removeBtn.type = 'button';
      removeBtn.className = 'filter-chip-remove';
      removeBtn.setAttribute('aria-label', 'Убрать фильтр «' + key + ': ' + value + '»');
      removeBtn.innerHTML = REMOVE_ICON;
      removeBtn.addEventListener('click', onRemove);
      chip.appendChild(removeBtn);
      return chip;
    }

    function renderChips() {
      chipsBox.innerHTML = '';
      var any = false;
      if (active.category) {
        any = true;
        chipsBox.appendChild(buildChip('Категория', active.category, function () {
          active.category = null;
          renderChips();
          applyFilters();
        }));
      }
      if (active.author) {
        any = true;
        chipsBox.appendChild(buildChip('Пользователь', active.author, function () {
          active.author = null;
          renderChips();
          applyFilters();
        }));
      }
      chipsBox.hidden = !any;
    }

    function buildOption(label, onClick, opts) {
      opts = opts || {};
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'filter-option' + (opts.back ? ' filter-option-back' : '');
      var labelWrap = document.createElement('span');
      labelWrap.className = 'filter-option-label';
      if (opts.leadingIcon) labelWrap.innerHTML = opts.leadingIcon;
      var text = document.createElement('span');
      text.textContent = label;
      labelWrap.appendChild(text);
      btn.appendChild(labelWrap);
      if (opts.trailingIcon) {
        var trailing = document.createElement('span');
        trailing.className = 'filter-option-trailing';
        trailing.innerHTML = opts.trailingIcon;
        btn.appendChild(trailing);
      }
      btn.addEventListener('click', onClick);
      return btn;
    }

    function renderDropdown() {
      dropdown.innerHTML = '';
      if (state === 'category') {
        dropdown.appendChild(buildOption('Назад', function () {
          state = 'root';
          renderDropdown();
          focusInputKeepingState();
        }, { back: true, leadingIcon: CHEVRON_LEFT_ICON }));
        CATEGORY_OPTIONS.forEach(function (cat) {
          dropdown.appendChild(buildOption(cat, function () {
            active.category = cat;
            renderChips();
            applyFilters();
            // Keep the field in input mode after picking a value - focus
            // (not closeDropdown()) both closes this submenu and reopens
            // fresh at the root list, ready for another filter or typing.
            input.focus();
          }));
        });
      } else if (state === 'author') {
        dropdown.appendChild(buildOption('Назад', function () {
          state = 'root';
          renderDropdown();
          focusInputKeepingState();
        }, { back: true, leadingIcon: CHEVRON_LEFT_ICON }));
        authorOptions().forEach(function (name) {
          dropdown.appendChild(buildOption(name, function () {
            active.author = name;
            renderChips();
            applyFilters();
            input.focus();
          }));
        });
      } else {
        var label = document.createElement('div');
        label.className = 'filter-dropdown-label';
        label.textContent = 'Фильтровать по';
        dropdown.appendChild(label);
        dropdown.appendChild(buildOption('Категория', function () {
          state = 'category';
          renderDropdown();
          focusInputKeepingState();
        }, { trailingIcon: CHEVRON_RIGHT_ICON }));
        if (allowAuthorFilter) {
          dropdown.appendChild(buildOption('Пользователь', function () {
            state = 'author';
            renderDropdown();
            focusInputKeepingState();
          }, { trailingIcon: CHEVRON_RIGHT_ICON }));
        }
      }
    }

    function openDropdown() {
      state = 'root';
      renderDropdown();
      dropdown.hidden = false;
    }

    function closeDropdown() {
      dropdown.hidden = true;
    }

    // Clicking an option inside the dropdown moves focus to that button,
    // same as any button click - refocusing the input afterwards is what
    // keeps the field visibly "in input mode" (focus ring, cursor) once
    // the choice is made, instead of focus just falling away. A plain
    // input.focus() re-fires the 'focus' handler below, which is exactly
    // what's wanted after picking a value (jump back to the root list,
    // ready for another filter) but would wrongly undo an in-progress
    // Category/User/Back navigation - suppressFocusOpen guards that case.
    var suppressFocusOpen = false;
    function focusInputKeepingState() {
      suppressFocusOpen = true;
      input.focus();
      suppressFocusOpen = false;
    }

    input.addEventListener('focus', function () {
      if (suppressFocusOpen) return;
      openDropdown();
    });
    input.addEventListener('input', function () {
      applyFilters();
      if (dropdown.hidden) openDropdown();
    });
    document.addEventListener('click', function (e) {
      // Not bar.contains(e.target): picking an option rebuilds the
      // dropdown's innerHTML synchronously, which detaches the clicked
      // button before this listener runs - contains() would then see a
      // detached node and wrongly call the click "outside". composedPath()
      // captures the path at dispatch time, before any of that mutation.
      var path = typeof e.composedPath === 'function' ? e.composedPath() : [e.target];
      if (path.indexOf(bar) === -1) closeDropdown();
    });

    renderChips();
    applyFilters();
  }

  // Messenger (My tickets / All tickets): opening a row turns the list
  // into a rail beside a full-height chat pane instead of navigating to
  // a separate page. The comments pane is always shown (own tickets get
  // an empty state); the ticket's own reply box only shows on your own
  // tickets - someone else's ticket is read-only chat + your comment.
  function initMessenger(root) {
    var listEl = root.querySelector('.messenger-list .list');
    if (listEl) {
      renderStoredTickets(listEl, listEl.dataset.rowVariant || 'lg');
    }
    initFilterBar(root);

    var rows = Array.prototype.slice.call(root.querySelectorAll('.messenger-list .list-row'));
    var chatPane = root.querySelector('.messenger-chat');
    var commentsPane = root.querySelector('.messenger-comments');
    var chatHeaderEl = root.querySelector('.messenger-chat .chat-header');
    var chatHeaderTags = root.querySelector('.chat-header-tags');
    var chatHeaderTitle = root.querySelector('.chat-header-title');
    var chatHeaderAuthor = root.querySelector('.chat-header-author');
    var chatMessages = chatPane ? chatPane.querySelector('.chat-messages') : null;
    var chatBack = root.querySelector('.chat-back');
    var sidebar = document.querySelector('.sidebar');
    var activeNavLink = document.querySelector('.nav-item.active');
    var supportsComments = !!commentsPane;

    // The vote control physically moves from the list row into the open
    // chat's header (it's no longer reachable in the row once the list
    // is a narrow rail) and moves back on close/switch - see relocateVote().
    var activeVote = null;

    function restoreVote() {
      if (!activeVote) return;
      var before = activeVote.before;
      if (before && before.parentNode === activeVote.row) {
        activeVote.row.insertBefore(activeVote.btn, before);
      } else {
        activeVote.row.appendChild(activeVote.btn);
      }
      activeVote = null;
    }

    function relocateVote(row) {
      restoreVote();
      var btn = row.querySelector('.like-btn');
      if (!btn || !chatHeaderEl) return;
      activeVote = { btn: btn, row: row, before: btn.nextElementSibling };
      chatHeaderEl.appendChild(btn);
    }

    function resetComments(showSeed) {
      if (!commentsPane) return;
      var list = commentsPane.querySelector('.comments-list');
      list.innerHTML = '';
      if (showSeed) {
        list.appendChild(buildComment(COMMENT_SEED.author, COMMENT_SEED.time, COMMENT_SEED.text));
      } else {
        var empty = document.createElement('p');
        empty.className = 'comments-empty';
        empty.textContent = 'Комментариев пока нет.';
        list.appendChild(empty);
      }
      var input = commentsPane.querySelector('.comments-input');
      var sendBtn = commentsPane.querySelector('.comments-send');
      if (input) {
        input.value = '';
        autoGrowTextarea(input, 3);
      }
      if (sendBtn) sendBtn.disabled = true;
    }

    function openRow(row) {
      rows.forEach(function (r) { r.classList.toggle('is-active', r === row); });

      var catTag = row.querySelector('.row-cat-col .tag');
      var statusTag = row.querySelector('.row-status-col .tag');
      var title = row.querySelector('.row-title').textContent;
      var snippet = row.querySelector('.row-snippet').textContent;
      var authorNameEl = row.querySelector('.row-author-name');
      var authorAvatarEl = row.querySelector('.row-avatar');
      var isMine = !authorNameEl || authorNameEl.textContent.trim() === 'Вы';

      if (chatHeaderTags) {
        chatHeaderTags.innerHTML = '';
        if (catTag) chatHeaderTags.appendChild(catTag.cloneNode(true));
        if (statusTag) chatHeaderTags.appendChild(statusTag.cloneNode(true));
      }
      if (chatHeaderTitle) chatHeaderTitle.textContent = title;

      // Always show who opened the ticket, own tickets included ("Вы").
      if (chatHeaderAuthor) {
        chatHeaderAuthor.hidden = false;
        chatHeaderAuthor.querySelector('.row-avatar').textContent =
          authorAvatarEl ? authorAvatarEl.textContent : 'ВЫ';
        chatHeaderAuthor.querySelector('.row-author-name').textContent =
          authorNameEl ? authorNameEl.textContent : 'Вы';
      }

      relocateVote(row);

      if (chatMessages) {
        chatMessages.innerHTML = '';
        // A ticket created via new-ticket.html carries its real first
        // message (and any attachments) on the row itself - everything
        // else still falls back to the title/snippet convention.
        if ('message' in row.dataset) {
          var storedAttachments = [];
          if (row.dataset.attachments) {
            try {
              storedAttachments = JSON.parse(row.dataset.attachments);
            } catch (e) {
              storedAttachments = [];
            }
          }
          var records = storedAttachments.map(function (a) {
            return { file: { name: a.name, type: a.isImage ? 'image/*' : 'application/octet-stream' }, url: a.dataUrl };
          });
          var bubbleTime = row.dataset.messageTime || formatClockTime(new Date());
          // No reply yet on a just-created ticket - one tick, not read yet.
          chatMessages.appendChild(buildMessage(row.dataset.message, bubbleTime, true, records, null, false));
        } else {
          // Chronological: the report came first, any reply is more recent.
          // A reply existing at all implies the report was read - two ticks.
          var reporterName = isMine ? null : (authorNameEl ? authorNameEl.textContent.trim() : null);
          var hasReply = !!(snippet && snippet !== title);
          chatMessages.appendChild(buildMessage(title, minutesAgoClockTime(20), isMine, null, reporterName, hasReply));
          if (hasReply) {
            chatMessages.appendChild(buildMessage(snippet, minutesAgoClockTime(5), false, null, 'Поддержка'));
          }
        }
        chatMessages.scrollTop = chatMessages.scrollHeight;
      }

      var composeBar = chatPane ? chatPane.querySelector('.compose-bar') : null;
      var composeAttachments = chatPane ? chatPane.querySelector('.compose-attachments') : null;
      var readonlyHint = chatPane ? chatPane.querySelector('.chat-readonly-hint') : null;
      if (composeBar && composeBar.resetCompose) composeBar.resetCompose();
      if (composeBar) composeBar.hidden = !isMine;
      if (composeAttachments) composeAttachments.hidden = !isMine;
      if (readonlyHint) readonlyHint.hidden = isMine;

      root.classList.add('is-open');
      if (supportsComments) resetComments(!isMine);
      if (sidebar) sidebar.classList.add('is-collapsed');

      var composeInput = composeBar ? composeBar.querySelector('.compose-input') : null;
      if (isMine && composeInput) {
        window.requestAnimationFrame(function () {
          composeInput.focus();
        });
      }
    }

    function closeMessenger() {
      restoreVote();
      root.classList.remove('is-open');
      rows.forEach(function (r) { r.classList.remove('is-active'); });
      if (sidebar) sidebar.classList.remove('is-collapsed');
    }

    rows.forEach(function (row) {
      row.addEventListener('click', function (e) {
        if (isInsideLikeButton(e.target)) return;
        openRow(row);
      });
      row.addEventListener('keydown', function (e) {
        if (isInsideLikeButton(e.target)) return;
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openRow(row);
        }
      });
    });

    if (chatBack) {
      chatBack.addEventListener('click', closeMessenger);
    }

    // Clicking the section's own sidebar link while a chat is open should
    // collapse it smoothly, same as the back button - not a hard reload.
    if (activeNavLink) {
      activeNavLink.addEventListener('click', function (e) {
        if (root.classList.contains('is-open')) {
          e.preventDefault();
          closeMessenger();
        }
      });
    }

    // A ticket just created on new-ticket.html asks to be opened right
    // away - consume the flag so later visits don't keep reopening it.
    try {
      var pendingId = localStorage.getItem(OPEN_KEY);
      if (pendingId) {
        localStorage.removeItem(OPEN_KEY);
        var targetRow = rows.filter(function (r) { return r.dataset.ticketId === pendingId; })[0];
        if (targetRow) openRow(targetRow);
      }
    } catch (e) {}
  }

  var messengerRoot = document.querySelector('[data-messenger]');
  if (messengerRoot) initMessenger(messengerRoot);
})();
