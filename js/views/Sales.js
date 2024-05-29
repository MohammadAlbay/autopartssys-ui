
import AbstractView from "./AbstractView.js";

export default class extends AbstractView {
    constructor(params) {
        super(params);
        this.title = "sales";
        this.name = "sales";

        this.viewPath = `/www/html/${this.name}.html`;
        this.postDependencies = [
            {
                path: "/www/js/sales.js"
            }
        ];

        this.viewUnloaded = async() => {
            let objects = [
                "LoadedBills", "LoadedAccounts", "LoadedPayments", "LoadedClients",
                "TopbarFormElements", "BillDetailsScreen",
                "fetchTodayBills", "formateDate", "printChunkItems", 
                "printBill", "loadRequiredData", "displayRequiredData"
            ];
            for (let index = 0; index < objects.length; index++) {
                try {window[objects[index]] = null;delete window[objects[index]];}
                catch {}
            }

            console.log("unload works greate!")
        };
    }

}