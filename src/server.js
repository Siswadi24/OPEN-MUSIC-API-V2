//Mengimpor dotenv dan juga menjalankan konfigurasinya
require('dotenv').config();

const Hapi = require('@hapi/hapi');
const Jwt = require('@hapi/jwt');

//<<<<<<< HEAD

//songs
//>>>>>> 8a460fdc707ffb8dc2cd941e11f551ff74ed705f
const songs = require('./api/songs');
const SongsService = require('./services/postgres/SongsService');
const SongsValidator = require('./validator/songs');


//users
const users = require('./api/users');
const UsersService = require('./services/postgres/UsersService');
const UsersValidator = require('./validator/users');


//authentications
const authentications = require('./api/authentications');
const AuthenticationsService = require('./services/postgres/AuthenticationsService');
const TokenManager = require('./tokenize/TokenManager');
const AuthenticationsValidator = require('./validator/authentications');



//>>>>>>> 8a460fdc707ffb8dc2cd941e11f551ff74ed705f
const init = async () => {
    const songsService = new SongsService();
    const usersService = new UsersService();
    const authenticationsService = new AuthenticationsService();

    const server = Hapi.server({
        port: process.env.PORT,
        host: process.env.HOST,
        routes: {
            cors: {
                origin: ['*'],
            },
        },
    });

    //registrasi plugin eksternal
    await server.register([
        {
            plugin: Jwt,
        },
    ]);

    //Mendefinisikan strategy autentikasi jwt
    server.auth.strategy('playlistapp_jwt', 'jwt', {
        keys: process.env.ACCESS_TOKEN_KEY,
        verify: {
            aud: false,
            iss: false,
            sub: false,
            maxAgeSec: process.env.ACCESS_TOKEN_AGE,
        },
        validate: (artifacts) => ({
            isValid: true,
            credentials: {
                id: artifacts.decoded.payload.id,
            },
        }),
    });

    await server.register([
        {
            plugin: songs,
            options: {
                //<<<<<<< HEAD
                service: songsService,
                //=======
                //>>>>>>> d5252d735039f87cea2b51615d67027ea0fa6907
                validator: SongsValidator,
            },
        },
        {
            plugin: users,
            options: {
                service: usersService,
                validator: UsersValidator,
            },
        },
        {
            plugin: authentications,
            options: {
                authenticationsService,
                usersService,
                tokenManager: TokenManager,
                validator: AuthenticationsValidator,
            },
        },
    ]);

    await server.start();
    console.log(`Server berjalan pada ${server.info.uri}`);
};

init();