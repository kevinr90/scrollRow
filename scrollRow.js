(function() {

  function scrollSnapDoScroll(e, forcedDirection = null) {
    const clickEl = e.target;
    const controllerEl = clickEl.closest('.scrollRow_controller');
    const direction =
      forcedDirection ||
      (controllerEl?.dataset.scrollrowControllerDirection === 'left'
        ? 'left'
        : 'right');

    const containerEl = controllerEl
      ? controllerEl.closest('.scrollRow')
      : clickEl.closest('.scrollRow');
    const containerInnerEl = containerEl.querySelector('.scrollRow_inner');

    // Get visible items in DOM order
    const items = Array.from(
      containerInnerEl.querySelectorAll('.scrollRow_col')
    ).filter(i => i.offsetParent !== null);

    if (!items.length) return;

    // Find current active item (default to first visible)
    let currentIndex = items.findIndex(i => i.classList.contains('active'));
    if (currentIndex === -1) {
      currentIndex = 0;
      items[0].classList.add('active');
    }

    // Determine next index
    let nextIndex = direction === 'right' ? currentIndex + 1 : currentIndex - 1;

    // Clamp to valid range
    if (nextIndex < 0 || nextIndex >= items.length) {
      console.warn('⚠️ No more visible items in direction:', direction);
      return;
    }

    // Update active state
    items[currentIndex].classList.remove('active');
    items[nextIndex].classList.add('active');

    // Scroll smoothly to next item
    const nextItem = items[nextIndex];
    containerInnerEl.scrollTo({
      left: nextItem.offsetLeft,
      behavior: 'smooth'
    });

    // Debug
    console.group('📜 Scroll Debug');
    console.log('Direction:', direction);
    console.log('From index:', currentIndex, '→ To index:', nextIndex);
    console.log('Active item:', nextItem);
    console.groupEnd();

    // Update button state after scroll
    scrollSnapUpdateButtonState(containerInnerEl);
  }

  function scrollSnapUpdateButtonState(scrollRowInnerEl) {
  const containerEl = scrollRowInnerEl.closest('.scrollRow');
  if (!containerEl) return; // early exit for safety

  const controllerLeft = containerEl.querySelector('[data-scrollrow-controller-direction="left"]');
  const controllerRight = containerEl.querySelector('[data-scrollrow-controller-direction="right"]');

  const scrollLeft = scrollRowInnerEl.scrollLeft;
  const maxScrollLeft = scrollRowInnerEl.scrollWidth - scrollRowInnerEl.clientWidth;

  const isAtStart = scrollLeft <= 0;
  const isAtEnd = scrollLeft >= maxScrollLeft - 1;

  if (controllerLeft) controllerLeft.dataset.scrollrowControllerState = isAtStart ? 'disabled' : 'enabled';
  if (controllerRight) controllerRight.dataset.scrollrowControllerState = isAtEnd ? 'disabled' : 'enabled';
}


  // Initialize listeners and default active items
  requestAnimationFrame(() => {
    document.querySelectorAll('.scrollRow .scrollRow_controller').forEach(el => {
      if (!el.dataset.listenerAdded) {
        el.addEventListener('click', scrollSnapDoScroll, true);
        el.dataset.listenerAdded = 'true';
      }
    });

    document.querySelectorAll('.scrollRow_inner').forEach(scrollRowInnerEl => {
      if (!scrollRowInnerEl.dataset.listenerAdded) {
        // Mark first visible item as active
        const firstVisible = Array.from(
          scrollRowInnerEl.querySelectorAll('.scrollRow_col')
        ).find(i => i.offsetParent !== null);
        if (firstVisible) firstVisible.classList.add('active');

        scrollSnapUpdateButtonState(scrollRowInnerEl);
        scrollRowInnerEl.dataset.listenerAdded = 'true';
      }
    });
  });

  // Manual refresh utilities
  window.scrollRow = {};
  window.scrollRow.refreshOne = function(targetEl) {
    const scrollRowInnerEl = targetEl.querySelector('.scrollRow_inner');
    if (scrollRowInnerEl) scrollSnapUpdateButtonState(scrollRowInnerEl);
    return true;
  };
  window.scrollRow.refreshAll = function() {
    document
      .querySelectorAll('.scrollRow_inner')
      .forEach(scrollSnapUpdateButtonState);
  };

})();
