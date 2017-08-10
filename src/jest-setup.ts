import {container} from './inversify.config';
import * as winston from 'winston';

// == DI
// load DI container, as "reflect-metadata" is required to run the tests
container;


// == configure logger
winston.remove(winston.transports.Console);