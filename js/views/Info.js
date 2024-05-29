import AbstractView from "./AbstractView.js";

export default class extends AbstractView {
    constructor(params) {
        super(params);
        this.title = "info";
        this.name = "info";
        this.viewPath = `/www/html/${this.name}.html`;
        this.postDependencies = [
            {
                path: "/www/js/info.js",
                attributes : {}
            }
        ];
    }
    
    async onLoad() {
        await super.onLoad();
    }
    async getHtml() {
        return await super.getHtml();
    }
}