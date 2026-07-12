/**
 * Auth layer — JWT helpers and role constants.
 * Request auth middleware lives in middleware/src (auth, role, adminAuth).
 * OTP login business logic lives in services/src (auth, otp).
 */
export {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
} from '../../utils/src/jwt';

export { USER_ROLES, ADMIN_ROLES, type UserRole, type AdminRole } from './roles';
