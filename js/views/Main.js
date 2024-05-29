import AbstractView from "./AbstractView.js";

export default class extends AbstractView {
    constructor(params) {
        super(params);
        this.title = "main";
        this.name = "main";

        this.viewPath = `/www/html/${this.name}.html`;
        this.postDependencies = [
            {
                path: "/www/js/main.js"
            },
            {
                path: "https://cdn.jsdelivr.net/npm/popper.js@1.16.0/dist/umd/popper.min.js",
                attributes : {
                    'integrity' : "sha384-Q6E9RHvbIyZFJoft+2mJbHaEWldlvI9IOYy5n3zV9zzTtmI3UksdQRVvoxMfooAo",
                    'crossorigin' : "anonymous"

                }
            },
            {
                path: "https://stackpath.bootstrapcdn.com/bootstrap/5.0.0-alpha1/js/bootstrap.min.js",
                attributes : {
                    'integrity' : "sha384-oesi62hOLfzrys4LxRF63OJCXdXDipiYWBnvTl9Y9/TRlw5xlKIEHpNyvvDShgf/",
                    'crossorigin' : "anonymous"

                }
            }
        ];
    }

}