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

    // Get all items in DOM order
    const items = Array.from(containerInnerEl.querySelectorAll('.scrollRow_col'));
    if (!items.length) return;

    // Find current active item (default to first if none)
    let currentIndex = items.findIndex(i => i.classList.contains('active'));
    if (currentIndex === -1) {
      currentIndex = 0;
      items[0].classList.add('active');
    }

    // Calculate next index
    let nextIndex = direction === 'right' ? currentIndex + 1 : currentIndex - 1;

    // Clamp to valid range
    if (nextIndex < 0 || nextIndex >= items.length) {
      console.warn('⚠️ No more items in direction:', direction);
      return;
    }

    // Update active class
    items[currentIndex].classList.remove('active');
    items[nextIndex].classList.add('active');

    // Scroll to next item
    const nextItem = items[nextIndex];
    containerInnerEl.scrollTo({
      left: nextItem.offsetLeft,
      behavior: 'smooth'
    });

    // Debug
    console.group('📜 Scroll Debug');
    console.log('Direction:', direction);
    console.log('From:', currentIndex, '→ To:', nextIndex);
    console.log('Active item:', nextItem);
    console.groupEnd();
  }

  // Update button state
  function scrollSnapUpdateButtonState(scrollRowInnerEl) {
    const containerEl = scrollRowInnerEl.closest('.scrollRow');
    const items = Array.from(scrollRowInnerEl.querySelectorAll('.scrollRow_col'));
    const controllerLeft = containerEl.querySelector('.scrollRow_controller[data-scrollrow-controller-direction="left"]');
    const controllerRight = containerEl.querySelector('.scrollRow_controller[data-scrollrow-controller-direction="right"]');

    const activeIndex = items.findIndex(i => i.classList.contains('active'));
    const atStart = activeIndex <= 0;
    const atEnd = activeIndex >= items.length - 1;

    if (controllerLeft)
      controllerLeft.dataset.scrollrowControllerState = atStart ? 'disabled' : 'enabled';
    if (controllerRight)
      controllerRight.dataset.scrollrowControllerState = atEnd ? 'disabled' : 'enabled';
  }

  // Event listeners
  requestAnimationFrame(() => {
    document.querySelectorAll('.scrollRow .scrollRow_controller').forEach(el => {
      if (!el.dataset.listenerAdded) {
        el.addEventListener('click', scrollSnapDoScroll, true);
        el.dataset.listenerAdded = 'true';
      }
    });

    document.querySelectorAll('.scrollRow_inner').forEach(scrollRowInnerEl => {
      if (!scrollRowInnerEl.dataset.listenerAdded) {
        // Mark first visible as active initially
        const first = scrollRowInnerEl.querySelector('.scrollRow_col');
        if (first) first.classList.add('active');

        scrollSnapUpdateButtonState(scrollRowInnerEl);
        scrollRowInnerEl.dataset.listenerAdded = 'true';
      }
    });
  });

  // Manual refresh functions
  window.scrollRow = {}
  window.scrollRow.refreshOne = function(targetEl) {
    const scrollRowInnerEl = targetEl.querySelector('.scrollRow_inner');
    if (scrollRowInnerEl) scrollSnapUpdateButtonState(scrollRowInnerEl);
    return true;
  }
  window.scrollRow.refreshAll = function() {
    document.querySelectorAll('.scrollRow_inner').forEach(scrollSnapUpdateButtonState);
  }

})();
