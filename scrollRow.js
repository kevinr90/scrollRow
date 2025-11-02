(function() {
  // Find first visible .scrollRow_col
  function getFirstVisibleCol(containerInnerEl) {
    const cols = containerInnerEl.querySelectorAll('.scrollRow_col');
    for (let i = 0; i < cols.length; i++) {
      const el = cols[i];
      if (el.offsetParent !== null) { // visible (not display:none or inside hidden parent)
        return el;
      }
    }
    return null;
  }
  // Scroll function
function scrollSnapDoScroll(e, forcedDirection = null) {
  var clickEl = e.target;
  var controllerEl = clickEl.closest('.scrollRow_controller');
  var direction =
    forcedDirection ||
    (controllerEl?.dataset.scrollrowControllerDirection === 'left'
      ? 'left'
      : 'right');

  var containerEl = controllerEl
    ? controllerEl.closest('.scrollRow')
    : clickEl.closest('.scrollRow');
  var containerInnerEl = containerEl.querySelector('.scrollRow_inner');

  // Sort items by visual order (for CSS order safety)
  var items = Array.from(containerInnerEl.children).sort(
    (a, b) => a.offsetLeft - b.offsetLeft
  );

  var style = getComputedStyle(containerInnerEl);
  var paddingLeft = parseFloat(style.paddingLeft) || 0;
  var paddingRight = parseFloat(style.paddingRight) || 0;

  var visibleStart = containerInnerEl.scrollLeft + paddingLeft;
  var visibleEnd =
    containerInnerEl.scrollLeft + containerInnerEl.clientWidth - paddingRight;

  let itemEl = null;

  if (direction === 'right') {
    // find first item inside or after visible frame
    for (let i = 0; i < items.length; i++) {
      const itemStart = items[i].offsetLeft;
      const itemEnd = itemStart + items[i].offsetWidth;
      if (itemEnd > visibleStart) {
        itemEl = items[i];
        break;
      }
    }
  } else {
    // find last item *before* the visible start
    for (let i = items.length - 1; i >= 0; i--) {
      const itemStart = items[i].offsetLeft;
      const itemEnd = itemStart + items[i].offsetWidth;
      if (itemStart < visibleStart - 1) {
        itemEl = items[i];
        break;
      }
    }
  }

  if (!itemEl) {
    console.warn('⚠️ No item found for direction:', direction);
    return;
  }

  const width = itemEl.offsetWidth;

  // 🔍 Debug output
  console.group('📜 Scroll Debug');
  console.log('Direction:', direction);
  console.log('Item offsetLeft:', itemEl.offsetLeft);
  console.log('Item width:', width);
  console.log('Item element:', itemEl);
  console.groupEnd();

  // Do scroll
  if (direction === 'right') {
    containerInnerEl.scrollLeft += width;
  } else {
    containerInnerEl.scrollLeft -= width;
  }
  
}
  
  // Scroll buttons update
  function scrollSnapUpdateButtonState(scrollRowInnerEl) {
    const containerEl = scrollRowInnerEl.closest('.scrollRow');
    const controllerLeft = containerEl.querySelector('.scrollRow_controller[data-scrollrow-controller-direction="left"]');
    const controllerRight = containerEl.querySelector('.scrollRow_controller[data-scrollrow-controller-direction="right"]');
    const scrollLeft = scrollRowInnerEl.scrollLeft;
    const maxScrollLeft = scrollRowInnerEl.scrollWidth - scrollRowInnerEl.clientWidth;
    if (controllerLeft) controllerLeft.dataset.scrollrowControllerState = scrollLeft <= 0 ? 'disabled' : 'enabled';
    if (controllerRight) controllerRight.dataset.scrollrowControllerState = scrollLeft >= maxScrollLeft - 1 ? 'disabled' : 'enabled';
  }
  
  // Event listeners
  requestAnimationFrame(() => {
    document.querySelectorAll('.scrollRow .scrollRow_controller').forEach(el => {
      if (!el.dataset.listenerAdded) { // <-- prevent duplicate listeners
        el.addEventListener('click', scrollSnapDoScroll, true);
        el.dataset.listenerAdded = 'true';
      }
    });
  
    document.querySelectorAll('.scrollRow_inner').forEach(scrollRowInnerEl => {
      if (!scrollRowInnerEl.dataset.listenerAdded) { // <-- same for scroll listener
        let scrollTimeout;
        const handleScrollEnd = () => {
          clearTimeout(scrollTimeout);
          scrollTimeout = setTimeout(() => {
            scrollSnapUpdateButtonState(scrollRowInnerEl);
          }, 100);
        };
        scrollSnapUpdateButtonState(scrollRowInnerEl);
        scrollRowInnerEl.addEventListener('scroll', handleScrollEnd);
        window.addEventListener('resize', handleScrollEnd);
        scrollRowInnerEl.dataset.listenerAdded = 'true';
      }
    });
  });
})();

window.scrollRow = {}
window.scrollRow.refreshOne = function(targetEl) {
  const containerEl = targetEl.closest('.scrollRow');
  const scrollRowInnerEl = containerEl.querySelector('.scrollRow_inner')
  const controllerLeft = containerEl.querySelector('.scrollRow_controller[data-scrollrow-controller-direction="left"]');
  const controllerRight = containerEl.querySelector('.scrollRow_controller[data-scrollrow-controller-direction="right"]');
  const scrollLeft = scrollRowInnerEl.scrollLeft;
  const maxScrollLeft = scrollRowInnerEl.scrollWidth - scrollRowInnerEl.clientWidth;
  if (controllerLeft) controllerLeft.dataset.scrollrowControllerState = scrollLeft <= 0 ? 'disabled' : 'enabled';
  if (controllerRight) controllerRight.dataset.scrollrowControllerState = scrollLeft >= maxScrollLeft - 1 ? 'disabled' : 'enabled';
  return true;
}
window.scrollRow.refreshAll = function() {
  var els = document.querySelectorAll('.scrollRow')
  els.forEach(function(el) {
    window.scrollRow.refreshOne(el)
  })  
}
