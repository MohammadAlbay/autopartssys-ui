//#region Main Objects
let Refreshing = false;
let appWindow = document.querySelector("div#app");
let addBillFloatingToolBox = document.querySelector('div#newbill_floatingtoolbox');

let ActiveClients = [];
let Categories = [];
let Stores = [];
let PaymentOptions = [];
let LoadedItems = [];

let BillRepository = {
    LoadedBills: [],
    SelectedBill: null,
    window: document.querySelector("div[user-screen][name='repo-window']"),
    RightTable: document.querySelector("table#bill_repo_head_table"),
    LeftTable: document.querySelector("table#bill_repo_table"),
    PlaceholderIcon: document.querySelector("div#bill_repo_placeholder_icon"),

    Clear() {
        this.LoadedBills = [];
        this.SelectedBill = null;
        this.RightTable.replaceChildren();
        this.LeftTable.replaceChildren();
    },
    Show() {
        document.toggleShowHideOfFullView(this.window, "show");
        this.LoadAndDisplay();
    },
    Hide() {
        document.toggleShowHideOfFullView(this.window, "hide");
    },
    RemoveSelected() {
        if (this.SelectedBill == null) {
            alert("قم بتحديد فاتورة اولا");
        }

        this.LoadedBills = this.LoadedBills.filter(b => b.Id != this.SelectedBill.Id);
        localStorage.setItem("BILL_REPO", JSON.stringify(this.LoadedBills));
        this.LoadAndDisplay();
    },
    LoadAndDisplay() {
        this.Clear();
        let billRepo = localStorage.getItem("BILL_REPO");
        if (billRepo == null) {
            localStorage.setItem("BILL_REPO", JSON.stringify([]));
            this.LoadAndDisplay();
            return;
        }
        else {
            billRepo = JSON.parse(billRepo);
            this.LoadedBills = billRepo;
            this.RightTable.replaceChildren();
            this.RightTable.innerHTML = `
                    <tr>
                        <td>#</td>
                        <td>النوع</td>
                        <td>العميل</td>
                        <td>طريقة الدفع</td>
                        <td>المدفوع</td>
                        <td>التخفيضات</td>
                        <td>المتبقي</td>
                        <td>الاجمالي</td>
                    </tr>
            `;
            billRepo.forEach(b => {

                document.modifyElement(this.RightTable, {

                    child: document.createChild("tr", {
                        event: {
                            onclick(self) {
                                BillRepository.SelectBill(b);
                            }
                        },
                        child: [
                            document.createChild("td", { text: b.Id }),
                            document.createChild("td", { text: b.Type == 0 ? "نقدي" : b.Type == 1 ? "آجل" : "مبدئية" }),
                            document.createChild("td", { text: b.Client.Name }),
                            document.createChild("td", { text: b.Payment.Name }),
                            document.createChild("td", { text: b.Payed + " د.ل " }),
                            document.createChild("td", { text: b.Discount + " د.ل " }),
                            document.createChild("td", { text: b.Remain + " د.ل " }),
                            document.createChild("td", { text: b.Total + " د.ل " }),
                        ]
                    })

                });

            });
        }
    },
    SelectBill(bill) {
        this.SelectedBill = bill;
        this.PlaceholderIcon.style.display = "none";
        this.LeftTable.style.display = "inline-block";

        this.LeftTable.replaceChildren();
        this.LeftTable.innerHTML = `
                    <tr>
                        <td>#</td>
                        <td>الاسم</td>
                        <td>الكمية</td>
                        <td>تقاس بـ</td>
                        <td>السعر</td>
                        <td>بسعر الجملة</td>
                        <td>التخفيض</td>
                        <td>السعر</td>
                        <td>الاجمالي</td>
                    </tr>`;
        bill.Items.forEach(b => {

            document.modifyElement(this.LeftTable, {

                child: document.createChild("tr", {

                    child: [
                        document.createChild("td", { text: b.Id }),
                        document.createChild("td", { text: b.Fullname }),
                        document.createChild("td", { text: b.RequiredQuantity }),
                        document.createChild("td", { text: b.MeasuingUnit }),
                        document.createChild("td", { text: b.Price + " د.ل " }),
                        document.createChild("td", { text: b.UsesWholesalePrice ? "نعم" : "لا" }),
                        document.createChild("td", { text: b.Discount + " د.ل " }),
                        document.createChild("td", { text: b.Price + " د.ل " }),
                        document.createChild("td", { text: (b.Price * b.RequiredQuantity - b.Discount) + " د.ل " }),
                    ]
                })

            });

        });
    },
    RestoreBill() {
        if (this.SelectedBill == null) {
            alert("قم بتحديد فاتورة اولا");
        }
        else {
            Bill.RestoreFrom(this.SelectedBill);
            this.Hide();
        }
    },
    AddToRepository() {
        if (localStorage.getItem("BILL_REPO") == null)
            localStorage.setItem("BILL_REPO", JSON.stringify([]));

        let billRepo = JSON.parse(localStorage.getItem("BILL_REPO"));
        let index = -1;
        let storedBill = billRepo.filter((b, i) => {
            if (b.Id == Bill.Id) {
                index = i;
                return true;
            }
            return false;
        });
        if (storedBill == null || storedBill.length == 0) {
            billRepo.push({
                Id: Bill.Id,
                Type: Bill.Type,
                Client: TopbarFormFields.SelectedClient(),
                Payment: PayOptions.SelectedPaymentMethod,
                Payed: parseFloat(BillInfo.Get("payed")),
                Discount: parseFloat(BillInfo.Get("discount")),
                Remain: parseFloat(BillInfo.Get("remain")),
                Total: parseFloat(BillInfo.Get("price")),
                Items: Bill.Items
            });
        }
        else {
            billRepo[index] = {
                Id: Bill.Id,
                Type: Bill.Type,
                Client: TopbarFormFields.SelectedClient(),
                Payment: PayOptions.SelectedPaymentMethod,
                Payed: parseFloat(BillInfo.Get("payed")),
                Discount: parseFloat(BillInfo.Get("discount")),
                Remain: parseFloat(BillInfo.Get("remain")),
                Total: parseFloat(BillInfo.Get("price")),
                Items: Bill.Items
            };
            return;
        }

        localStorage.setItem("BILL_REPO", JSON.stringify(billRepo))
        alert("تم تحويل الفاتورة للمستودع");
    }
};
let MainToolbox = {
    CreateBill: document.querySelector("div#main_toolbox_new"),
    CancelBill: document.querySelector("div#main_toolbox_cancel"),

};
let TopbarFormFields = {
    CategorySelect: document.querySelector("div.appbar > select#topbar_catgory_select"),
    StoreSelect: document.querySelector("div.appbar > select#topbar_store_select"),
    InputFields: document.querySelector("div.appbar > input#topbar_inputfield"),
    Button: document.querySelector("div.appbar > button#topbar_search_button"),
    ClientSelect: document.querySelector("div.appbar > select#topbar_client_select"),
    //AddClientButton: document.querySelector("div.appbar > button#topbar_addclient_button"),

    Activate: () => {
        TopbarFormFields.Button.removeAttribute("disabled");
        TopbarFormFields.InputFields.removeAttribute("disabled");
        TopbarFormFields.InputFields.focus();
    },
    Deactivate: () => {
        TopbarFormFields.Button.setAttribute("disabled", true);
        TopbarFormFields.InputFields.setAttribute("disabled", true);
    },
    FetchTopSold: () => {
        let requestPayload = {
            Task: "topsold_cashiersystem",
            Category: TopbarFormFields.CategorySelect.value,
            Store: TopbarFormFields.StoreSelect.value
        };
        document.requestService(requestPayload, async data => {
            LoadedItems = data.Message;
            // modify here...
            let method = PayOptions.SelectedPaymentMethod || { Addedvalue: 0, Ispercentage: 0 };
            LoadedItems = LoadedItems.filter(i => {
                i.SPrice += method.Ispercentage == 1 ? i.SPrice * (method.Addedvalue / 100) : method.Addedvalue;
                i.WPrice += method.Ispercentage == 1 ? i.WPrice * (method.Addedvalue / 100) : method.Addedvalue;
                return true;
            });
            await displayResultItems();
        });
    },
    Search: () => {

        let searchText = TopbarFormFields.InputFields.value.trim();
        if (searchText.length == 0) {
            //alert("قم بادخال قيمة في مربع البحث");
            return;
        }
        let requestPayload = {
            Task: "searchitems_cashiersystem",
            SearchValue: searchText,
            Category: TopbarFormFields.CategorySelect.value,
            Store: TopbarFormFields.StoreSelect.value
        };
        document.requestService(requestPayload, async data => {
            LoadedItems = data.Message;
            // modify here...
            let method = PayOptions.SelectedPaymentMethod || { Addedvalue: 0, Ispercentage: 0 };
            LoadedItems = LoadedItems.filter(i => {
                i.SPrice += method.Ispercentage == 1 ? i.SPrice * (method.Addedvalue / 100) : method.Addedvalue;
                i.WPrice += method.Ispercentage == 1 ? i.WPrice * (method.Addedvalue / 100) : method.Addedvalue;
                return true;
            });
            await displayResultItems();
            TopbarFormFields.InputFields.value = "";
        });
    },

    SelectedClient() {
        return { Id: this.ClientSelect.value, Name: this.ClientSelect.selectedOptions[0].textContent }
    },
    SelectClient(id, name) {
        if (id == null && name == null) return;
        let done = false;
        [...this.ClientSelect.options].forEach(op => {
            if (id == null) {
                if (op.textContent === name) {
                    op.selected = true;
                    done = true;
                }
            }
            else if (name == null) {
                if (op.value == id) {
                    op.selected = true;
                    done = true;
                }
            }
            else {
                if (op.value == id && op.textContent === name) {
                    op.selected = true;
                    done = true;
                }
            }
        });
        return done;
    }
}
let SearchedItems = {
    Table: document.getElementById("table_search_items"),
    Clear(autoGenerateColumnHeaders = false) {
        this.Table.replaceChildren();
        if (autoGenerateColumnHeaders == true) {
            this.Table.innerHTML = `
            <tr>
                <td style="display: none;">#</td>
                <td>الاسم</td>
                <td>الشركة</td>
                <td>الباركود</td>
                <td>الكمية</td>
                <td>س. بيع</td>
                <td>س.ب. جملة</td>
                <td></td>
            </tr>`;
        }
    }
};
let CartItems = {
    SelectedRows: [],
    Table: document.getElementById("table_cart_items"),
    Clear(autoGenerateColumnHeaders = false) {
        this.Table.replaceChildren();
        this.SelectedRows = [];
        if (autoGenerateColumnHeaders == true) {
            this.Table.innerHTML = `
            <tr>
                <td></td>
                <td>الاسم</td>
                <td>الكمية</td>
                <td>القيمة</td>
                <td>التخفيض</td>
                <td>بسعر الجملة</td>
                <td>الاجمالي</td>
                <td></td>
            </tr>`;
        };

        if (this.Onclear != null) this.Onclear();
    },
    checkIFMaxDebtReached(itemAdded) {
        let clientInfo = ActiveClients.filter(c => c.Id == Bill.Client.Id)[0];
        if(clientInfo.MaxDebt == -1) return false;
        if (clientInfo.TotalRequired != 0) {
            let nowTotal = BillInfo.Get("price");
            nowTotal += (itemAdded.Price * itemAdded.RequiredQuantity);

            if (nowTotal > Math.abs(clientInfo.MaxDebt - clientInfo.TotalRequired)) {
                return true;
            }
        }
        return false;
    },
    AddToCart(itemAdded) {
        if (this.checkIFMaxDebtReached(itemAdded)) {
            alert("لقد تجاوزت الحد الاعلى للقيمة المالية المسموح ادانتها للعميل");
            return;
        }

        if (itemAdded == null) return;

        let [billItem, isDuplicated] = Bill.AddItem(itemAdded);
        if (isDuplicated) {
            this.Redraw();
        }
        else {
            let lastRow = this.SelectedRows[this.SelectedRows.length - 1];
            this.UnselectRow(lastRow);
            let row = this.DisplayItem(billItem);
            this.SelectRow(row);
            if (this.OnAddToCart != null)
                this.OnAddToCart(billItem);
        }
    },
    SelectRow(row) {
        //if (!this.SelectedRows.includes(row))
        let found = false;
        this.SelectedRows.forEach(r => {
            if (r.getAttribute("item-id") == row.getAttribute("item-id"))
                found = true;
        });

        if (!found) {
            this.SelectedRows.push(row);
            if (this.OnSelect != null)
                this.OnSelect(row, true);
        }
        else {
            this.OnSelect(row, false);
        }

        row.querySelector("td > input").checked = true;
    },
    UnselectRow(row) {
        if (row == null) return;

        this.SelectedRows = this.SelectedRows.filter(r => r.getAttribute("item-id") !== row.getAttribute("item-id"));
        let element = row.querySelector("td > input");
        element.checked = false;
        element.removeAttribute("checked");

        if (this.OnUnselect != null)
            this.OnUnselect(row);

    },
    Redraw() {
        let tempSelected = this.SelectedRows;
        this.Clear(true);
        this.SelectedRows = tempSelected;
        Bill.Items.forEach(item => this.DisplayItem(item));
    },
    DisplayItem(item) {
        let selected = false;
        let selectedRow = null;
        this.SelectedRows.forEach(sr => {
            if (item.Id == sr.getAttribute("item-id")) {
                selected = true;
                selectedRow = sr;
            }
        });

        let row = null;

        let kids = [
            document.createChild("td", {
                child: document.createChild("input", {
                    type: "checkbox",
                    checked: (selected ? "" : null),
                    onchange: "if(this.checked) CartItems.SelectRow(this.parentElement.parentElement); else CartItems.UnselectRow(this.parentElement.parentElement);event.stopPropagation();",
                    event: {
                        onclick(self) {
                            event.stopPropagation();
                        }
                    }
                })
            }),
            document.createChild("td", { text: item.Id + "#" + item.Fullname }),
            document.createChild("td", { text: item.RequiredQuantity }),
            document.createChild("td", { text: item.Price + " د.ل " }),
            document.createChild("td", { text: item.Discount + " د.ل " }),
            document.createChild("td", { text: item.UsesWholesalePrice ? "نعم" : "لا" }),
            document.createChild("td", { text: ((item.Price * item.RequiredQuantity) - item.Discount) + " د.ل " }),
            document.createChild("td", {
                child: document.createChild("img", {
                    src: "/www/res/images/icons/icons8_cancel_48px.png",
                    clickable: true,
                    title: "انقر لحذف هذا الصنف",
                    style: "width:26px; height:26px;",
                    event: {
                        onclick(self) {
                            Bill.RemoveItem(item.Id);
                            row.remove();
                            event.stopPropagation();
                        }
                    }
                })
            }),
        ];
        if (selected) {
            row = selectedRow;

            row.replaceChildren();
            document.modifyElement(row, {
                event: {
                    onclick(self) {
                        let checkbox = self.children[0].children[0];
                        checkbox.checked = !checkbox.checked;
                        const event = new Event("change");
                        checkbox.dispatchEvent(event);
                        event.stopPropagation();
                    }
                },
                child: kids,
                "item-id": item.Id
            });
            this.SelectRow(row);
        }
        else {
            row = document.createChild("tr", {
                event: {
                    onclick(self) {
                        let checkbox = self.children[0].children[0];
                        checkbox.checked = !checkbox.checked;
                        const event = new Event("change");
                        checkbox.dispatchEvent(event);
                        event.stopPropagation();
                    }
                },
                child: kids,
                "item-id": item.Id
            });
        }

        this.Table.appendChild(row);


        return row;
    },
    OnSelect: null,
    OnAddToCart: null,
    OnUnselect: null,
    Onclear: null
};
let Numpad = {
    Result: document.querySelector("div[user-toolbox] > div[container]  > div[numpad-result] > font"),
    Buttons: document.querySelectorAll("div[user-toolbox] > div[container]  > div[numpad] > font"),
    NumberResult: "",
    Activated: false,
    SetText(text) {
        this.Result.textContent = text;
    },
    Setup() {
        this.Buttons.forEach(button => button.onclick = () => { this.OnButtonClicked(button.textContent, button) });
        this.Deactivate();
    },
    Activate() {
        this.Activated = true;
        this.Buttons.forEach(button => {
            button.setAttribute("disabled", false);
            button.className = "grayoff clickable";
        });
    },
    Deactivate() {
        this.Activated = false;
        this.Result.textContent = "0";
        this.Buttons.forEach(button => {
            button.className = "grayon notallowed";
            button.setAttribute("disabled", true);
        });
    },
    OnButtonClicked: null
};
let BillOptionToolbox = {
    Save: document.querySelector("div#bill_option_save"),
    SaveAndPrint: document.querySelector("div#bill_option_save_print"),
    TransfereToRepository: document.querySelector("div#bill_option_transfere_repository"),
    Repository: document.querySelector("div#bill_option_repository"),

    ActivateElements: () => {
        let arr = [BillOptionToolbox.Save, BillOptionToolbox.SaveAndPrint,
        BillOptionToolbox.TransfereToRepository];
        arr.forEach(a => {
            a.className = "grayoff";
            a.style.cursor = "pointer";
            a.removeAttribute("disabled");
        });
    },
    DeactivateElements: () => {
        let arr = [BillOptionToolbox.Save, BillOptionToolbox.SaveAndPrint,
        BillOptionToolbox.TransfereToRepository];
        arr.forEach(a => {
            a.className = "grayon";
            a.style.cursor = "not-allowed";
            a.setAttribute("disabled", true);
        });
    }
}
let BillInfo = {
    BillId: document.querySelector("div.bill_header > div.ux-input-with-label > input#bill_id"),
    ClientName: document.querySelector("div.bill_header > div.ux-input-with-label > input#client_name"),
    TotalDiscount: document.querySelector("div.bill_header > div.ux-input-with-label > input#discounts_total"),
    TotalPayed: document.querySelector("div.bill_header > div.ux-input-with-label > input#total_payed"),
    TotalRemain: document.querySelector("div.bill_header > div.ux-input-with-label > input#total_remain"),
    TotalPrice: document.querySelector("div.bill_header > div.ux-input-with-label > input#total_price"),
    BillType: document.querySelector("div.bill_header > div.ux-input-with-label > input#bill_Type"),

    Clear() {
        this.Set("id", "");
        this.Set("name", "");
        this.Set("discount", "0");
        this.Set("payed", "0");
        this.Set("remain", "0");
        this.Set("price", "0");
        this.Set("type", "");
    },

    Set(property, value) {
        switch (property) {
            case "id":
                this.BillId.value = value;
                break;
            case "name":
                this.ClientName.value = value;
                break;
            case "discount":
                this.TotalDiscount.value = value;
                break;
            case "payed":
                this.TotalPayed.value = parseFloat(value).toFixed(2);
                break;
            case "remain":
                this.TotalRemain.value = parseFloat(value < 0 ? 0 : value).toFixed(2);
                break;
            case "price":
                this.TotalPrice.value = parseFloat(value).toFixed(2);
                break;
            case "type":
                this.BillType.value = value === 0 ? "دفع نقدي" : value === 1 ? "دفع آجل" : value === 2 ? "مبدئية" : "";
                break;
            default:
                throw Error("Unknowing property " + property);
        }

        this.OnSet?.(property, value);
    },
    Get(property) {
        switch (property) {
            case "id":
                return this.BillId.value;
                break;
            case "name":
                return this.ClientName.value;
                break;
            case "discount":
                return parseFloat(this.TotalDiscount.value);
                break;
            case "payed":
                return parseFloat(this.TotalPayed.value) ?? 0;
                break;
            case "remain":
                return parseFloat(this.TotalRemain.value) ?? 0;
                break;
            case "price":
                return parseFloat(this.TotalPrice.value) ?? 0;
                break;
            case "type":
                return this.BillType.value;
                break;
            default:
                throw Error("Unknowing property " + property);
        }

        this.OnSet?.(property, value);
    },
    OnSet: null
};

let Bill = {
    PreviousBill: null,
    UpdateMode: false,
    StaredBill: false,
    Id: -1,
    Type: "",
    Items: [],
    Client: {},
    SetClient: (id, name) => {
        Bill.Client = { Id: id, Name: name };
        if (Bill.Onchange != null) Bill.Onchange("client", Bill.Client);
    },
    SetType: (type) => {
        if (Bill.Id == -1) {
            alert("قم بإنشاء فاتورة اولا");
            return;
        }
        document.requestService({ Task: "edit_ibill", Type: type, Id: Bill.Id }, data => {
            Bill.Type = type;
            BillInfo.Set("type", type);
            if (Bill.Onchange != null) Bill.Onchange("type", type);
        });
    },
    New: (type) => {
        Bill.Type = type ?? 0; //default for right-away payment
        BillInfo.Set("type", type);
        Bill.Items = [];
        Bill.StaredBill = true;
        Bill.UpdateMode = false;
        let c = TopbarFormFields.SelectedClient();
        Bill.SetClient(c.Id, c.Name);
        let requestPayload = {
            Task: "create_ibill",
            Username: document.CurrentUser.Username,
            Type: Bill.Type,
            Client: c.Id
        };
        document.requestService(requestPayload, data => {
            let m = data.Message;
            if (m.Id == -1) {
                alert("لم يتم انشاء الفاتورة");
                Bill.Cancel();
                return;
            }
            else {
                Bill.Id = m.Id;

                if (Bill.OnCreate != null)
                    Bill.OnCreate(Bill.Id);
            }

        });
    },
    Cancel: () => {
        let tempId = Bill.Id;
        Bill.Id = -1;
        Bill.StaredBill = false;
        Bill.Items = [];

        let requestPayload = {
            Task: "cancel_ibill",
            Id: tempId,
            Type: Bill.Type,
            Process: "Remove"
        }
        document.requestService(requestPayload, data => {
            alert(data.Message);
        });
        if (Bill.OnCancel != null) Bill.OnCancel();
    },
    Close() {
        Bill.Id = -1;
        Bill.StaredBill = false;
        Bill.Items = [];
        if (Bill.UpdateMode)
            Bill.UpdateMode = false;
        if (Bill.OnCancel != null) Bill.OnCancel();
    },
    Save: async (suppressOnSuccess = false) => {
        if (Bill.UpdateMode)
            await Bill.Update();
        else {
            let keepGoing = false;
            await document.requestService({ Task: "edit_ibill", Payed: parseFloat(BillInfo.Get("payed")), Id: Bill.Id }, data => {
                keepGoing = true;
            }, e => {
                alert(e.Message);
            });
            if (keepGoing) {
                Bill.Items.forEach(async (item) => {
                    let requestPayload = {
                        Task: "additem_ibill",
                        Username: document.CurrentUser.Username,
                        Id: Bill.Id,
                        ItemId: item.Id,
                        Quantity: item.RequiredQuantity,
                        Price: item.Price,
                        UsesWholesalePrice: item.UsesWholesalePrice ? 1 : 0,
                        Discount: item.Discount,
                        Total: (item.Price * item.RequiredQuantity) - item.Discount,
                        Store: item.Store
                    };
                    await document.requestService(requestPayload, data => {
                        console.log(data.Message);
                    });
                });

                Bill.PreviousBill = {
                    ...Bill, Payed: BillInfo.Get("payed"), Client: TopbarFormFields.SelectedClient(),
                    Payment: PayOptions.SelectedPaymentMethod, PaymentOption: PayOptions.SelectedPaymentOption
                }; // Keep the last one

                await loadRequiredData();
                await displayLoadedData();
                if (!suppressOnSuccess)
                    alert("تم الحفظ");
                let tempType = Bill.Type;
                Bill.Close();
                Bill.New(tempType);

            }
            else {
                return;
            }

        }
        if (Bill.OnSave != null) Bill.OnSave();
    },
    Update: async () => {

        let keepGoing = false;
        await document.requestService({ Task: "edit_ibill", Payed: parseFloat(BillInfo.Get("payed")), Id: Bill.Id }, data => {
            keepGoing = true;
        }, e => {
            alert(e.Message);
        });
        if (keepGoing) {
            Bill.Items.forEach(async (item) => {
                let requestPayload = {
                    Task: "edititem_ibill",
                    Username: document.CurrentUser.Username,
                    Id: Bill.Id,
                    ItemId: item.Id,
                    Quantity: item.RequiredQuantity,
                    Price: item.Price,
                    UsesWholesalePrice: item.UsesWholesalePrice ? 1 : 0,
                    Discount: item.Discount,
                    Total: (item.Price * item.RequiredQuantity) - item.Discount,
                    Store: item.Store
                };
                await document.requestService(requestPayload, data => {
                    console.log(data.Message);
                });
            });

            alert("تم الحفظ");
            MainToolbox.CancelBill.children[1].textContent = "الغاء الفاتورة";
            Bill.UpdateMode = false;
            Bill.Close();
            //Bill.New(tempType);

        }
        else {
            return;
        }

        Bill.UpdateMode = false;
    },
    Restore: () => {

        if (Bill.PreviousBill == null) {
            alert("لا توجد فاتورة سابقة");
            return;
        }
        Bill.UpdateMode = true;
        let prevBill = Bill.PreviousBill;
        Bill.StaredBill = true;
        Bill.Id = prevBill.Id;
        Bill.Type = prevBill.Type;
        if (Bill.OnCreate != null)
            Bill.OnCreate(prevBill.Id);

        Bill.SetClient(prevBill.Client.Id, prevBill.Client.Name);

        prevBill.Items.forEach(it => CartItems.AddToCart(it));
        PayOptions.Select(prevBill.PaymentOption);

        BillInfo.TotalPayed.value = prevBill.Payed;
        BillInfo.TotalPayed.dispatchEvent(new Event('input', { bubbles: true }));

    },
    RestoreFrom: (b) => {
        Bill.Close();
        Bill.StaredBill = true;
        Bill.Id = b.Id;
        if (Bill.OnCreate != null)
            Bill.OnCreate(b.Id);

        Bill.SetClient(b.Client.Id, b.Client.Name);
        Bill.Type = b.Type;
        BillInfo.Set("type", b.Type);
        PayOptions.SelectByName(b.Payment.Name);
        b.Items.forEach(it => CartItems.AddToCart(it));


        BillInfo.TotalPayed.value = b.Payed;
        BillInfo.TotalPayed.dispatchEvent(new Event('input', { bubbles: true }));
    },
    AddItem: (item, isSet = false) => {
        if (CartItems.checkIFMaxDebtReached(item)) {
            alert("لقد تجاوزت الحد الاعلى للقيمة المالية المسموح ادانتها للعميل");
            return;
        }
        let duplicated = false;

        let resultItem = item;

        Bill.Items = Bill.Items.filter(i => {
            if (i.Id == item.Id) {
                if (!isSet)
                    resultItem.RequiredQuantity += i.RequiredQuantity;
                duplicated = true;
                return false;
            } else {
                return true;
            }
        });
        if (duplicated) {
            Bill.Items.push(resultItem);
        }
        else {
            Bill.Items.push(item);
            if (Bill.OnAddItem != null)
                Bill.OnAddItem(item);
        }

        if (Bill.Onchange != null) Bill.Onchange("items", resultItem);
        return [resultItem, duplicated];
    },
    RemoveItem: (itemId) => {
        let found = false;
        let resultItem = null;
        Bill.Items = Bill.Items.filter(i => {
            if (i.Id == itemId) {
                found = true;
                resultItem = i;
                return false;
            }
            return true;
        });

        if (Bill.UpdateMode && resultItem != null) {
            document.requestService({ Task: "removeitem_ibill", Id: Bill.Id, ItemId: resultItem.Id }, data => {
                console.log(data.Message);
            });
        }
        if (Bill.OnRemoveItem != null)
            Bill.OnRemoveItem(itemId);

        if (Bill.Onchange != null && resultItem != null) Bill.Onchange("items", resultItem);
    },
    OnAddItem: null,
    OnCreate: null,
    OnCancel: null,
    OnSave: null,
    OnRemoveItem: null,
    Onchange: null
};
let PayOptions = {
    Options: null,
    SelectedPaymentOption: null,
    SelectedPaymentMethod: null,
    Clear() {
        if (this.Options == null) return;
        this.UnSelect();
        this.Options.forEach(e => e.remove());
    },
    Refresh() {
        this.Options = document.querySelectorAll("div[numpad] > button[pay-option][image-button]")
        if (this.Options.length == 0) this.Options = null;
    },
    ShowAll: () => {
        PayOptions.Options?.forEach(o => o.style.display = "inline");
    },

    HideAll: () => {
        PayOptions.Options?.forEach(o => o.style.display = "none");
    },
    GetOptionByName(name) {
        let op = [...PayOptions.Options].filter(o => o.getAttribute("pay-option") === name);
        if (op == null || op.length == 0) {
            return null;
        }
        return op[0];
    },
    SelectByName(name) {
        let op = [...PayOptions.Options].filter(o => o.getAttribute("pay-option") === name);
        if (op == null || op.length == 0) {
            alert("لم يتمكن النظام من العثور على طريقة الدفع");
            return;
        }
        this.Select(op[0]);
    },
    Select(self) {
        if (Bill.UpdateMode && this.SelectedPaymentMethod != null) {
            //alert("لا يمكنك تغيير نوع طريقة الدفع في وضع تحديث الفاتورة");
            return;
        }
        if (this.Options == null) return;
        if (this.SelectedPaymentOption == null)
            PayOptions.Options.forEach(o => o.classList.remove("selected"));
        else
            this.UnSelect();

        self.classList.add("selected");
        let previousOptionSelected = this.SelectedPaymentOption;
        let previousMethodSelected = this.SelectedPaymentMethod;
        this.SelectedPaymentOption = self;
        let paymentName = self.getAttribute("pay-option");
        if (paymentName == null) {
            this.UnSelect(self);
            return;
        }
        let paymentMethod = PaymentOptions.filter(n => n.Name == paymentName);
        if (paymentMethod == null || paymentMethod.length == 0) {
            this.UnSelect(self);
            return;
        }
        this.SelectedPaymentMethod = paymentMethod[0];
        this.SetPyament();
        if (this.OnPaymentOptionSelected != null) {
            if (!this.OnPaymentOptionSelected({
                Option: this.SelectedPaymentOption == null ? null : { ...this.SelectedPaymentOption },
                Method: this.SelectedPaymentMethod == null ? null : { ...this.SelectedPaymentMethod }
            })) {
                return false;
            }
        }
    },
    UnSelect() {
        if (this.Options == null) return;
        if (this.SelectedPaymentOption == null) return;

        if (this.OnPaymentOptionUnSelected != null) {
            if (!this.OnPaymentOptionUnSelected({
                Option: this.SelectedPaymentOption == null ? null : { ...this.SelectedPaymentOption },
                Method: this.SelectedPaymentMethod == null ? null : { ...this.SelectedPaymentMethod }
            })) {
                return false;
            }
        }

        this.SelectedPaymentOption.classList.remove("selected");

        this.SelectedPaymentOption = null;
        this.SelectedPaymentMethod = null;
    },
    SetPyament() {
        if (Bill.Id == -1) {
            alert("قم بإنشاء فاتورة اولا");
            return;
        }
        if (this.SelectedPaymentMethod == null) {
            alert("قم بتحديد طريقو دفع اولا");
            return;
        }

        let requestPayload = {
            Task: "setpaymentmethod_ibill",
            Id: Bill.Id,
            Payment: this.SelectedPaymentMethod.Name
        };
        document.requestService(requestPayload, (d) => { console.log(d.Message); }, (e) => {
            alert("لم يتمكن النظام من تحديد طريقة الدفع هاذه");
            this.UnSelect();
        });
    },

    OnPaymentOptionUnSelected: null,
    OnPaymentOptionSelected: null
};
//#endregion
//#region  Payment Options Events...
PayOptions.OnPaymentOptionSelected = (old) => {
    if (PayOptions.SelectedPaymentMethod == null) return false;

    TopbarFormFields.Search();

    //if(Bill.Items.length == 0) return false;
    CartItems.Clear();
    Numpad.Deactivate();
    Bill.Items.forEach(item => Bill.RemoveItem(item));
    Bill.Items = [];;
    BillInfo.Set("payed", 0);
    BillInfo.Set("price", 0);
    BillInfo.Set("remain", 0);
    return true;
};
PayOptions.OnPaymentOptionUnSelected = (old) => {

    return true;
};
//#endregion
////// ---------------------------------------------------
////// ---------------------------------------------------
//#region BillInfo Events....
BillInfo.OnSet = (property, value) => {
    if (property === "price") {
        BillInfo.Set("remain", value - BillInfo.Get("payed"));
    }
    else if (property === "payed") {
        if (BillInfo.Get("price") - value <= 0)
            BillInfo.TotalPayed.value = BillInfo.TotalPrice.value;
        BillInfo.TotalRemain.value = BillInfo.TotalPayed.value - value;
    }
}

//#endregion
////// ---------------------------------------------------
////// ---------------------------------------------------
//#region Numpad Events
Numpad.OnButtonClicked = (buttonText, button) => {
    if (!Numpad.Activated) return;
    Numpad.Result.style.color = "black";
    try {
        let itemId = CartItems.SelectedRows[0].getAttribute("item-id");
        let fItem = Bill.Items.filter(item => item.Id == itemId)[0];
        let newCopy = { ...fItem };
        if (buttonText === "+") {
            newCopy.RequiredQuantity = 1;
            Bill.AddItem(newCopy);
            CartItems.Redraw();
            CartItems.SelectRow(CartItems.SelectedRows[0]);
        }
        else if (buttonText === "-") {
            if (fItem.RequiredQuantity == 1) {
                // will be 0 so remove it now...
                let lastTD = CartItems.SelectedRows[0].children[CartItems.SelectedRows[0].children.length - 1];
                lastTD.children[lastTD.children.length - 1].onclick();
                //Bill.RemoveItem(newCopy.Id);
            }
            else {
                newCopy.RequiredQuantity = -1;
                Bill.AddItem(newCopy);
                CartItems.Redraw();
                CartItems.SelectRow(CartItems.SelectedRows[0]);
            }
        }
        else if (buttonText === "1" || buttonText === "2" || buttonText === "3" || buttonText === "4"
            || buttonText === "5" || buttonText === "6" || buttonText === "7" || buttonText === "8"
            || buttonText === "9" || buttonText === "0") {
            Numpad.NumberResult += buttonText;
            try {
                let v = parseInt(Numpad.NumberResult);
                if (v > newCopy.Quantity)
                    Numpad.Result.style.color = "red";
                else
                    Numpad.Result.style.color = "black";
            } catch (e) { Numpad.NumberResult = "" + newCopy.RequiredQuantity; }
            Numpad.SetText(Numpad.NumberResult);
        }
        else if (buttonText === "⌫") {
            Numpad.NumberResult = Numpad.NumberResult.substring(0, Numpad.NumberResult.length - 1)
            //if (Numpad.NumberResult === "")
            //Numpad.NumberResult = "" + newCopy.RequiredQuantity;
            Numpad.SetText(Numpad.NumberResult);
        }
        else if (buttonText === "᰽") {
            let lastTD = CartItems.SelectedRows[0].children[CartItems.SelectedRows[0].children.length - 1];
            lastTD.children[lastTD.children.length - 1].onclick();
        }
        else if (buttonText === "✓") {
            try {
                if (Numpad.NumberResult === "") throw Error();
                let v = parseInt(Numpad.NumberResult);
                if (v > newCopy.Quantity) {
                    if (!confirm("الكمية المحددة اكبر من المسجلة في النظام. هل تريد الاستمرار ؟ ")) {
                        Numpad.NumberResult = "" + newCopy.RequiredQuantity;
                        Numpad.SetText(Numpad.NumberResult);
                    }
                    else {
                        newCopy.RequiredQuantity = v;
                        Bill.AddItem(newCopy, true);
                        CartItems.Redraw();
                        CartItems.SelectRow(CartItems.SelectedRows[0]);
                    }
                }
            } catch (e) {
                Numpad.NumberResult = "" + newCopy.RequiredQuantity;
                Numpad.SetText(Numpad.NumberResult);
            }
        }
    }
    catch (ex) { console.error(ex) };
};

//#endregion
////// ---------------------------------------------------
////// ---------------------------------------------------
//#region Cart Events

CartItems.OnUnselect = row => {
    // `row` is the unselected row
    if (CartItems.SelectedRows.length == 1) {
        Numpad.Activate();
        let itemId = CartItems.SelectedRows[0].getAttribute("item-id");
        let fItem = Bill.Items.filter(item => item.Id == itemId)[0];
        Numpad.SetText(fItem.RequiredQuantity);
    }
    else
        Numpad.Deactivate();
};
CartItems.OnAddToCart = (itemAdded) => {

};
CartItems.OnSelect = (row, isNew) => {
    if (CartItems.SelectedRows.length == 1) {
        Numpad.Activate();
        let itemId = row.getAttribute("item-id");
        let fItem = Bill.Items.filter(item => item.Id == itemId)[0];
        Numpad.SetText(fItem.RequiredQuantity);
    }
    else
        Numpad.Deactivate();
};


//#endregion
////// ---------------------------------------------------
////// ---------------------------------------------------
//#region  Bill Events
Bill.OnAddItem = (itemToAdd) => {
    // refresh ui components
};
Bill.OnCancel = () => {
    MainToolbox.CancelBill.style.display = "none";
    MainToolbox.CreateBill.style.display = "inline-block";
    TopbarFormFields.ClientSelect.disabled = false;
    BillOptionToolbox.DeactivateElements();
    PayOptions.HideAll();
    CartItems.Clear(true);
    Numpad.Deactivate();
    SearchedItems.Clear(true);
    BillInfo.Clear();
    //TopbarFormFields.Deactivate();
};
Bill.OnCreate = (id) => {
    MainToolbox.CreateBill.style.display = "none";
    MainToolbox.CancelBill.style.display = "inline-block";
    TopbarFormFields.ClientSelect.disabled = true;
    //TopbarFormFields.Activate();
    SearchedItems.Clear(true);
    CartItems.Clear(true);
    if (TopbarFormFields.ClientSelect.selectedOptions.length != 0)
        BillInfo.Set("name", TopbarFormFields.ClientSelect.selectedOptions[0].textContent);
    BillInfo.Set("id", id);
    BillOptionToolbox.ActivateElements();
    PayOptions.ShowAll();
    if (PayOptions.Options != null && PayOptions.Options.length != 0)
        PayOptions.Select(PayOptions.Options[0]);
};
Bill.OnSave = () => {

};
Bill.OnRemoveItem = itemId => {
    CartItems.SelectedRows.forEach(row => {
        if (row.getAttribute("item-id") == itemId)
            CartItems.UnselectRow(row);
    });
};
Bill.Onchange = (key, value) => {
    if (key === "type") {
        alert("تم تغيير نوع الفاتورة");
    }
    else if (key === "client") {
        BillInfo.Set("name", value.Name);
    }
    else if (key === "items") {
        let totalPrice = 0;
        let totalDiscount = 0;
        Bill.Items.forEach(item => {
            totalDiscount += parseInt(item.Discount);
            totalPrice += (item.Price * item.RequiredQuantity) - item.Discount;
        });
        BillInfo.Set("discount", totalDiscount);
        BillInfo.Set("price", totalPrice);
        let payed = parseFloat(BillInfo.Get("payed"));
        if (payed > totalPrice) {
            payed = totalPrice;
            BillInfo.Set("payed", payed);
        }
        let remain = totalPrice - payed;
        BillInfo.Set("remain", remain);
    }
}
//#endregion
////// ---------------------------------------------------
////// ---------------------------------------------------
TopbarFormFields.InputFields.addEventListener("keydown", e => {
    if (e.key === "Enter")
        TopbarFormFields.Search();
});


function loadOldBill(billData) {
    if (Bill.StaredBill)
        cancelBill();
    if (billData == null) return;
    if (!TopbarFormFields.SelectClient(billData.BillHead.ClientId, billData.BillHead.EName)) {
        alert("تعذر فتح الفاتورة. لم يتمكن النظام من تحديد العميل");
        return;
    }
    billData.BillBody = billData.BillBody.filter(item => {
        item.RequiredQuantity = item.Quantity;
        item.Id = item.Itemid;
        return true;
    });
    Bill.PreviousBill = {};
    Bill.PreviousBill.Client = TopbarFormFields.SelectedClient();
    Bill.PreviousBill.Id = billData.BillHead.Id;
    Bill.PreviousBill.Type = billData.BillHead.Type;
    Bill.PreviousBill.Items = billData.BillBody;
    Bill.PreviousBill.Payed = billData.BillHead.Payed;
    // bypassing check...
    //Bill.Id = Bill.PreviousBill.Id;
    let option = PayOptions.GetOptionByName(billData.BillHead.Payment);

    //Bill.PreviousBill.Payment = PayOptions.SelectedPaymentMethod;
    Bill.PreviousBill.PaymentOption = option;
    BillInfo.Set("payed", billData.BillHead.Payed);
    BillInfo.Set("price", billData.BillHead.Total);
    BillInfo.Set("remain", (billData.BillHead.Total - billData.BillHead.Payed));

    Bill.Restore();
    MainToolbox.CancelBill.children[1].textContent = "اغلاق";
    /*Bill.PreviousBill = { ...Bill, Payed: BillInfo.Get("payed"), Client: TopbarFormFields.SelectedClient(), 
                Payment: PayOptions.SelectedPaymentMethod, PaymentOption: PayOptions.SelectedPaymentOption }; */

}


function printItems(items) {

    let mywindow = window.open('', 'PRINT', 'height=650,width=900,top=100,left=150');

    mywindow.document.write("<html><head><title>Printing Bill</title>");
    mywindow.document.write('<link rel="stylesheet" href="/www/css/normalize.css" />');
    mywindow.document.write('<link rel="stylesheet" href="/www/css/ui.css" />');
    mywindow.document.write('<link rel="stylesheet" href="/www/css/childui.css" />');
    mywindow.document.write(`
    <script>
      var link = document.createElement('link');
      link.rel="stylesheet";
      link.href = "/www/css/childui.css";
      document.head.appendChild(link);
    </script>
    `);
    mywindow.document.write('</head><body>');

    let generatedNoteKids = [];
    if (document.Configs.Note1 !== "") {
        generatedNoteKids.push(
            document.createChild("li", { text: document.Configs.Note1 })
        );
    }
    if (document.Configs.Note2 !== "") {
        generatedNoteKids.push(
            document.createChild("li", { text: document.Configs.Note2 })
        );
    }
    let generatedKids = [];
    generatedKids.push(
        document.createChild("tr", {
            child: [
                document.createChild("td", { text: "#" }),
                document.createChild("td", { text: "الاسم" }),
                document.createChild("td", { text: "الكمية" }),
                document.createChild("td", { text: "تقاس بـ" }),
                document.createChild("td", { text: "بسعر الجملة" }),
                document.createChild("td", { text: "السعر" }),
                document.createChild("td", { text: "التخفيض" }),
                document.createChild("td", { text: "الاجمالي" }),
            ]
        })
    );
    items.forEach(item => {
        generatedKids.push(
            document.createChild("tr", {
                child: [
                    document.createChild("td", { text: item.Id }),
                    document.createChild("td", { text: item.Fullname }),
                    document.createChild("td", { text: item.RequiredQuantity }),
                    document.createChild("td", { text: item.MeasuingUnit }),
                    document.createChild("td", { text: item.UsesWholesalePrice ? "نعم" : "لا" }),
                    document.createChild("td", { text: item.Price + "د.ل" }),
                    document.createChild("td", { text: item.Discount + "د.ل" }),
                    document.createChild("td", { text: (item.Price * item.RequiredQuantity - item.Discount) + "د.ل" }),
                ]
            })
        );
    });
    let printPageDiv = document.createChild("div", {
        "print-page": true,
        child: document.createChild("div", {
            container: true,

            child: [
                document.createChild("div", {
                    header: true,
                    child: [
                        document.createChild("img", { "sys-icon": true, width: "26", height: "26", src: "/www/res/images/icons/OIG2.hy8fcL.W0mXTKv.jpg" }),
                        document.createChild("h5", { "sys-name": true, text: "Autoparts System" }),
                        document.createChild("h1", { "business-name": true, text: document.Configs.Business }),
                        document.createChild("i", { "address1": true, text: document.Configs.Address1 }),
                        document.createChild("i", { "address2": true, text: document.Configs.Address2 }),
                        document.createChild("i", { "phones": true, text: "الهاتف " + document.Configs.Phone1 + " " + document.Configs.Phone2 }),
                        document.createChild("i", { "bill-type": true, text: (Bill.Type == 0 ? "نقدي" : Bill.Type == 1 ? "اجل" : "مبدئية") }),
                        document.createChild("table", {
                            "bill-info": true,
                            child: [
                                document.createChild("tr", {
                                    child: [
                                        document.createChild("td", { text: "#" }),
                                        document.createChild("td", { text: Bill.Id })
                                    ]
                                }),
                                document.createChild("tr", {
                                    child: [
                                        document.createChild("td", { text: "العميل" }),
                                        document.createChild("td", { text: Bill.Client.Name })
                                    ]
                                })
                            ]
                        })
                    ]
                }),
                document.createChild("div", {
                    content: true,
                    child: [
                        document.createChild("table", {
                            "bill-items": true,
                            style: "padding:0.2em;",
                            child: generatedKids
                        }),
                        document.createChild("table", {
                            "bill-signitures": true,
                            child: [
                                document.createChild("tr", {
                                    child: [
                                        document.createChild("td", { colspan: "2", style: "padding: 0.1em;text-align: right;", text: "الموظف : " + document.CurrentUser.Fullname }),
                                        document.createChild("td", { colspan: "2", style: "padding: 0.1em;text-align: right;", text: "التاريخ : " + (new Intl.DateTimeFormat('en-GB', { dateStyle: 'short', timeStyle: 'short', }).format(new Date())) }),
                                        document.createChild("td", { style: "padding: 0.1em;text-align: right;", text: " الاجمالي : " + BillInfo.Get("price") + "د.ل" }),
                                    ]
                                }),
                                document.createChild("tr", {
                                    child: [
                                        document.createChild("td", { colspan: "2", style: "padding: 0.1em;text-align: right;", text: " المدفوع : " + BillInfo.Get("payed") + "د.ل" }),
                                        document.createChild("td", { colspan: "2", style: "padding: 0.1em;text-align: right;", text: " المتبقي : " + BillInfo.Get("remain") + "د.ل" }),
                                        document.createChild("td", { rowspan: "3", style: "padding: 0.1em;", text: "التوقيع / الختم" }),
                                    ]
                                }),
                                document.createChild("tr", {
                                    child: [
                                        document.createChild("td", {
                                            colspan: "4", rowspan: "3", style: "text-align: right;",
                                            child: [
                                                document.createChild("u", { text: "الملاحظات" }),
                                                document.createChild("br", {}),
                                                document.createChild("ul", {
                                                    child: generatedNoteKids
                                                }),
                                            ]
                                        })
                                    ]
                                })
                            ]
                        })
                    ]
                })
            ]

        })
    });

    //console.log(printPageDiv.innerHTML);
    //mywindow.document.write(printPageDiv.innerHTML);
    mywindow.document.write('</body></html>');

    mywindow.document.close(); // necessary for IE >= 10
    mywindow.focus(); // necessary for IE >= 10
    mywindow.addEventListener('load', () => {
        mywindow.document.body.appendChild(printPageDiv);
        setTimeout(() => {
            mywindow.print();
            mywindow.close();
        }, 350);
    }, true);



    return true;
}
function printBill() {
    const chunkSize = 9;
    const r = Bill.Items.reduce((arr, item, idx) => (arr[idx / chunkSize | 0] ??= []).push(item) && arr, []);
    try {
        r.forEach(items => {
            printItems(items);
        });
    }
    catch (e) {
        alert("حذثت مشكلة اثناء طباعةالفاتورة");
        console.error(e);
    }

}

function moveToRepository(self) {
    if (Bill.UpdateMode || !Bill.StaredBill) {
        alert("هذه الخاصية متاحه فقط للفواتير قيد الانشاء");
        return;
    }

    BillRepository.AddToRepository();
    Bill.Close();
}

async function saveBill(type) {
    // do all stuff...
    // items..
    // 
    if (!Bill.StaredBill) {
        alert("قم بإنشاء فاتورة اولا");
        return;
    }
    if (Bill.Items.length == 0) {
        alert("قم بإضافة صنف على الاقل لتتمكن من حفظ الفاتورة");
        return;
    }
    if (PayOptions.SelectedPaymentMethod == null) {
        alert("قم بتحديد طريقة الدفع");
        return;
    }
    if (Bill.Client == null) {
        alert("قم بتحديد العميل اولا");
        return;
    }
    if (Bill.Type == 0 && BillInfo.Get("remain") != 0) {
        if (!confirm("لم يتم دفع القيمة كاملة. ان كنت ترغب في البيع بالدين رجاء قم بتحديد نوع الفاتورة للدفع الاجل. ان كنت ترغب فالتجاهل والاستمرار انقر على زر التأكيد ادناه"))
            return;
    }

    if (type == 1) {
        // print..
        printBill();
        await Bill.Save(true);
    }
    else
        await Bill.Save();




}

function payedInputFieldInput() {
    if (BillInfo.TotalPrice.value - BillInfo.TotalPayed.value < 0) {
        BillInfo.Set("payed", BillInfo.TotalPrice.value);
    }
    BillInfo.Set("remain", BillInfo.TotalPayed.value === "" ? 0 : parseFloat(BillInfo.TotalPrice.value) - parseFloat(BillInfo.TotalPayed.value));
}
function newBillClick() {
    if (Refreshing) return;
    document.toggleShowHideOfUserDialog(addBillFloatingToolBox, 'show');
    setTimeout(() => {
        if (!addBillFloatingToolBox.classList.contains("hide-scale"))
            document.toggleShowHideOfUserDialog(addBillFloatingToolBox, 'hide');
    }, 5000);
}

function createNewBill(type) {
    if (Bill.Items.length == 0)
        Bill.New(type);
    else
        Bill.SetType(type);
}
function cancelBill() {
    if (Bill.UpdateMode) {
        Bill.Close();
        MainToolbox.CancelBill.children[1].textContent = "الغاء الفاتورة";
        return;
    }
    if (Bill.Items.length == 0)
        Bill.Cancel();
    else {
        if (confirm("هل انت متأكد من الغاء الفاتورة؟"))
            Bill.Cancel();
    }
}
function selectClientChanged(self) {
    const { text } = [...self.options].find((option) => option.selected);
    Bill.SetClient(self.value, text);
}
async function loadRequiredData() {
    let tempStores = await document.loadAllStores();
    let tempCate = await document.loadAllCategories();
    let tempClient = await document.loadAllClients();
    let tempPaymentOptions = await document.loadAllPaymentOptions();
    // filter out
    Stores = tempStores.filter(s => s.Type == "main");
    Categories = tempCate.filter(s => s.Active == 1);
    ActiveClients = tempClient.filter(s => s.Active == 1);
    PaymentOptions = tempPaymentOptions.filter(s => s.Active == 1);
}

async function displayLoadedData() {
    TopbarFormFields.CategorySelect.replaceChildren();
    TopbarFormFields.StoreSelect.replaceChildren();
    TopbarFormFields.ClientSelect.replaceChildren();
    Stores.forEach(store => document.addElement(TopbarFormFields.StoreSelect, "option", { text: store.Name, value: store.Name }));
    Categories.forEach(cat => document.addElement(TopbarFormFields.CategorySelect, "option", { text: cat.Name, value: cat.Name }));
    ActiveClients.forEach(c => document.addElement(TopbarFormFields.ClientSelect, "option", { text: c.EName, value: c.Id }));
    TopbarFormFields.ClientSelect.options[0].selected = true;
    PayOptions.Clear();
    let numpad = document.querySelector("div[user-toolbox] > div[container]  > div[numpad]");
    PaymentOptions.forEach(method => {
        //document.querySelectorAll("div[numpad] > button[pay-option][image-button]")

        document.modifyElement(numpad, {
            child: document.createChild("button", {
                "pay-option": method.Name,
                "image-button": true,
                style: "margin-right:0.2em; margin-top:0.2em;",
                event: {
                    onclick(self) { PayOptions.Select(self); }
                },
                text: method.Name,
                child: [document.createChild("img", { src: "/www/res/images/icons/icons8_split_transaction_48px.png" })],

            })
        });
    });

    PayOptions.Refresh();

    if (!Bill.StaredBill) PayOptions.HideAll();

}
async function displayResultItems() {
    if (LoadedItems == null || LoadedItems.length == 0) return;

    let table = SearchedItems.Table;
    SearchedItems.Clear(true);
    let autoSelect = false;
    if (LoadedItems.length == 1)
        autoSelect = true;


    LoadedItems.forEach(item => {
        let tr = document.createChild("tr", {
            style: "cursor:pointer;", title: "قم بالنقر للاختيار",
            "item-id": item.Id, onclick: `searchedItemSelected(this, ${item.Id});`
        });
        document.addElement(tr, "td", { text: item.Id, style: "display:none" });
        document.addElement(tr, "td", { text: item.Fullname, style: "font-size:10pt", title: item.Id });
        document.addElement(tr, "td", { text: item.Company, style: "font-size:10pt" });
        document.addElement(tr, "td", { text: item.Barcode, style: "font-size:10pt" });
        document.addElement(tr, "td", { text: item.Quantity, style: "font-size:10pt" });
        document.addElement(tr, "td", { text: item.SPrice + " د.ل ", style: "font-size:10pt" });
        document.addElement(tr, "td", {
            text: item.WPrice + " د.ل ",
            title: (item.AllowWholeSales == 1 ? "" : "لايمكن البيع بسعر الجملة"),
            style: "font-size:10pt;" + (item.AllowWholeSales == 1 ? "" : "text-decoration: line-through;color:#e53935;")
        });
        document.addElement(tr, "td", {
            child: document.createChild("img", {
                text: "جملة", style: "display:block;font-size:10pt; height:32px; width:32px",
                src: "/www/res/images/icons/icons8_menu_48px.png",
                onclick: "searchedItemShowMenu(event," + item.Id + ");event.stopPropagation()"
            })
        });
        table.appendChild(tr);
    });
}
function searchedItemShowMenu(event, itemId) {
    let menu = MenuManager.GetMenu('SearchedItems-Menu');
    menu.setAttribute("item-id", itemId);
    let item = LoadedItems.filter(i => i.Id == itemId)[0];
    let mo = document.getElementById("whole_sale_menu_option");
    if (!item.AllowWholeSales) {
        mo.style.display = "none";
    }
    else {
        mo.style.display = "block";
    }
    MenuManager.ShowMenuAtPosition(menu, event.pageX, event.pageY);
}
function searchedItemSelected(self, id) {

    searchedItemClicked(null, id);
    //alert(self.getAttribute("item-id") + ".." + useWPrice);
}
function searchedItemClicked(self, id) {
    if (!Bill.StaredBill) {
        alert("قم بأنشاء فاتورة اولا");
        return;
    }
    let menu = MenuManager.GetMenu('SearchedItems-Menu');
    let itemId = id ?? parseInt(menu.getAttribute("item-id"));
    let item = LoadedItems.filter(i => i.Id == itemId)[0];
    let itemToAdd = { ...item };
    // setup item
    itemToAdd.RequiredQuantity = 1;
    let menuItem = self?.getAttribute("name") ?? "searcheditems_single_nodiscount";
    switch (menuItem) {
        case "searcheditems_single_nodiscount":
            itemToAdd.UsesWholesalePrice = false;
            itemToAdd.Price = itemToAdd.SPrice;
            CartItems.AddToCart(itemToAdd);
            break;
        case "searcheditems__single_discount":
            let discountValue = parseFloat(prompt(`قم بكتابة قيمة التخفيض `, 0));
            itemToAdd.UsesWholesalePrice = false;
            itemToAdd.Price = itemToAdd.SPrice;
            if (itemToAdd.Price - discountValue <= 0 || discountValue < 0) {
                alert("قيمة التخفيض لايمكن ان تكون اكبر او تساوي سعر البيع المستخدم");
                return;
            }
            itemToAdd.Discount = discountValue;
            CartItems.AddToCart(itemToAdd);
            break;
        case "searcheditems__wholesale_nodiscount":
            if (itemToAdd.AllowWholeSales == 0) {
                alert("لا يمكن البيع باستخدام سعر الجملة.");
                return;
            }
            itemToAdd.UsesWholesalePrice = true;
            itemToAdd.Price = itemToAdd.WPrice;
            CartItems.AddToCart(itemToAdd);
            break;
        case "searcheditems__wholesale_discount":
            if (itemToAdd.AllowWholeSales == 0) {
                alert("لا يمكن البيع باستخدام سعر الجملة.");
                return;
            }
            let discountValue1 = parseFloat(prompt(`قم بكتابة قيمة التخفيض `, 0));
            itemToAdd.UsesWholesalePrice = true;
            itemToAdd.Price = itemToAdd.WPrice;
            if (itemToAdd.Price - discountValue1 <= 0 || discountValue1 < 0) {
                alert("قيمة التخفيض لايمكن ان تكون اكبر او تساوي سعر البيع المستخدم");
                return;
            }
            itemToAdd.Discount = discountValue1;
            CartItems.AddToCart(itemToAdd);
            break;
    }
}

function extraOptionItemClicked(self, text) {

    if (text === "reload") {
        (async () => {
            await loadRequiredData();
            await displayLoadedData();
        })();
    }
    else if (text === "fetch-last-bill") {
        if (Bill.StaredBill) {
            alert("لديك فاتورة مفتوحة بالفعل. قم بالغائها او تحويلها للمستودع ثم اعد المحاولة");
            return;
        }
        Bill.Restore();
        MainToolbox.CancelBill.children[1].textContent = "اغلاق";
    }
    else {
        if (!Bill.StaredBill) {
            alert("قم بإنشاء فاتورة اولا");
            return;
        };
        if (text === "bill-0") { Bill.SetType(0); }
        else if (text === "bill-1") { Bill.SetType(1); }
        else if (text === "bill-2") { Bill.SetType(2); }
        else if (text === "select-all") {
            [...CartItems.Table.children].slice(1).forEach(row => {
                CartItems.SelectRow(row);
            });
        }
        else if (text === "unselect-all") {
            [...CartItems.Table.children].slice(1).forEach(row => {
                CartItems.UnselectRow(row);
            });
        }
        else if (text === "cancel-all") {
            [...Bill.Items].forEach(i => Bill.RemoveItem(i.Id));
            CartItems.Clear();
            Bill.Items = [];
        }
    }
}



(async () => {

    
    let user = sessionStorage.getItem("user");
    if (user == null)
        location.href = "/www/html/login.html"

    //TopbarFormFields.Deactivate();
    Numpad.Setup();

    await loadRequiredData();
    await displayLoadedData();

    // setInterval(async () => {
    //     if (!Bill.StaredBill && !Bill.UpdateMode) {
    //         Refreshing = true;
    //         await loadRequiredData();
    //         await displayLoadedData();
    //         Refreshing = false;
    //     }
    // }, 500000);
})();