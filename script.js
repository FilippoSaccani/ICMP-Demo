//FILIPPO SACCANI
const pc1 = {nome: "PC1", mac: "0000.0000.0000.AAAA", ip: "192.168.1.2", table: [["0000.0000.0000.BBBB", "192.168.1.3"], ["0000.0000.0000.AAAA", "192.168.1.2"]]};
const pc2 = {nome: "PC2", mac: "0000.0000.0000.BBBB", ip: "192.168.1.3", table: [["0000.0000.0000.AAAA", "192.168.1.2"], ["0000.0000.0000.BBBB", "192.168.1.3"]]};
const switch1 = {nome: "SWITCH1", table: [[0, "0000.0000.0000.AAAA"], [1, "0000.0000.0000.BBBB"]]};
let terminal = {utente: null, cronologia1: "", cronologia2: ""};
let running = false;

let t = "";
for (let key in pc1){
    if (key === "table") break;
    t += key + ": " + pc1[key] + "<br>";
}
$("#pc1data").html(t);

t = "ARP TABLE<br>";
for (let element in pc1.table) {
    t += pc1.table[element][1] + " | " + pc1.table[element][0] + "<br>";
}
$("#arp1").html(t);

t = "";
for (let key in pc2){
    if (key === "table") break;
    t += key + ": " + pc2[key] + "<br>";
}
$("#pc2data").html(t);

t = "ARP TABLE<br>";
for (let element in pc2.table) {
    t += pc2.table[element][1] + " | " + pc2.table[element][0] + "<br>";
}
$("#arp2").html(t);

t = "porta | MAC address<br>";
for (let element in switch1.table){
    t += switch1.table[element][0] + "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;| " + switch1.table[element][1] + "<br>";
}
$("#switchtable").html(t);

$("#pc1").click(function (){
    $("#pc1data").toggle();
    $("#arp1").toggle();
});

$("#pc2").click(function (){
    $("#pc2data").toggle();
    $("#arp2").toggle();
});

$("#switch").click(function (){
    $("#switchtable").toggle();
});

$("#pulsante1").click(function () {
    $("#terminale").show();
    $("#header-terminale").text("TERMINALE PC1");
    terminal.utente = pc1;
    $("#cronologia-terminale").html(terminal.cronologia1);
});

$("#pulsante2").click(function () {
    $("#terminale").show();
    $("#header-terminale").text("TERMINALE PC2");
    terminal.utente = pc2;
    $("#cronologia-terminale").html(terminal.cronologia2);
});

$("#connetti").click(function () {
    $("#guideContainer").hide();
    $("#container").show();
});

window.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {    //quando si preme invio
        if (terminal.utente !== null) {
            $("#error1").hide();
            $("#error2").hide();
            $("#check1").hide();
            $("#check2").hide();

            //ricava il comando dall'input
            let error = false;
            let errmsg = "";
            let val = $("#input-terminale").val();
            $("#input-terminale").val("");

            //divide il comando inviato in parti
            let comando = val.split(" ");

            let toIP = comando[1];
            let toMAC = "";

            //cerca degli errrori
            if (running) {
                error = true;
                errmsg = "ATTENDERE lA FINE DEL COMANDO PRECEDENTE";
            }
            else if (comando[0].toLowerCase() !== "ping") {  //controlla il nome del comando, può fare solo il ping
                error = true;
                errmsg = "COMANDO SCONOSCIUTO";
            }
            else if (comando.length !== 2) {    //controlla la quantità di argomenti, deve essere 1
                error = true;
                errmsg = "ARGOMENTI NON VALIDI";
            }
            else {
                //cerca il MAC del destinatario nella tabella ARP
                terminal.utente.table.forEach(function (value) {
                    if(value[1] === toIP) toMAC = value[0];
                });

                //se non lo trova da errore, dato che si presuppone il non utilizzo del protocollo ARP
                if (toMAC === "") {
                    error = true;
                    errmsg = "INDIRIZZO IP SCONOSCIUTO";
                }
            }

            //scrive il comando sulla cronologia, assieme ad eventuali errori
            if (terminal.utente === pc1) {
                terminal.cronologia1 += ('"' + val + '" <span style="color: red">' + errmsg + "</span><br>");
                $("#cronologia-terminale").html(terminal.cronologia1);
                if (error) {
                    $("#p1").append("<img src='Immagini/cross.png' alt='error' id='error1'>");
                    setTimeout(function () {
                        $("#error1").remove();
                    }, 5000);
                }
            }
            else if (terminal.utente === pc2) {
                terminal.cronologia2 += ('"' + val + '" <span style="color: red">' + errmsg + "</span><br>");
                $("#cronologia-terminale").html(terminal.cronologia2);
                if (error) {
                    $("#p2").append("<img src='Immagini/cross.png' alt='error' id='error2'>");
                    setTimeout(function () {
                        $("#error2").remove();
                    }, 5000);
                }
            }

            //modello semplificato ICMP
            let icmp = {fromIP: null, toIP: null, fromMAC: null, toMAC: null, back: false};

            icmp.fromIP = terminal.utente.ip;
            icmp.toIP = toIP;
            icmp.fromMAC = terminal.utente.mac;
            icmp.toMAC = toMAC;

            if (icmp.fromIP === icmp.toIP) icmp.back = true;

            if (!error) sendICMP(icmp);   //invia il pacchetto se non ci sono errori
        }
    }
});

function sendICMP (icmp) {
    running = true;
    //decide da dove partire
    switch (icmp.fromIP) {
        case pc1.ip: {
            //crea il pacchetto
            $("body").append("<img src='Immagini/message.png' alt='icmp' id='icmp' hidden>");

            //anima il pacchetto verso lo switch
            let offset = $("#p1").offset();
            $("#icmp").css("left", offset.left).css("top", offset.top).fadeIn().animate({
                left: "+=515px"
            }, 3000).fadeOut();
            setTimeout(function () {
                switchICMP(icmp);
            }, 3000);

            break;
        }
        case pc2.ip: {
            //crea il pacchetto
            $("body").append("<img src='Immagini/message.png' alt='icmp' id='icmp' hidden>");

            //anima il pacchetto verso lo switch
            let offset = $("#p2").offset();
            $("#icmp").css("margin-left", "25px").css("left", offset.left).css("top", offset.top).fadeIn().animate({
                left: "-=515px"
            }, 3000).fadeOut();
            setTimeout(function () {
                switchICMP(icmp);
            }, 3000);

            break;
        }
    }
}

function switchICMP(icmp) {
    //lo switch decide dove inviarlo guardando la tabella di routing
    switch1.table.forEach(function (value) {
        if (value[1] === icmp.toMAC) {
            if (value[0] === 0) {
                //anima il pacchetto verso sinistra
                $("#icmp").fadeIn().animate({
                    left: "-=515px"
                }, 3000).fadeOut();
            }
            else if (value[0] === 1) {
                //anima il pacchetto verso destra
                $("#icmp").fadeIn().animate({
                    left: "+=515px"
                }, 3000).fadeOut();
            }

            setTimeout(function () {
                switch(icmp.toMAC) {
                    case pc1.mac: {
                        receiveICMP(pc1, icmp);
                        break;
                    }
                    case pc2.mac: {
                        receiveICMP(pc2, icmp);
                        break;
                    }
                }
            }, 5000);
        }
    });
}

function receiveICMP (receiver, icmp) {
    if (!icmp.back) {
        //crea un icmp con gli indirizzi invertiti da spedire indietro al mittente
        let icmpBack = {fromIP: null, toIP: null, fromMAC: null, toMAC: null, back: false};
        icmpBack.toIP = icmp.fromIP;
        icmpBack.fromIP = icmp.toIP;
        icmpBack.toMAC = icmp.fromMAC;
        icmpBack.fromMAC = icmp.toMAC;
        icmpBack.back = true;   //così non va in loop all'infinito

        sendICMP(icmpBack); //spedisce il pacchetto al mittente
    }
    else {  //se è già completato il giro, il pacchetto viene eliminato e appare una spunta
        running = false;
        $("#icmp").remove();
        switch (receiver.ip) {
            case pc1.ip: {
                $("#p1").append("<img src='Immagini/check.png' alt='check' id='check1'>");
                setTimeout(function () {
                    $("#check1").remove();
                }, 5000);
                break;
            }
            case pc2.ip: {
                $("#p2").append("<img src='Immagini/check.png' alt='check' id='check2'>");
                setTimeout(function () {
                    $("#check2").remove();
                }, 5000);
                break;
            }
        }
    }
}