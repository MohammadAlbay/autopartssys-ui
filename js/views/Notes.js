import AbstractView from "./AbstractView.js";

export default class extends AbstractView {
    constructor(params) {
        super(params);
        this.title = "notes";
        this.name = "notes";

        this.viewPath = `/www/html/${this.name}.html`;
        this.postDependencies = [
            {
                path: "/www/js/notes.js"
            }
        ];

        this.viewUnloaded = async() => {
            let objects = [
                "addNoteUserDialog", "viewNoteUserDialog", "UserNotes",
                "removeNote", "viewNote", "displayNotes",
                "loadNotes", "addNote", "loadUsersAccounts",
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