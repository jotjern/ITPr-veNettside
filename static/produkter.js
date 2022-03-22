function pris_til_streng(pris) {
    // Dersom det ikke er noen enhet (kg, gram, etc.) så er det naturlig å anta at det er en vare som produseres i enheter.
    return pris.enhet ? `${pris.mengde}${pris.valutta} per ${pris.enhet}` : `${pris.mengde}${pris.valutta}`;
}

function stor_bokstav(string) {
    // Fikser store og små bokstaver
    return string[0].toUpperCase() + string.substring(1).toLowerCase();
}

function get_handlekurv() {
    return JSON.parse(localStorage.getItem("handlekurv")) || {};
}

function set_handlekurv(handlekurv) {
    localStorage.setItem("handlekurv", JSON.stringify(handlekurv));
}

function send_bestilling() {
    fetch("/api/handlekurv", {
        method: "POST",
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json"
        },
        body: JSON.stringify(get_handlekurv())
    }).then(async resp => {
        if (resp.status === 200) {
            alert("Handlekurv lagret!");
        } else {
            alert(await resp.text());
        }
    });
}

fetch("/api/produkter").then(resp => resp.json()).then(produkter => {
    const handlekurv = get_handlekurv();
    for (const produkt_liste_konteiner of document.querySelectorAll(".produkter")) {
        const produkt_mal = produkt_liste_konteiner.querySelector(".produkt-mal");
        const produkt_liste = produkt_liste_konteiner.querySelector(".produkt-liste");

        for (const produkt of produkter) {
            const produkt_element = produkt_mal.content.cloneNode(true);
            produkt_element.querySelector(".produkt-navn").innerText = stor_bokstav(produkt.navn);
            produkt_element.querySelector(".produkt-bilde").src = produkt.bilde;
            produkt_element.querySelector(".produkt-pris").innerText = pris_til_streng(produkt.pris);

            const antall_velger = produkt_element.querySelector(".produkt-antall-konteiner");
            const antall_viser = antall_velger.querySelector(".produkt-antall");

            const antall_i_handlekurv = handlekurv[produkt._id];

            if (antall_i_handlekurv) {
                antall_viser.value = antall_i_handlekurv.toString();
            }

            const oppdater_produkt_i_handlekurv = (ny_verdi) => {
                console.log(`${produkt._id} -> ${ny_verdi}`);

                let handlekurv = get_handlekurv();
                handlekurv[produkt._id] = ny_verdi;
                set_handlekurv(handlekurv);
                console.log(handlekurv);
            }

            const endre_mengde = endring => {
                let verdi = parseInt(antall_viser.value);
                verdi = isNaN(verdi) ? 0 : verdi;

                verdi += endring;
                verdi = verdi < 0 ? 0 : verdi;

                antall_viser.value = verdi.toString();

                oppdater_produkt_i_handlekurv(verdi);
            };

            antall_viser.onchange = () => {
                let verdi = parseInt(antall_viser.value);

                oppdater_produkt_i_handlekurv(verdi);
            }

            antall_velger.querySelector(".produkt-pluss").onclick = () => { endre_mengde(1) };
            antall_velger.querySelector(".produkt-minus").onclick = () => { endre_mengde(-1) };

            produkt_liste.appendChild(produkt_element);
        }
    }
})