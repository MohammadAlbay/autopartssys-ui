
import AbstractView from "./AbstractView.js";

export default class extends AbstractView {
    constructor(params) {
        super(params);
        this.title = "purchases";
        this.name = "purchases";

        this.viewPath = `/www/html/${this.name}.html`;
        this.postDependencies = [
            {
                path: "/www/js/purchases.js"
            }
        ];

        this.viewUnloaded = async() => {
            let objects = [
                "SupplierPurchasesWindow", "Suppliers","startNewBillIcon",
                "loadRequiredData", "displayLoadedData"
            ];
            for (let index = 0; index < objects.length; index++) {
                try {window[objects[index]] = null;delete window[objects[index]];}
                catch {}
            }

            console.log("unload works greate!")
        };
    }

}