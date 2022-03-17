import { Citas } from "./clases/citas.js";
import UI from "./clases/UI.js";
import {
    mascotaInput,
    propietarioInput,
    telefonoInput,
    fechaInput,
    horaInput,
    sintomasInput,
    formulario
}
    from "./selectores.js";


const administrarCitas = new Citas();
const ui = new UI(administrarCitas);

let editando = false;

export let DB;

export function baseDatos() {

    window.onload = () => {
        crearDB();
    }
}

//creando la base de datos

function crearDB() {
    //crear la base de datos 1.0
    const crearDB = window.indexedDB.open('citasModulo', 1);

    //si hay un error al crear la base de datos
    crearDB.onerror = function () {
        console.log('Hay un error');

    }

    //si se crea correctamente la base de datos
    crearDB.onsuccess = function () {
        console.log('Base de datos creada con éxito');
        //instanciamos la base de datos creada a DB
        DB = crearDB.result;
        ui.imprimirCitas();
    }


    //definimos las columnas

    crearDB.onupgradeneeded = function (e) {
        const db = e.target.result;

        const objectStore = db.createObjectStore('citasModulo', {
            keyPath: 'id',
            autoIncrement: true
        });


        //definimos todas las columnas
        objectStore.createIndex('mascota', 'mascota', { unique: false });
        objectStore.createIndex('propietario', 'propietario', { unique: false });
        objectStore.createIndex('telefono', 'telefono', { unique: false });
        objectStore.createIndex('fecha', 'fecha', { unique: false });
        objectStore.createIndex('hora', 'hora', { unique: false });
        objectStore.createIndex('sintomas', 'sintomas', { unique: false });
        objectStore.createIndex('id', 'id', { unique: true });

        console.log('Db creada y lista');

    }



}






export const citaObj = {
    mascota: '',
    propietario: '',
    telefono: '',
    fecha: '',
    hora: '',
    sintomas: ''
}


export function datosCita(e) {
    //  console.log(e.target.name) // Obtener el Input
    citaObj[e.target.name] = e.target.value;
}


export function nuevaCita(e) {
    e.preventDefault();

    const { mascota, propietario, telefono, fecha, hora, sintomas } = citaObj;

    // Validar
    if (mascota === '' || propietario === '' || telefono === '' || fecha === '' || hora === '' || sintomas === '') {
        ui.imprimirAlerta('Todos los mensajes son Obligatorios', 'error')

        return;
    }

    if (editando) {
        // Estamos editando
        administrarCitas.editarCita({ ...citaObj });


        //editar en  INdevDB
        const transaction = DB.transaction(['citasModulo'], 'readwrite');
        const objectStore = transaction.objectStore('citasModulo');
        objectStore.put(citaObj);

        objectStore.oncomplete = () => {

            ui.imprimirAlerta('Guardado Correctamente');

            formulario.querySelector('button[type="submit"]').textContent = 'Crear Cita';

            editando = false;
        }


    } else {
        // Nuevo Registrando

        // Generar un ID único
        citaObj.id = Date.now();

        // Añade la nueva cita
        administrarCitas.agregarCita({ ...citaObj });


        //Insertamos los registros en la base de datos de IndexDB
        const transaction = DB.transaction(['citasModulo'], 'readwrite');

        //agregamops el objectStore
        const objectStore = transaction.objectStore('citasModulo');

        //insertamos todos los objectos creados al indexDB
        objectStore.add(citaObj);

        //Si se completo la accionde agregar entonces
        transaction.oncomplete = function () {
            console.log('cita agregada');
            // Mostrar mensaje de que todo esta bien...
            ui.imprimirAlerta('Se agregó correctamente');
        }

    }


    // Imprimir el HTML de citas
    ui.imprimirCitas();

    // Reinicia el objeto para evitar futuros problemas de validación
    reiniciarObjeto();

    // Reiniciar Formulario
    formulario.reset();

}

export function reiniciarObjeto() {
    // Reiniciar el objeto
    citaObj.mascota = '';
    citaObj.propietario = '';
    citaObj.telefono = '';
    citaObj.fecha = '';
    citaObj.hora = '';
    citaObj.sintomas = '';
}


export function eliminarCita(id) {
    //administrarCitas.eliminarCita(id);

    const transaction = DB.transaction(['citasModulo'], 'readwrite');
    const objectStore = transaction.objectStore('citasModulo');
    objectStore.delete(id);

    transaction.oncomplete = () => {

        ui.imprimirCitas();

    }

    transaction.onerror = () => {
        console.log('Hubo un error');
    }


}

export function cargarEdicion(cita) {

    const { mascota, propietario, telefono, fecha, hora, sintomas, id } = cita;

    // Reiniciar el objeto
    citaObj.mascota = mascota;
    citaObj.propietario = propietario;
    citaObj.telefono = telefono;
    citaObj.fecha = fecha
    citaObj.hora = hora;
    citaObj.sintomas = sintomas;
    citaObj.id = id;

    // Llenar los Inputs
    mascotaInput.value = mascota;
    propietarioInput.value = propietario;
    telefonoInput.value = telefono;
    fechaInput.value = fecha;
    horaInput.value = hora;
    sintomasInput.value = sintomas;

    formulario.querySelector('button[type="submit"]').textContent = 'Guardar Cambios';

    editando = true;

}
