let clientId = '3MVG9LBJLApeX_PAlM3ly65t6lr9hb3kGRcf3RGayIHLd8dh8EAX0zDhkfpIbJb.m9BGhzLbWTLoFt1qfPPQq';
let clientSecret = '62C6A540AE04A830261E32DDC5E3462AD017FE9115F95F5455765E982099003A';
let username = 'anebrera@sectorpublicospring20.demo';
let password = 'Salesforce1234';
let url = 'https://login.salesforce.com/services/oauth2/token';
let eventos = new Array();

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
    window.nombreVendedor = document.getElementById("vendedor").options[document.getElementById("vendedor").selectedIndex].text;
    console.log("nombreVendedor: " + window.nombreVendedor);
    //Hacemos la consulta para obtener todos los eventos
    fetch(window.instanceUrl + '/services/data/v57.0/sobjects/Event', {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + window.token
        }
    }).then(response => {
        // Convertimos el objeto Response a un objeto JSON
        let data = response.json();
        // Devolvemos el objeto JSON
        return data;        
    })
        .then(data => {
            //Envimos los datos a la función que los procesa
            getEventVendedor(idVendedor , data);
        });
}

function getEventVendedor(idVendedor, data) {
    eventos = [];
    //Recorremos data que es un objet object
    data.recentItems.forEach(event => {
        let urlEvent = "https://sectorpublicospring20.my.salesforce.com" + event.attributes.url;
        //Hacemos la consulta para obtener el evento
        fetch(urlEvent, {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + window.token
            }
        }).then(response => {
            //Mostramos por consola la respuesta
            // Recibimos un object Response de la petición fetch()
            // Convertimos el objeto Response a un objeto JSON
            let datos = response.json();
            // Devolvemos el objeto JSON
            return datos;
        })
            .then(datos => {
                if(datos.OwnerId == idVendedor){
                    //Guardamos en un array de objetos los datos de las reservas
                    let Subject = datos.Subject;
                    let ActivityDate = datos.ActivityDate;
                    let EndDate = datos.EndDate;
                    let evento = {
                        Subject: Subject,
                        ActivityDate: ActivityDate,
                        EndDate: EndDate
                    }
                    eventos.push(evento);      
                }
            }).finally(() => {
                if(eventos.length == 0){
                    let noReservas = "No hay reservas para este vendedor";
                    document.getElementById("proximaCita").innerHTML = noReservas;
                }else{
                    proximasCitas();
                    mostrarEnCalendario();
                }
            });
    });
    
    
    
}

function proximasCitas() {
    let proximaCita = document.getElementById("proximaCita");
    let horas = document.getElementById("horas");
    proximaCita.innerHTML = "";
    horas.innerHTML = "";
    //Ordenamo los eventos por fecha
    eventos.sort((a, b) => {
        if (a.ActivityDate > b.ActivityDate) {
            return 1;
        }
        if (a.ActivityDate < b.ActivityDate) {
            return -1;
        }
        return 0;
    });
// Obtenemos la fecha de la proxima cita a partir de la fecha actual
    let fechaActual = new Date();
    let fechaActualFormateada = fechaActual.getFullYear() + "-" + (fechaActual.getMonth() + 1) + "-" + fechaActual.getDate();
   for(let i = 0; i < eventos.length; i++){
            let fecha = eventos[i].ActivityDate;
            let fechaArray = fecha.split("-");
            let fechaFormateada = fechaArray[2] + "/" + fechaArray[1] + "/" + fechaArray[0];

            if (fechaActualFormateada < fecha) {
                proximaCita.innerHTML = "Cita reservada más proxima: " + fechaFormateada;
            }
            proximaCita.innerHTML = "Cita reservada más proxima: " + fechaFormateada;
   }
    
}

//     //mostrar en el calendario
function mostrarEnCalendario(){
    // Mostramos en la celda del calendario los eventos que tenemos guardado en el array de objetos
    let calendarEl = document.getElementById('calendar');
    let fechas = [];
    for(let i = 0; i < eventos.length; i++){
        let fecha = eventos[i].ActivityDate;
        let fechaArray = fecha.split("-");
        let fechaFormateada = fechaArray[2] + "/" + fechaArray[1] + "/" + fechaArray[0];
        fechas.push(fechaFormateada);
    }
    let calendar = new FullCalendar.Calendar(calendarEl, {});
    calendar.render();
    for(let i = 0; i < eventos.length; i++){
        console.log("aqui"+eventos[i]);
        calendar.select(eventos[i], eventos[i]);
    }
    
    
    // let longitud = eventos.length;
    
    // let calendar = new FullCalendar.Calendar(calendarEl, {
    //     initialView: 'dayGridMonth',
    //     events: 
        
    //     [
    //         {
    //             title: window.nombreVendedor,
    //             start: eventos[0].ActivityDate,
    //             end: eventos[0].EndDate
    //        },
    //           {
    //             title: window.nombreVendedor,
    //             start: eventos[1].ActivityDate,
    //             end: eventos[1].EndDate
    //           },
    //             {
    //             title: window.nombreVendedor,
    //             start: eventos[2].ActivityDate,
    //             end: eventos[2].EndDate
    //             }
              
    //     ]
    // });
    // //Hacemos que cada celda del calendario se pueda hacer click para añadir una cita
    // calendar.on('dateClick', function (info) {
    //     console.log('Clicked on: ' + info.dateStr);
    //     console.log('Coordinates: ' + info.jsEvent.pageX + ',' + info.jsEvent.pageY);
    //     console.log('Current view: ' + info.view.type);
    //     // change the day's background color just for fun
    //     info.dayEl.style.backgroundColor = 'red';
    // });

    // calendar.render();
}


//git remote add origin https://saulaznarez@dev.azure.com/saulaznarez/agendador/_git/agendador
//git push -u origin --all
//C:\Users\saznarez\AppData\Local\Programs\Git