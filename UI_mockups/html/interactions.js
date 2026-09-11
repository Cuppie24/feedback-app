// Minimal interactivity for the static mockup screens: clicking a list
// row opens its ticket, clicking the vote button votes instead - it must
// not also trigger the row's navigation.
(function () {
  function isInsideLikeButton(el) {
    return !!(el && el.closest && el.closest('.like-btn'));
  }

  document.querySelectorAll('.list-row[data-href]').forEach(function (row) {
    var href = row.dataset.href;

    row.addEventListener('click', function (e) {
      if (isInsideLikeButton(e.target)) return;
      window.location.href = href;
    });

    row.addEventListener('keydown', function (e) {
      if (isInsideLikeButton(e.target)) return;
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        window.location.href = href;
      }
    });
  });

  document.querySelectorAll('.like-btn').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      var countEl = btn.querySelector('.like-count');
      var count = parseInt(countEl.textContent, 10);
      var liked = btn.classList.toggle('liked');
      countEl.textContent = String(liked ? count + 1 : count - 1);
    });
  });
})();
