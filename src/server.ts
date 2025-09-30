import mongoose from "mongoose";
import app from "./app";
import config from "./config";
import { errorLogger, logger } from "./shared/logger";
import colors from 'colors';
import seedSuperAdmin from "./DB";

//uncaught exception
process.on('uncaughtException', error => {
    errorLogger.error('uncaughtException Detected', error);
    process.exit(1);
});


let server: any;

async function main() {
    try {

        // create super admin
        seedSuperAdmin();

        mongoose.connect(config.database_url as string);
        logger.info(colors.green('🚀 Database connected successfully'));

        const port = typeof config.port === 'number' ? config.port : Number(config.port);

        server = app.listen(port, config.ip_address as string, () => {
            logger.info(colors.yellow(`♻️  Application listening on port:${config.port}`));
        });

    } catch (error) {
        errorLogger.error(colors.red('🤢 Failed to connect Database'));
    }

    //handle unhandledRejection
    process.on('unhandledRejection', error => {
        if (server) {
            server.close(() => {
                errorLogger.error('UnhandledRejection Detected', error);
                process.exit(1);
            });
        } else {
            process.exit(1);
        }
    });
}

main();

//SIGTERM
process.on('SIGTERM', () => {
    logger.info('SIGTERM IS RECEIVE');
    if (server) {
        server.close();
    }
});  