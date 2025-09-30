import colors from 'colors';
import { User } from '../app/modules/user/user.model';
import config from '../config';
import { USER_ROLES } from '../enums/user';
import { logger } from '../shared/logger';


// create super admin data
const superUser = {
    name: 'Super',
    role: USER_ROLES.SUPER_ADMIN,
    email: config.admin.email,
    password: config.admin.password,
    verified: true
};

const seedSuperAdmin = async () => {

    // check super admin exist or not
    const isExistSuperAdmin = await User.findOne({
        role: USER_ROLES.SUPER_ADMIN,
    });

    // create super admin
    if (!isExistSuperAdmin) {
        await User.create(superUser);
        logger.info(colors.green('✔ Super admin created successfully!'));
    }

    return;
};

export default seedSuperAdmin;