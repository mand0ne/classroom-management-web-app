var kesiraneSlike = [];
var indexPrveOdUcitanih = 0;
var ucitaneSlike = "";
var sadrzajElement = document.getElementsByClassName("sadrzaj")[0];

Pozivi.dohvatiSlike(indexPrveOdUcitanih);
podesiDugme(document.getElementById("pret"), true);

document.getElementById("pret").addEventListener("click", function () {
    indexPrveOdUcitanih -= 3;

    if (indexPrveOdUcitanih === 0)
        podesiDugme(document.getElementById("pret"), true);

    podesiDugme(document.getElementById("sljed"), false);

    ucitaneSlike = "";

    for (let i = indexPrveOdUcitanih; i < kesiraneSlike.length && i < indexPrveOdUcitanih + 3; i++)
        ucitaneSlike += kesiraneSlike[i];

    sadrzajElement.innerHTML = ucitaneSlike;
});

document.getElementById("sljed").addEventListener("click", function () {
    indexPrveOdUcitanih += 3;
    ucitaneSlike = "";
    podesiDugme(document.getElementById("pret"), false);

    if (indexPrveOdUcitanih < kesiraneSlike.length - 3) {
        for (let i = indexPrveOdUcitanih; i < kesiraneSlike.length && i < indexPrveOdUcitanih + 3; i++)
            ucitaneSlike += kesiraneSlike[i];

        sadrzajElement.innerHTML = ucitaneSlike;
    }
    else
        Pozivi.dohvatiSlike(indexPrveOdUcitanih);

});

function azurirajSlike(nove) {
    let noveSlike = nove.split('<div>');
    ucitaneSlike = "";

    for (let i = 1; i < noveSlike.length; i++) {
        if (indexPrveOdUcitanih + i - 1 < kesiraneSlike.length)
            kesiraneSlike[indexPrveOdUcitanih + i - 1] = ("<div>" + noveSlike[i]);
        else
            kesiraneSlike.push(("<div>" + noveSlike[i]));
    }

    for (let i = indexPrveOdUcitanih; i < kesiraneSlike.length && i < indexPrveOdUcitanih + 3; i++)
        ucitaneSlike += kesiraneSlike[i];

    sadrzajElement.innerHTML = ucitaneSlike;
}