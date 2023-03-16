let clientId = '3MVG9LBJLApeX_PAlM3ly65t6lr9hb3kGRcf3RGayIHLd8dh8EAX0zDhkfpIbJb.m9BGhzLbWTLoFt1qfPPQq';
//let clientId = '3MVG9t0sl2P.pByqmqBfMeoWxc0JvuM.VK0cYxRTt7y_jsbDr9qYjciTlYho0HsJm64kbl5P0CsAN8gBYoCL9';
let clientSecret = '62C6A540AE04A830261E32DDC5E3462AD017FE9115F95F5455765E982099003A';
//let clientSecret ='D5D3E335E78E0659B05A931D2280E9A9ED60C99AEF50BD048684209783031D7A'
let username = 'anebrera@sectorpublicospring20.demo';
let password = 'Salesforce1234';
//let username = 'mario.de-la-iglesia-caballero-nuzz@force.com';
//let password = 'Salesforce23$';
let url = 'https://login.salesforce.com/services/oauth2/token';
const prueba = new Array();

// Hacemos la llamada  para obtener el token de acceson y ponemos "Accept": "application/json","Access-Control-Allow-Origin": "*","Access-Control-Allow-Methods": "*"
try {
    fetch(url, {
        OPTIONS: {
            "Accept": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "*"
        },
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: 'grant_type=password&client_id=' + clientId + '&client_secret=' + clientSecret + '&username=' + username + '&password=' + password
    }).then(response => {
        return response.json();
    }
    ).then(data => {
        //Guardamos el token y la instance url  en una variable global
        window.token = data.access_token;
        window.instanceUrl = data.instance_url;
        //Llamamos a la función que hace la llamada a la API
        getAccounts();
    });
} catch (error) {
    console.log(error);
}

//Función que hace la llamada a la API
function getAccounts() {

    //Hacemos la llamada a la API para obtener los users
    fetch(window.instanceUrl + '/services/data/v45.0/query/?q=SELECT+Id,Name,Email,Phone,Title+FROM+User', {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + window.token
        }
    }).then(response => {
        console.log(response);
        return response.json();
    }
    ).then(data => {
        //Guardamos los usuarios en una variable global
        window.users = data.records;
        //LLamamos a la función que muestra los usuarios en un select
        showUsers();
    });

}

//Función que muestra los usuarios en un select
function showUsers() {
    //Obtenemos el select
    let select = document.getElementById('vendedor');
    //Ordenamos los usuarios por nombre
    window.users.sort((a, b) => {
        if (a.Name > b.Name) {
            return 1;
        }
        if (a.Name < b.Name) {
            return -1;
        }
        return 0;
    });
    //Recorremos los usuarios
    window.users.forEach(user => {
        //Creamos un option por cada usuario
        let option = document.createElement('option');
        option.value = user.Id;
        option.innerHTML = user.Name;
        select.appendChild(option);
    });
}
// FECHAS Y HORAS SEGUN VENDEDOR
function cambiaVendedor() {
    let idVendedor = document.getElementById("vendedor").value;
    console.log("idVendedor: " + idVendedor);
    let nombreVendedor = document.getElementById("vendedor").options[document.getElementById("vendedor").selectedIndex].text;
    console.log("nombreVendedor: " + nombreVendedor);
    //Hacemos la consulta para obtener todos los eventos
    fetch(window.instanceUrl + '/services/data/v57.0/sobjects/Event', {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + window.token
        }
    }).then(response => {
        //Mostramos por consola la respuesta
        console.log(response);
        return response.json();
        
    })
        .then(data => {
            //Guardamos los eventos en una variable global
            window.event = data.records;
            console.log("Fechas: "+data.records);
            //LLamamos a la función para hacer una llamada al evento del vendedor
            getEventVendedor(idVendedor);
        });
}

function getEventVendedor(idVendedor) {
    //Recorremos los eventos
    window.event.forEach(event => {
        //Si el evento es del vendedor
        if (event.OwnerId == idVendedor) {
            //Guardamos el evento en una variable global
            window.eventVendedor = event;
            //Llamamos a la función que muestra las fechas y horas
            showDates();
        }
    });
}



//     let proximaCita = document.getElementById("proximaCita");
//     let horas = document.getElementById("horas");
//     proximaCita.innerHTML = "";
//     horas.innerHTML = "";
//     let horasDisponiblesText = 'Horas dispobibles: ';
//     let horasDisponibles = [];

//     //ponemos la proxima cita del vendedor

//     for (let i = 0; i < listadoVendedor.length; i++) {
//         if (listadoVendedor[i].id == idVendedor) {
//             let fecha = listadoVendedor[i].dates[0].date;
//             let fechaArray = fecha.split("-");
//             let fechaFormateada = fechaArray[2] + "/" + fechaArray[1] + "/" + fechaArray[0];
//             proximaCita.innerHTML = "Proxima cita: " + fechaFormateada;
//             for (let j = 0; j < listadoVendedor[i].dates[0].hours.length; j++) {
//                 horas.innerHTML += listadoVendedor[i].dates[0].hours[j] + " ";
//                 //guardamos las horas disponibles en un array
//                 horasDisponibles.push(listadoVendedor[i].dates[0].hours[j]);
//             }
//             horas.innerHTML = horasDisponiblesText + horas.innerHTML;
//         }
//     }

//     //mostrar en el calendarioç

//     let calendarEl = document.getElementById('calendar');
//     let calendar = new FullCalendar.Calendar(calendarEl, {
//         initialView: 'dayGridMonth',
//         events: [
//            //cogemos el nombre del vendedor y las proximas citas y mostramos las horas disponibles
//             {
//                 title: nombreVendedor,
//                 start: listadoVendedor[idVendedor - 1].dates[0].date,
//                 end: listadoVendedor[idVendedor - 1].dates[0].date,
//                 color: 'green'
//             },
//             {
//                 title: nombreVendedor,
//                 start: listadoVendedor[idVendedor - 1].dates[1].date,
//                 end: listadoVendedor[idVendedor - 1].dates[1].date,
//                 color: 'green'
//             }
//         ]
//     });

//     calendar.render();
// }


//git remote add origin https://saulaznarez@dev.azure.com/saulaznarez/agendador/_git/agendador
//git push -u origin --all
//C:\Users\saznarez\AppData\Local\Programs\Git