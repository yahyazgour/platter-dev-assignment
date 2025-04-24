class PlatterFeaturedCollection extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.initializeElements();
    this.setupEventListeners();
  }

  initializeElements() {
    this.scrollContainer = this.querySelector("[data-scroll-container]");
    this.scrollThumb = this.querySelector("[data-scroll-bar-thumb]");
    this.scrollBar = this.querySelector("[data-scroll-bar]");
    this.showMoreButton = this.querySelector("[data-show-more-button]");
  }

  setupEventListeners() {
    this.setupShowMoreButton();
    this.setupScrolling();
    window.addEventListener("resize", this.handleResize.bind(this));
  }

  setupScrolling() {
    if (window.innerWidth >= 768) {
      this.scrollContainer.style.overflowX = 'auto';
      this.scrollContainer.style.overflowY = 'visible';
      this.scrollContainer.style.webkitOverflowScrolling = 'touch';
    }

    this.setupScrollbarThumb();
  }

  setupWheelScroll() {
  }

  hasScrollbar() {
    return this.scrollThumb && this.scrollBar;
  }

  setupScrollbarThumb() {
    this.updateThumbWidth();
    this.scrollContainer.addEventListener("scroll", () => this.updateThumbPosition());
    this.updateThumbPosition();
    this.setupThumbDrag();
  }

  setupThumbDrag() {
    let isDragging = false;
    let startX = 0;
    let startScrollLeft = 0;
    const thumbSpan = this.scrollThumb.querySelector('[data-scroll-thumb-span]');

    const startThumbDrag = (e) => {
      isDragging = true;
      startX = e.clientX || (e.touches && e.touches[0].clientX);
      startScrollLeft = this.scrollContainer.scrollLeft;
      this.updateThumbDragState(true, thumbSpan);
    };

    const moveThumbDrag = (e) => {
      if (!isDragging) return;
      e.preventDefault();
      
      const clientX = e.clientX || (e.touches && e.touches[0].clientX);
      const dragDistance = clientX - startX;
      const scrollAmount = this.calculateScrollAmount(dragDistance);
      this.scrollContainer.scrollLeft = startScrollLeft + scrollAmount;
    };

    const endThumbDrag = () => {
      if (!isDragging) return;
      isDragging = false;
      this.updateThumbDragState(false, thumbSpan);
    };

    this.setupThumbDragEventListeners(startThumbDrag, moveThumbDrag, endThumbDrag);
  }

  setupThumbDragEventListeners(startDrag, moveDrag, endDrag) {
    this.scrollThumb.addEventListener("mousedown", startDrag);
    document.addEventListener("mousemove", moveDrag);
    document.addEventListener("mouseup", endDrag);
    document.addEventListener("mouseleave", endDrag);

    this.scrollThumb.addEventListener("touchstart", startDrag, { passive: false });
    document.addEventListener("touchmove", moveDrag, { passive: false });
    document.addEventListener("touchend", endDrag);
  }

  updateThumbDragState(isDragging, thumbSpan) {
    this.scrollThumb.classList.toggle("cursor-grabbing", isDragging);
    this.scrollThumb.classList.toggle("cursor-grab", !isDragging);
    if (thumbSpan) {
      thumbSpan.classList.toggle('dragging-thumb', isDragging);
    }
    document.body.style.userSelect = isDragging ? "none" : "";
  }

  calculateScrollAmount(dragDistance) {
    const barWidth = this.scrollBar.offsetWidth;
    const thumbWidth = this.scrollThumb.offsetWidth;
    const scrollableWidth = this.scrollContainer.scrollWidth - this.scrollContainer.clientWidth;
    const scrollRatio = scrollableWidth / (barWidth - thumbWidth);
    return dragDistance * scrollRatio;
  }

  updateScrollbarIfNeeded() {
    this.updateThumbPosition();
  }

  updateThumbWidth() {
    const { clientWidth, scrollWidth } = this.scrollContainer;

    if (scrollWidth <= clientWidth) {
      this.scrollThumb.style.width = "100%";
      return;
    }

    const visibleRatio = clientWidth / scrollWidth;
    const thumbWidthPercentage = visibleRatio * 100;
    this.scrollThumb.style.width = `${thumbWidthPercentage}%`;

    const minThumbWidth = 30;
    const calculatedWidth = (thumbWidthPercentage / 100) * this.scrollBar.offsetWidth;

    if (calculatedWidth < minThumbWidth) {
      this.scrollThumb.style.width = `${minThumbWidth}px`;
    }
  }

  updateThumbPosition() {
    const scrollPercentage = this.getScrollPercentage();
    const thumbWidth = this.scrollThumb.offsetWidth;
    const barWidth = this.scrollBar.offsetWidth;
    const maxTranslate = barWidth - thumbWidth;
    const translateX = scrollPercentage * maxTranslate;

    this.scrollThumb.style.transform = `translateY(-50%) translateX(${translateX}px)`;
  }

  getScrollPercentage() {
    const { scrollLeft, scrollWidth, clientWidth } = this.scrollContainer;
    const scrollableDistance = scrollWidth - clientWidth;

    return scrollableDistance <= 0 ? 0 : scrollLeft / scrollableDistance;
  }

  setupShowMoreButton() {
    this.showMoreButton.addEventListener("click", () => {
      this.handleShowMore();
    });
  }

  handleShowMore() {
    const hiddenProducts = this.querySelectorAll(".mobile-product.max-md\\:hidden");

    hiddenProducts.forEach((product, index) => {
      setTimeout(() => this.animateProductReveal(product), index * 100);
    });

    setTimeout(() => this.hideShowMoreButton(), 300);
  }

  animateProductReveal(product) {
    product.classList.remove("max-md:hidden");
    product.classList.add("opacity-0", "translate-y-2");
    void product.offsetWidth;
    product.classList.add("transition-all", "duration-500", "ease-in-out");
    product.classList.remove("opacity-0", "translate-y-2");
    product.classList.add("opacity-100", "translate-y-0");
  }

  hideShowMoreButton() {
    const buttonContainer = this.showMoreButton.parentElement;
    buttonContainer.classList.add(
      "transition-opacity",
      "duration-300",
      "ease-in-out",
      "opacity-0"
    );

    setTimeout(() => {
      buttonContainer.classList.add("hidden");
    }, 300);
  }

  handleResize() {
    this.updateThumbWidth();
    this.updateThumbPosition();
  }

  disconnectedCallback() {
    window.removeEventListener("resize", this.handleResize);
  }
}

if (!customElements.get("platter-featured-collection")) {
  customElements.define("platter-featured-collection", PlatterFeaturedCollection);
}
