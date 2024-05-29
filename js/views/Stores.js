import AbstractView from "./AbstractView.js";

export default class extends AbstractView {
    constructor(params) {
        super(params);
        this.title = "stores";
        this.name = "stores";

        this.viewPath = `/www/html/${this.name}.html`;
        this.postDependencies = [
            {
                path: "/www/js/stores.js"
            }
        ];

        this.viewUnloaded = async() => {
            let objects = [ 
                "addStoreUserDialog", "LoadedStores", "addStore", "displayStores",
                "loadStores", "editStore", "removeStore", "prepareEditUserDialog"
            ];
            for (let index = 0; index < objects.length; index++) {
                objects[index] = null;
                delete window[objects[index]];
            }
            console.log("unload works greate!")
        };
    }

}