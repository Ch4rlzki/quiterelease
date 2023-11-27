import { app } from "./config.js";
import { getFirestore, getDocs, collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp } from "firebase/firestore";

const firestore = getFirestore();

const ventsCol = collection(firestore, "vents");
const postsCol = query(ventsCol, orderBy("createdAt", "asc"), where("type", "==", "post"));
const commentsCol = query(ventsCol, orderBy("createdAt", "asc"), where("type", "==", "comment"));

getDocs(postsCol).then((res) => {
    const ventCommentsContainer = document.getElementById("ventCommentsContainer");
    const ventsContainer = document.getElementById("ventsContainer");
    let postData = [];

    ventsContainer.innerHTML = "";

    res.docs.forEach((doc) => {
        postData.push({ ...doc.data(), id: doc.id });
    });

    postData.map(({ message, createdAt, id }) => {
        createdAt = createdAt.toDate();

        ventsContainer.innerHTML += `<div class="card">
            <div class="card-header">
                <small class="opacity-75"><b>Posted at:</b> ${createdAt}</small>
            </div>
            <div class="card-body">
                <label class="card-text">${message}</label>
            </div>
            <div class="card-footer border-top">
                <button type="button" class="btn btn-primary" data-bs-toggle="offcanvas" data-bs-target="#${id}">Comments</button>
            </div>
        </div>`;

        ventCommentsContainer.innerHTML += `<div class="offcanvas offcanvas-start bg-secondary text-white" id="${id}">
            <div class="offcanvas-header border-bottom border-primary">
                <h6 class="offcanvas-title">Comments</h6>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="offcanvas"></button>
            </div>
            <div class="offcanvas-body">
                <div class="d-flex flex-column gap-2 mb-2 commentsForContainer" id="comments-for-${id}"></div>
                <form class="commentsForm" id="comment-form-${id}" novalidate>
                    <textarea class="form-control mb-2 bg-primary" name="message" placeholder="Share your words of support and empathy..."  style="min-height: 250px;" required></textarea>
                    <button type="submit" class="btn btn-primary text-white px-4"><i class="bi bi-send-fill"></i></button>
                </form>
            </div>
        </div>`;

        const commentForm = document.getElementById(`comment-form-${id}`);
        const formTrigger = commentForm.querySelector("button[type='submit']");

        commentForm.addEventListener("submit", (e) => {
            e.preventDefault();
            e.stopPropagation();
            commentForm.classList.add("was-validated");

            if (commentForm.checkValidity()) {
                const message = commentForm.message.value.replace(/(\r\n|\n|\r)/gm, "<br>");

                toggleSpinner(formTrigger, '<i class="bi bi-send-fill"></i>', true);

                addDoc(ventsCol, {
                    type: "comment",
                    message: message,
                    forComment: id,
                    createdAt: serverTimestamp()
                }).then(() => {
                    toggleToast("Your comment has been posted!");
                    commentForm.classList.remove("was-validated");
                    commentForm.reset();
                    setTimeout(() => {
                        toggleSpinner(formTrigger, '<i class="bi bi-send-fill"></i>', false);
                    }, 1000);
                }).catch((err) => {
                    console.log(err);
                });
            }
        });
    });
}).catch((err) => {
    console.log(err);
});

onSnapshot(commentsCol, (res) => {
    const commentsForContainer = document.getElementsByClassName("commentsForContainer");
    let commentsData = [];

    Array.from(commentsForContainer).forEach((element) => {
        element.innerHTML = "";
    });

    res.docs.forEach((doc) => {
        commentsData.push({ ...doc.data(), id: doc.id });
    });

    commentsData.map(({ message, createdAt, forComment, id }) => {
        const commentsForContainer = document.getElementById(`comments-for-${forComment}`);
        
        createdAt = createdAt.toDate();

        commentsForContainer.innerHTML += `<div class="card bg-primary text-white" id="${id}">
            <div class="card-header border-0 border-bottom border-secondary">
                <small class="opacity-75"><b>Commented at:</b> ${createdAt}</small>
            </div>
            <div class="card-body">
                <label class="card-text">${message}</label>
            </div>
        </div>`;
    });
});

window.toggleToast = (body) => {
    const mainToast = document.getElementById("mainToast");
    const toastBody = mainToast.getElementsByClassName("toast-body")[0];

    toastBody.innerHTML = body;
    bootstrap.Toast.getOrCreateInstance(mainToast).show();
}

window.toggleSpinner = (trigger, body, isLoading) => {
    if (isLoading) {
        trigger.disabled = true;
        trigger.innerHTML = `<span class="spinner-border spinner-border-sm"></span>`;
    } else {
        trigger.disabled = false;
        trigger.innerHTML = body;
    }
}