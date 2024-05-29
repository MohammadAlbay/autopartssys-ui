import AbstractView from "./AbstractView.js";

export default class extends AbstractView {
    constructor(params) {
        super(params);
        this.title = "accounts";
        this.name = "accounts";

        this.viewPath = `/www/html/${this.name}.html`;
        this.postDependencies = [
            {
                path: "/www/js/accounts.js"
            }
        ];

        this.viewUnloaded = async() => {
            let objects = [
                "InfoBook", "addAccountUserDialog", "addAccount",
                "loadPermissionsInfo", "deleteAccount", "displayPermissionInfo",
                "GenerateRow", "displayData", "loadUsersAccounts",
                "closeAllOpenUserDialogs", "clientUIWork"
            ];
            for (let index = 0; index < objects.length; index++) {
                objects[index] = null;
                delete window[objects[index]];
            }

            console.log("unload works greate!")
        };
    }

}