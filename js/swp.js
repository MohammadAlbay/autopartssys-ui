/**
 * Class SWP - Single Web Page 
 * Date 2024-4-9
 */
export default class SWP {

    static #instance;
    static get Reference() { return SWP.#instance; }
    #view;
    #OnBeforeRoute;
    #OnAfterRoute;
    #usesPopstateEvents = true;
    #Container;
    Configurations;
    constructor(config = { routes: [], previousePage: [] }) {
        this.Configurations = config;
        SWP.#instance = this;
    }

    setDOMEvent() {
        document.addEventListener("DOMContentLoaded", (e) => {
            document.body.addEventListener("click", e => {
                let target;
                if (e.target.matches("[data-link]"))
                    target = e.target;
                else if (e.target.parentElement.matches("[data-link]"))
                    target = e.target.parentElement;

                if (target != null) {
                    e.preventDefault();
                    let url = target.getAttribute("href");
                    navigateTo(url);
                }
                else {
                    e.preventDefault();
                    e.stopPropagation();
                }
            });
            checkForPerviousPage();
        });
    }
    setPopstateEvent() {
        this.#usesPopstateEvents = true;
        window.addEventListener("popstate", this.Router);
    }
    set View(v) {
        this.#view = v;
    }
    get View() {
        return this.#view;
    }
    set Container(v) {
        this.#Container = v;
    }
    get Container() { return this.#Container; }

    set OnBeforeRoute(callback = (view, route) => { }) {
        this.#OnBeforeRoute = callback;
    }
    set OnAfterRoute(callback = (view, route) => { }) {
        this.#OnAfterRoute = callback;
    }
    RouteTo = async (url) => this.Router(url);
    Router = async (url = null) => {
        this.#OnBeforeRoute?.();

        let match = null;

        if (url == null) {
            // Test each route for potential match
            const potentialMatches = this.Configurations.routes.map(route => {
                return {
                    route: route,
                    result: location.pathname.match(this.#pathToRegex(route.path))
                };
            });

            match = potentialMatches.find(potentialMatch => potentialMatch.result != null);
        }
        else {
            const potentialMatches = this.Configurations.routes.map(route => {
                return {
                    route: route,
                    result: location.host+ url.match(this.#pathToRegex(route.path))
                };
            });

            match = potentialMatches.find(potentialMatch => potentialMatch.result != null);
        }


        if (!match) {
            match = {
                route: this.Configurations.routes[1],
                result: [location.pathname]
            };
        }

        const view = new match.route.view([]);
        view.setViewEmbedded = true;
        this.View = view;
        if (document.currentView == null)
            document.currentView = view;
        else if (view != document.currentView) {
            document.currentView.onUnload();
            document.currentView = view;
        }

        await view.onLoad();


        this.#Container.innerHTML = await view.getHtml();
        //document.querySelector("#app").innerHTML = await view.getHtml();
    };


    #checkForPerviousPage = () => {
        let s = location.search;
        if (s == "" || s == undefined)
            return;

        s = s.substring(1, s.length);

        previousPage.forEach(item => {
            if (item.search == s)
                navigateTo(item.path);
        });

        //location.search = "";
    };

    #pathToRegex = path => new RegExp("^" + path.replace(/\//g, "\\/").replace(/:\w+/g, "(.+)") + "$");

    #getParams = match => {
        const values = match.result.slice(1);
        const keys = Array.from(match.route.path.matchAll(/:(\w+)/g)).map(result => result[1]);

        return Object.fromEntries(keys.map((key, i) => {
            return [key, values[i]];
        }));
    };

    #navigateTo = url => {
        if (this.#usesPopstateEvents) {
            history.pushState(null, null, url);
            this.Router();
        }
        else {
            this.Router(url);
        }
    };
}