const API = "https://marokip3s-api.marokip3s.workers.dev/api";

async function login() {

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    try {

        const res = await fetch(API + "/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username,
                password
            })
        });

        const data = await res.json();

        if (data.success) {

            localStorage.setItem("admin", data.username);

            window.location.href = "dashboard.html";

        } else {

            document.getElementById("error").innerHTML = data.message;

        }

    } catch (e) {

        document.getElementById("error").innerHTML = e.message;

    }

}