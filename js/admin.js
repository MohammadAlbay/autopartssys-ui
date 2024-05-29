let adminConfigurationUserDialog = {
    Dialog: document.getElementById("configuration_userdialog"),
    BusinessName: document.querySelector("input[name='configuration_userdialog_business']"),
    Address1: document.querySelector("input[name='configuration_userdialog_address1']"),
    Address2: document.querySelector("input[name='configuration_userdialog_address2']"),
    Phone1: document.querySelector("input[name='configuration_userdialog_phone1']"),
    Phone2: document.querySelector("input[name='configuration_userdialog_phone2']"),
    Note1: document.querySelector("input[name='configuration_userdialog_note1']"),
    Note2: document.querySelector("input[name='configuration_userdialog_note2']"),

    Show() {
        this.Load();
        document.toggleShowHideOfUserDialog(this.Dialog, "show");
    },
    Hide() {
        document.toggleShowHideOfUserDialog(this.Dialog, "hide");
    },
    Fill() {
        this.BusinessName.value = document.Configs.Business;
        this.Address1.value = document.Configs.Address1;
        this.Address2.value = document.Configs.Address2;
        this.Phone1.value = document.Configs.Phone1;
        this.Phone2.value = document.Configs.Phone2;
        this.Note1.value = document.Configs.Note1;
        this.Note2.value = document.Configs.Phone2;
    },
    Save() {
        let requestPayload = {
            Task: "set_configs",
            Business: this.BusinessName.value,
            Address1: this.Address2.value,
            Address2: this.Address2.value,
            Phone1: this.Phone1.value,
            Phone2: this.Phone2.value,
            Note1: this.Note1.value,
            Note2: this.Note2.value
        }

        document.requestService(requestPayload, async data => {
            alert(data.Message);
            await this.Load();
        });
    },
    async Load() {
        let configs = await document.loadConfigurations();
        document.Configs = configs;
        this.Fill();
    }
}

let UserDataEditor = {
    Shown: false,
    Dialog: document.querySelector("div#accouunt_profile"),
    UserIdLabel: document.querySelector("div#accouunt_profile > .userID"),
    Show() {this.Setup(); this.Shown = true; document.closeAllOpenPopups(); document.toggleShowHideOfUserDialog(this.Dialog, "show") },
    Hide() { this.Shown = false; document.toggleShowHideOfUserDialog(this.Dialog, "hide") },
    Setup() {
        if (document.CurrentUser != null) {
            this.UserIdLabel.innerHTML = document.CurrentUser.Fullname;
        }
    },
    ShowEditor() {
        EditorDialog.Show();
    },
    Toggle() {
        if(this.Shown)
            this.Hide();
        else
            this.Show();
    }
}
let EditorDialog = {
    Dialog: document.querySelector("div#edit_account_userdialog"),
    Input: {
        Username: document.querySelector("div#edit_account_userdialog > div > div > input[name='username']"),
        Fullname: document.querySelector("div#edit_account_userdialog > div > div > input[name='fullname']"),
        Password: document.querySelector("div#edit_account_userdialog > div > div > input[name='passcode']"),
    },
    Show() {
        document.closeAllOpenPopups();
        document.toggleShowHideOfUserDialog(this.Dialog, "show");
        this.Prepare();
    },
    Hide() { document.toggleShowHideOfUserDialog(this.Dialog, "hide") },
    Prepare() {
        if (document.CurrentUser == null) {
            this.Hide();
        }
        this.Input.Username.value = document.CurrentUser.Username;
        this.Input.Fullname.value = document.CurrentUser.Fullname;
        this.Input.Password.value = "";
    },
    Save() {
        let requestPayload = {
            Task: "edit_accounts",
            Username: this.Input.Username.value,
            Fullname: this.Input.Fullname.value,
            Passcode: this.Input.Password.value
        }
        if(requestPayload.Passcode === "")
            delete requestPayload.Passcode;
        document.requestService(requestPayload, data => {
            alert(data.Message);
            let user  = JSON.parse(sessionStorage.getItem("user"));
            user.Fullname = requestPayload.Fullname;
            sessionStorage.setItem("user", JSON.stringify(user));
            location.reload();
        });
    }
}


/*

/(^2189[1|2|4][0-9]{7}$)|(^09[1|2|4][0-9]{7}$)/

/^([\w]+([\w\.]*))(@)(uot)(\.)(edu)(\.)(ly)$/
*/