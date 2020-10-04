const { io } = require('../server');
const { Usuarios } = require('../classes/usuarios');
const { crearMensaje } = require('../utils/utilidades');
const usuarios = new Usuarios();
io.on('connection', (client) => {

    client.on('entrarChat', function(data, callback) {


        if (!data.nombre || !data.sala) {

            return callback({
                error: true,
                message: 'El nombre/sala es necesario'
            });
        }
        client.join(data.sala);
        usuarios.agregarPersona(client.id, data.nombre, data.sala);

        client.broadcast.to(data.sala).emit('listaPersonas', usuarios.getPersonasPorSalas(data.sala));
        client.broadcast.to(data.sala).emit('crearMensaje', crearMensaje('Administrador', `${data.nombre} se unió al chat`));
        callback(usuarios.getPersonasPorSalas(data.sala));


    })
    client.on('crearMensaje', (data, callback) => {
        let persona = usuarios.getPersona(client.id)
        let mensaje = crearMensaje(persona.nombre, data.mensaje);
        client.broadcast.to(persona.sala).emit('crearMensaje', mensaje);

        callback(mensaje);
    });
    client.on('disconnect', () => {
        let personaborrada = usuarios.borrarPersona(client.id);
        client.broadcast.to(personaborrada.sala).emit('crearMensaje', crearMensaje('Administrador', `${personaborrada.nombre} abandonó el chat`));
        client.broadcast.to(personaborrada.sala).emit('listaPersonas', usuarios.getPersonasPorSalas(personaborrada.sala));

    });

    client.on('mensajePrivado', (data) => {

        let persona = usuarios.getPersona(client.id);
        client.broadcast.to(data.para).emit('mensajePrivado', crearMensaje(persona.nombre, data.mensaje));

    })
});