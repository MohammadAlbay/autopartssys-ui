import AbstractView from "./AbstractView.js";

export default class extends AbstractView {
    constructor(params) {
        super(params);
        this.title = "winventory";
        this.name = "winventory";

        this.viewPath = `/www/html/${this.name}.html`;
        this.postDependencies = [
            {
                path: `/www/js/${this.name}.js`
            }
        ];

        this.viewUnloaded = async() => {
            let objects = [ 
                "categoryUserDialog", "productUserDialog", "categoryFullView", "fullEditProductUserDialog",
                "Items", "Categories", "loadCategories", "displayCategory", "showEditDialog",
                "generateRow", "prepareCategoryDialog", "addCategory", "editCategory", "measuringUnitUserDialog",
                "removeCategory","addProduct", "editProduct", "removeProduct", "loadProduct",
                "openProductUserDialog", "displayProduct", "displayMeasuringUnits", "prepareForEditMeasuringUnit",
                "MeasuringUnits", "loadMeasuringUnits", "addMeasuringUnits", "editMeasuringUnits"
            ];
            for (let index = 0; index < objects.length; index++) {
                objects[index] = null;
                delete window[objects[index]];
            }
            console.log("unload works greate!")
        };
    }

}