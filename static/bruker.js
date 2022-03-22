const username = document.querySelector("#username");
const password = document.querySelector("#password");
const authenticate_result = document.querySelector("#authenticate-result");

async function authenticate(register) {
    let url = register ? "/api/register" : "/api/login";

    let response = await fetch(url, {
        method: "POST",
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json"
        },
        body: JSON.stringify({username: username.value, password: password.value})
    });
    response = await response.json();

    authenticate_result.style.color = response.status === "error" ? "red" : "green";
    authenticate_result.innerText = response["message"];
    authenticate_result.removeAttribute("hidden");

    username.value = "";
    password.value = "";
}