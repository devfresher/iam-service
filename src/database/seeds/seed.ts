import { AppDataSource } from '../data-source';
import { Role } from '../../common/enums/role.enum';
import * as bcrypt from 'bcryptjs';
import { Auth } from '../../modules/auth/entities/auth.entity';
import * as dotenv from 'dotenv';

dotenv.config();
async function seed() {
  await AppDataSource.initialize();

  const userRepo = AppDataSource.getRepository(Auth);

  const password = process.env.ADMIN_PASSWORD || 'admin123';
  const hashedPassword = await bcrypt.hash(password, 10);

  const admin = userRepo.create({
    email: 'admin@example.com',
    password: hashedPassword,
    roles: [Role.Admin],
  });

  await userRepo.save(admin);

  console.log('Seeded successfully!');
  process.exit(0);
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
