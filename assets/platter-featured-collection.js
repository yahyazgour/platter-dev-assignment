class PlatterFeaturedCollection extends HTMLElement {
  constructor() {
    super();
    this.init();
  }

  init() {
    this.scrollContainer = this.querySelector("[data-scroll-container]");
    this.scrollThumb = this.querySelector("[data-scroll-bar-thumb]");
    this.scrollBar = this.querySelector("[data-scroll-bar]");
    this.showMoreButton = this.querySelector("[data-show-more-button]");

    if (this.showMoreButton) {
      this.setupShowMoreButton();
    }

    if (this.scrollContainer) {
      this.setupWheelScroll();

      if (this.scrollThumb && this.scrollBar) {
        this.setupScrollSync();
      }

      this.setupContainerDrag();
    }
  }

  setupWheelScroll() {
    this.scrollContainer.addEventListener(
      "wheel",
      (e) => {
        if (window.innerWidth >= 768) {
          e.preventDefault();

          const scrollAmount = e.shiftKey ? e.deltaY : e.deltaX;

          this.scrollContainer.scrollLeft += scrollAmount;

          if (this.scrollThumb && this.scrollBar) {
            this.updateThumbPosition();
          }
        }
      },
      { passive: false }
    );
  }

  setupShowMoreButton() {
    this.showMoreButton.addEventListener("click", () => {
      const hiddenProducts = this.querySelectorAll(".mobile-product.max-md\\:hidden");

      hiddenProducts.forEach((product, index) => {
        setTimeout(() => {
          product.classList.remove("max-md:hidden");
          product.classList.add("opacity-0", "translate-y-2");

          void product.offsetWidth;

          product.classList.add("transition-all", "duration-500", "ease-in-out");
          product.classList.remove("opacity-0", "translate-y-2");
          product.classList.add("opacity-100", "translate-y-0");
        }, index * 100);
      });

      setTimeout(() => {
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
      }, 300);
    });
  }

  setupScrollSync() {
    this.updateThumbWidth();

    this.scrollContainer.addEventListener("scroll", () => {
      this.updateThumbPosition();
    });

    this.updateThumbPosition();

    this.setupThumbDrag();
  }

  setupContainerDrag() {
    let isDragging = false;
    let startX = 0;
    let scrollLeft = 0;
    const dragCoefficient = 2.0;

    const preventDefaultOnElements = (e) => {
      if (isDragging) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    const links = this.scrollContainer.querySelectorAll("a");
    const images = this.scrollContainer.querySelectorAll("img");

    links.forEach((link) => {
      link.addEventListener("mousedown", (e) => {
        startX = e.pageX;
        scrollLeft = this.scrollContainer.scrollLeft;
      });

      link.addEventListener("dragstart", preventDefaultOnElements);
      link.addEventListener("click", (e) => {
        if (isDragging) {
          e.preventDefault();
          e.stopPropagation();
        }
      });
    });

    images.forEach((img) => {
      img.addEventListener("dragstart", preventDefaultOnElements);
      img.addEventListener("mousedown", (e) => e.preventDefault());
    });

    this.scrollContainer.addEventListener("mousedown", (e) => {
      isDragging = false;
      startX = e.pageX;
      scrollLeft = this.scrollContainer.scrollLeft;
      this.scrollContainer.style.cursor = "grabbing";
      e.preventDefault();
    });

    this.scrollContainer.addEventListener("mousemove", (e) => {
      if (e.buttons !== 1) return;

      const deltaX = e.pageX - startX;

      if (!isDragging && Math.abs(deltaX) > 5) {
        isDragging = true;
      }

      if (isDragging) {
        this.scrollContainer.scrollLeft = scrollLeft - deltaX * dragCoefficient;
        e.preventDefault();
      }
    });

    const endDrag = () => {
      if (isDragging) {
        setTimeout(() => {
          isDragging = false;
        }, 100);
      }
      this.scrollContainer.style.cursor = "";
    };

    this.scrollContainer.addEventListener("mouseup", endDrag);
    this.scrollContainer.addEventListener("mouseleave", endDrag);

    document.addEventListener(
      "click",
      (e) => {
        if (isDragging && this.scrollContainer.contains(e.target)) {
          e.preventDefault();
          e.stopPropagation();
        }
      },
      true
    );
  }

  updateThumbWidth() {
    if (!this.scrollContainer || !this.scrollThumb || !this.scrollBar) return;

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
    if (!this.scrollContainer || !this.scrollThumb || !this.scrollBar) return;

    const scrollPercentage = this.getScrollPercentage();
    const thumbWidth = this.scrollThumb.offsetWidth;
    const barWidth = this.scrollBar.offsetWidth;
    const maxTranslate = barWidth - thumbWidth;

    const translateX = scrollPercentage * maxTranslate;

    this.scrollThumb.style.transform = `translateY(-50%) translateX(${translateX}px)`;
  }

  getScrollPercentage() {
    if (!this.scrollContainer) return 0;

    const { scrollLeft, scrollWidth, clientWidth } = this.scrollContainer;
    const scrollableDistance = scrollWidth - clientWidth;

    if (scrollableDistance <= 0) return 0;

    return scrollLeft / scrollableDistance;
  }

  setupThumbDrag() {
    if (!this.scrollThumb || !this.scrollContainer) return;

    let isDragging = false;
    let startX = 0;
    let startScrollLeft = 0;

    this.scrollThumb.addEventListener("mousedown", (e) => {
      isDragging = true;
      startX = e.clientX;
      startScrollLeft = this.scrollContainer.scrollLeft;
      this.scrollThumb.classList.add("cursor-grabbing");
      this.scrollThumb.classList.remove("cursor-grab");
      document.body.style.userSelect = "none";
    });

    document.addEventListener("mousemove", (e) => {
      if (!isDragging) return;

      e.preventDefault();

      const barWidth = this.scrollBar.offsetWidth;
      const thumbWidth = this.scrollThumb.offsetWidth;
      const dragDistance = e.clientX - startX;
      const scrollableWidth = this.scrollContainer.scrollWidth - this.scrollContainer.clientWidth;

      const scrollRatio = scrollableWidth / (barWidth - thumbWidth);
      const scrollAmount = dragDistance * scrollRatio;

      this.scrollContainer.scrollLeft = startScrollLeft + scrollAmount;
    });

    const endDrag = () => {
      if (!isDragging) return;
      isDragging = false;
      this.scrollThumb.classList.remove("cursor-grabbing");
      this.scrollThumb.classList.add("cursor-grab");
      document.body.style.userSelect = "";
    };

    document.addEventListener("mouseup", endDrag);
    document.addEventListener("mouseleave", endDrag);
  }

  connectedCallback() {
    window.addEventListener("resize", () => {
      this.updateThumbWidth();
      this.updateThumbPosition();
    });
  }

  disconnectedCallback() {
    window.removeEventListener("resize", this.updateThumbPosition);
  }
}

if (!customElements.get("platter-featured-collection")) {
  customElements.define("platter-featured-collection", PlatterFeaturedCollection);
}
