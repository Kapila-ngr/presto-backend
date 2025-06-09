import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { getRepository } from 'typeorm';
import { Driver } from '../entities/Driver';
import bcrypt from 'bcrypt';

passport.use('driver-local', new LocalStrategy(
  {
    usernameField: 'email', // or 'email' if you want
    passwordField: 'password',
  },
  async (email, password, done) => {
    try {
      const driverRepo = getRepository(Driver);
      const driver = await driverRepo.findOne({ where: { email } });
      if (!driver) return done(null, false, { message: 'Incorrect phone number.' });

      const isMatch = await bcrypt.compare(password, driver.password);
      if (!isMatch) return done(null, false, { message: 'Incorrect password.' });

      // Never return password
      const { password: _, ...driverSafe } = driver;
      return done(null, driverSafe);
    } catch (err) {
      return done(err);
    }
  }
));

passport.serializeUser((user: any, done) => done(null, user.id));
passport.deserializeUser(async (id: string, done) => {
  try {
    const driverRepo = getRepository(Driver);
    const driver = await driverRepo.findOne({ where: { id } });
    if (driver) {
      const { password, ...driverSafe } = driver;
      done(null, driverSafe);
    } else {
      done(null, false);
    }
  } catch (err) {
    done(err);
  }
});

export default passport;