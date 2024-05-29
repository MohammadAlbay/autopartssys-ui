import AbstractView from "./AbstractView.js";

export default class extends AbstractView {
    constructor(params) {
        super(params);
        this.title = "suppliers";
        this.name = "suppliers";

        this.viewPath = `/www/html/${this.name}.html`;
        this.postDependencies = [
            {
                path: `/www/js/${this.name}.js`
            }
        ];

        this.viewUnloaded = async() => {
            let objects = [ 
                "supplierDialog", "Suppliers", "addSupplier", "editSupplier",
                "removeSupplier", "loadSuppliers", "displaySuppliers"
            ];
            for (let index = 0; index < objects.length; index++) {
                objects[index] = null;
                delete window[objects[index]];
            }
            console.log("unload works greate!")
        };
    }

}