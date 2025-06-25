(function() {
  var scrollSnapDoScroll = function(e) {
    var clickEl = e.target;
    var controllerEl = clickEl.closest('.scrollRow_controller')
    var direction = 'right'
    if (controllerEl.dataset.scrollrowControllerDirection == 'left') { direction = 'left' }
    var containerEl = controllerEl.closest('.scrollRow')
    var containerInnerEl = containerEl.querySelector('.scrollRow_inner')
    var itemEl = containerInnerEl.querySelector('.scrollRow_col')
    
    // Getwidth
    var width = 300
    if(itemEl) {
        width = itemEl.offsetWidth
    }
    
    // Change
    if(direction == 'right') {
        containerInnerEl.scrollLeft += width;
    }
    else if(direction == 'left') {
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
        el.addEventListener('click', scrollSnapDoScroll, true);
    });
    
    document.querySelectorAll('.scrollRow_inner').forEach(scrollRowInnerEl => {
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
