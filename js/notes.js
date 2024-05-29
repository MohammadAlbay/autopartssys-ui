var addNoteUserDialog = document.querySelector("div#add_note_userdialog");
var viewNoteUserDialog = document.querySelector("div#view_note_userdialog");
var UserNotes = [];



async function removeNote(noteId) {
    console.log(noteId);
    document.requestService({ Task: "remove_note", Id: noteId }, async data => {
        document.toggleShowHideOfUserDialog(viewNoteUserDialog, "hide");
        await loadNotes();
    });
}
async function viewNote(noteId) {
    document.closeAllOpenUserDialogs();
    let noteInfo = UserNotes.filter(d => d.Id == noteId);

    if (noteInfo == null || noteInfo.length == 0) return;
    noteInfo = noteInfo[0];
    //viewNoteUserDialog.setAttribute("note-id", noteId);
    document.querySelector("button#remove_note_button").setAttribute("onclick", "removeNote(" + noteId + ")");
    document.querySelector('textarea[name="view_note_content"]').value = noteInfo.Note;
    document.toggleShowHideOfUserDialog(viewNoteUserDialog, "show");
}
async function displayNotes(notes) {
    let noteHost = document.querySelector("div#note_host");
    noteHost.replaceChildren();
    notes.forEach(note => {
        let rand = Math.random();
        let size = rand >= 0.7 ? "card_large" : rand >= 0.4 ? "card_medium" : "card_small";
        let pinCard = document.createChild("div", {
            class: "card " + size,
            style: "cursor: pointer;",
            onclick: "viewNote(" + note.Id + ")"

        });
        document.addElement(pinCard, "main", {
            "note-content": "",
            text: note.Note,
        });
        document.addElement(pinCard, "b", {
            "note-publish-date": "",
            text: note.Creationdate,
        });
        noteHost.appendChild(pinCard);
    });
}
async function loadNotes() {
    let requestPayload = {
        Username: document.CurrentUser.Username,
        Task: "load_note"
    };
    document.requestService(requestPayload, async data => {
        UserNotes = data.Message;
        await displayNotes(data.Message);
    });
}
async function addNote() {
    let promise = await results;
    let r = promise.Result;
    if (r.filter(row => row.State == false).length > 0) {
    } else {
        let textareaElement = document.querySelector("textarea[name='add_note_content']");

        let requestPayload = {
            Username: document.CurrentUser.Username,
            Note: r[0].Value,
            Task: "add_note"
        };
        document.requestService(requestPayload, async data => {
            textareaElement.value = "";
            promise.Reset();
            alert(data.Message);
            document.toggleShowHideOfUserDialog(addNoteUserDialog, 'hide');
            await loadNotes();
        });
    }
}


var validationMap = [
    {
        Input: "add_note_content",
        ValidateWhen: "input",
        async Validator(v) {
            if (v.length == 0)
                return [false, "لا يمكن اضافة ملاحظة فارغة"];
            return [true, v];
        }
    }
];
var results = document.validateInput(validationMap, document.querySelector("#submitButton"));


(async () => {
    if (document.currentView == null) {
        location.href = "/www/html/" + userData.Page
    }
    else if (!document.currentView.isViewEmbedded) {
        let user = sessionStorage.getItem("user");
        if (user == null)
            location.href = "/www/html/login.html"
        let userData = JSON.parse(user);
        if (typeof container === 'undefined') {
            location.href = "/www/html/" + userData.Page;
        }
    }

    await loadNotes();

})();