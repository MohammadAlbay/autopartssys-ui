class SlideShow {
    #element
    static from(htmlTag) {
        return new SlideShow(htmlTag);
    }

    #SlideShow(h) {
        this.#element = h;
    }
}

SlideShow.from(document.querySelector(".slidshow"));