import AbstractView from "./AbstractView.js";

export default class extends AbstractView {
    constructor(params) {
        super(params);
        this.title = "clients";
        this.name = "clients";

        this.viewPath = `/www/html/${this.name}.html`;
        this.postDependencies = [
            {
                path: `/www/js/${this.name}.js`
            }
        ];

        this.viewUnloaded = async() => {
            let objects = [ 
                "addClientUserDialog", "editClientUserDialog", "Clients",
                "addClient", "editClient", "loadClients", "displayClients",
                "prepareEditClientDialog", "removeClient"
            ];
            for (let index = 0; index < objects.length; index++) {
                objects[index] = null;
                delete window[objects[index]];
            }
            console.log("unload works greate!")
        };
    }

}