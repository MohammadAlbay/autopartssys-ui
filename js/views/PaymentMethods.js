import AbstractView from "./AbstractView.js";

export default class extends AbstractView {
    constructor(params) {
        super(params);
        this.title = "paymentmethods";
        this.name = "paymentmethods";

        this.viewPath = `/www/html/${this.name}.html`;
        this.postDependencies = [
            {
                path: `/www/js/${this.name}.js`
            }
        ];

        this.viewUnloaded = async() => {
            let objects = [ 
                "PaymentOptions", "paymentDialog", "PaymentMethodsDialog",
                "removePaymentMethod", "prepareForEditing", "addPaymentMethod",
                "editPaymentMethod", "displayPaymentOptions", "loadPaymentOptions"
            ];
            for (let index = 0; index < objects.length; index++) {
                objects[index] = null;
                delete window[objects[index]];
            }
            console.log("unload works greate!")
        };
    }

}