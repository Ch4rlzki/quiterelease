import { app } from "./config.js";
import { getFirestore, collection, addDoc, getDocs, serverTimestamp } from "firebase/firestore";

const firestore = getFirestore();

const mainForm = document.getElementById("mainForm");

mainForm.addEventListener("submit", (e) => {
    e.preventDefault();
    e.stopPropagation();
    mainForm.classList.add("was-validated");

    if (mainForm.checkValidity()) {
        const trigger = mainForm.querySelector("button[type='submit']");
        const message = mainForm.message.value.replace(/(\r\n|\n|\r)/gm, "<br>");

        toggleSpinner(trigger, "Post", true);

        addDoc(collection(firestore, "vents"), {
            type: "post",
            message: message,
            createdAt: serverTimestamp(),
        }).then(() => {
            toggleToast("Your vent has been posted!");
            mainForm.classList.remove("was-validated");
            mainForm.reset();
            setTimeout(() => {
                toggleSpinner(trigger, "Post", false);
            }, 3000);
        }).catch((err) => {
            console.log(err);
        });
    }
});

window.toggleSpinner = (trigger, body, isLoading) => {
    if (isLoading) {
        trigger.disabled = true;
        trigger.innerHTML = `<span class="spinner-border spinner-border-sm"></span>`;
    } else {
        trigger.disabled = false;
        trigger.innerHTML = body;
    }
}

window.toggleToast = (body) => {
    const mainToast = document.getElementById("mainToast");
    const toastBody = mainToast.getElementsByClassName("toast-body")[0];

    toastBody.innerHTML = body;
    bootstrap.Toast.getOrCreateInstance(mainToast).show();
}