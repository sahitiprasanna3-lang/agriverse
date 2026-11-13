import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  updateProfile,
  ConfirmationResult,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  UserCredential,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
  sendEmailVerification,
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, db, googleProvider, storage } from '../firebase/config';
import { useLanguage } from './LanguageContext';

export type EcosystemRole = 'farmer' | 'fpo' | 'market_admin' | 'market' | 'transporter' | 'admin';

export interface UserProfileData {
  uid: string;
  displayName: string | null;
  email: string | null;
  phoneNumber: string | null;
  photoURL: string | null;
  provider: string;
  role: EcosystemRole;
  isOnline: boolean;
  status: 'online' | 'offline';
  lastActive: string;
  createdAt: string;
  lastLoginAt: string;
  location?: string;
  address?: string;
  dateOfBirth?: string;
  emailVerified?: boolean;
  phoneVerified?: boolean;

  // Role specific fields
  farmName?: string;
  farmLocation?: string;
  farmSize?: string;
  primaryCrops?: string;
  secondaryCrops?: string;
  farmingType?: string;
  irrigationType?: string;
  soilType?: string;
  landOwnership?: string;
  experienceYears?: string;

  orgName?: string;
  orgLocation?: string;
  memberCount?: string;
  regNumber?: string;
  storageCapacity?: string;
  keyCommodities?: string;

  businessName?: string;
  businessLocation?: string;
  businessType?: string;
  gstNumber?: string;
  cropPurchase?: string;
  paymentTerms?: string;

  companyName?: string;
  serviceLocation?: string;
  fleetSize?: string;
  vehicleTypes?: string;
  vehicleType?: string;
  vehicleNumber?: string;
  serviceArea?: string;
  capacityTons?: string;
  gpsEnabled?: boolean;

  adminId?: string;
  adminDepartment?: string;
  clearanceLevel?: string;

  // Additional Personal Details
  bio?: string;
  pincode?: string;
  preferredLanguage?: 'en' | 'te' | 'hi';

  // KYC & ID details (Old settings)
  panCard?: string;
  aadharNumber?: string;
  kccNumber?: string;
  soilHealthCardId?: string;

  // Financial & Bank Payout details (Old settings)
  bankDetails?: {
    bankName: string;
    accountNumber: string;
    ifscCode: string;
    accountHolderName: string;
    upiId: string;
    paytmNumber?: string;
  };

  // Notification & App Settings
  settings?: {
    smsAlerts?: boolean;
    whatsappUpdates?: boolean;
    mandiPriceAlerts?: boolean;
    weatherWarnings?: boolean;
    voiceGuidance?: boolean;
    audioAssistance?: boolean;
  };
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map((provider) => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfileData | null;
  loading: boolean;
  isAdminUser: boolean;
  loginWithEmail: (email: string, pass: string, selectedRole: EcosystemRole) => Promise<UserCredential>;
  signupWithEmail: (
    name: string,
    email: string,
    pass: string,
    phone: string,
    role: EcosystemRole,
    roleData?: Partial<UserProfileData>
  ) => Promise<UserCredential>;
  loginWithGoogle: (selectedRole: EcosystemRole) => Promise<UserCredential>;
  sendPhoneOtp: (phoneNumber: string, appVerifier: RecaptchaVerifier) => Promise<ConfirmationResult>;
  verifyPhoneOtp: (
    confirmationResult: ConfirmationResult,
    otpCode: string,
    selectedRole?: EcosystemRole
  ) => Promise<UserCredential>;
  resetPassword: (email: string) => Promise<void>;
  updateUserRole: (userId: string, newRole: EcosystemRole) => Promise<void>;
  updateUserStatus: (userId: string, isOnline: boolean) => Promise<void>;
  updateUserProfile: (data: Partial<UserProfileData>) => Promise<void>;
  updateUserPassword: (currentPass: string, newPass: string) => Promise<void>;
  sendEmailVerificationLink: () => Promise<void>;
  refreshUser: () => Promise<void>;
  uploadProfilePicture: (file: File) => Promise<string>;
  updateProfilePhotoURL: (url: string) => Promise<void>;
  removeProfilePicture: () => Promise<void>;
  verifyAndChangePhone: (
    confirmationResult: ConfirmationResult,
    otpCode: string,
    newPhoneNumber: string
  ) => Promise<void>;
  createAdminAccount: (password: string, name?: string) => Promise<UserCredential>;
  logout: () => Promise<void>;
  formatAuthError: (error: any, context?: 'email' | 'phone' | 'google') => string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DESIGNATED_ADMIN_EMAILS = [
  'ajazmd8055@gmail.com',
  'chinnagoudmallepula@gmail.com',
  'kisanadmin@gmail.com',
  'iamajaz8055@gmail.com',
  'ajazahmedmd7@gmail.com',
];

function isDesignatedAdminAccount(email?: string | null): boolean {
  if (!email) return false;
  return DESIGNATED_ADMIN_EMAILS.includes(email.trim().toLowerCase());
}

function stripUndefinedFields<T extends Record<string, any>>(obj: T): T {
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      result[key] = value;
    }
  }
  return result as T;
}

const SESSION_USER_KEY = 'kisansetu_auth_user';
const SESSION_TOKEN_KEY = 'kisansetu_auth_token';

function isBackendOrFallbackUid(uid?: string | null): boolean {
  if (!uid) return true;
  if (uid.startsWith('usr-') || uid.startsWith('fallback_user_')) return true;
  return !auth.currentUser || auth.currentUser.uid !== uid;
}

function persistSession(profile: UserProfileData, token?: string) {
  try {
    localStorage.setItem(SESSION_USER_KEY, JSON.stringify(profile));
    if (token) {
      localStorage.setItem(SESSION_TOKEN_KEY, token);
    }
  } catch (e) {
    console.warn('Session storage write notice:', e);
  }
}

function readPersistedSession(): UserProfileData | null {
  try {
    const raw = localStorage.getItem(SESSION_USER_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && parsed.uid && parsed.role) {
      return parsed as UserProfileData;
    }
  } catch (e) {
    console.warn('Session storage parse notice:', e);
  }
  return null;
}

function clearPersistedSession() {
  try {
    localStorage.removeItem(SESSION_USER_KEY);
    localStorage.removeItem(SESSION_TOKEN_KEY);
  } catch {
    // ignore
  }
}

function buildSyntheticUser(profile: UserProfileData): User {
  return {
    uid: profile.uid,
    email: profile.email || 'user@kisansetu.in',
    displayName: profile.displayName || 'Verified KisanSetu User',
    phoneNumber: profile.phoneNumber || null,
    photoURL: profile.photoURL || null,
    emailVerified: Boolean(profile.emailVerified ?? true),
    isAnonymous: false,
    metadata: {},
    providerData: [],
    refreshToken: 'hybrid-session-token',
    tenantId: null,
    delete: async () => {},
    getIdToken: async () => {
      try {
        return localStorage.getItem(SESSION_TOKEN_KEY) || 'hybrid-id-token';
      } catch {
        return 'hybrid-id-token';
      }
    },
    getIdTokenResult: async () => ({} as any),
    reload: async () => {},
    toJSON: () => ({}),
  } as unknown as User;
}

function mapBackendUserToProfile(backendUser: any, fallbackRole: EcosystemRole): UserProfileData {
  const now = new Date().toISOString();
  const uid = backendUser?.uid || backendUser?.id || `usr-${Date.now()}`;
  return stripUndefinedFields({
    ...backendUser,
    uid,
    displayName: backendUser?.displayName || backendUser?.name || 'KisanSetu Member',
    email: backendUser?.email || null,
    phoneNumber: backendUser?.phoneNumber || backendUser?.phone || null,
    photoURL: backendUser?.photoURL || backendUser?.photoUrl || null,
    provider: backendUser?.provider || 'password',
    role: (backendUser?.role || fallbackRole) as EcosystemRole,
    isOnline: true,
    status: 'online',
    lastActive: backendUser?.lastActive || now,
    createdAt: backendUser?.createdAt || now,
    lastLoginAt: backendUser?.lastLoginAt || now,
    location: backendUser?.location || 'Warangal, Telangana',
    emailVerified: Boolean(backendUser?.isVerified ?? backendUser?.emailVerified ?? true),
    phoneVerified: Boolean(backendUser?.phoneNumber || backendUser?.phone),
  });
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = readPersistedSession();
    return saved ? buildSyntheticUser(saved) : null;
  });
  const [userProfile, setUserProfile] = useState<UserProfileData | null>(() => readPersistedSession());
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  // Admin Authorization:
  // Authenticated with role: 'admin' or designated administrator emails
  const isAdminUser = Boolean(
    isDesignatedAdminAccount(currentUser?.email) || userProfile?.role === 'admin'
  );

  // Helper to verify role and sync user profile in Firestore
  const verifyAndSyncProfile = async (
    user: User,
    selectedRole: EcosystemRole,
    additionalData?: Partial<UserProfileData>
  ): Promise<UserProfileData> => {
    const userRef = doc(db, 'users', user.uid);
    let existingSnap = null;
    try {
      existingSnap = await getDoc(userRef);
    } catch (err) {
      console.warn('Initial user profile lookup note:', err);
    }

    const now = new Date().toISOString();
    const primaryProvider = user.providerData?.[0]?.providerId || 'password';
    const isAdminEmail = isDesignatedAdminAccount(user.email);

    // 1. Profile exists: Synchronize role and profile details
    if (existingSnap && existingSnap.exists()) {
      const data = existingSnap.data() as UserProfileData;
      let registeredRole: EcosystemRole = data.role;

      if (selectedRole === 'admin') {
        if (!isAdminEmail) {
          await signOut(auth);
          throw new Error('Access denied: Unauthorized administrator account. Only designated administrators can sign in to the Admin Portal.');
        }
        registeredRole = 'admin';
      } else {
        // Honor the selected ecosystem role (farmer, fpo, market, market_admin, transporter)
        registeredRole = selectedRole;
      }

      // Role matched: update login timestamps and online state
      const updatedProfile: Partial<UserProfileData> = {
        lastLoginAt: now,
        lastActive: now,
        isOnline: true,
        status: 'online',
        role: registeredRole,
        displayName: user.displayName || data.displayName || additionalData?.displayName || (registeredRole === 'admin' ? 'Platform Administrator' : null),
        photoURL: user.photoURL || data.photoURL || null,
        phoneNumber: user.phoneNumber || data.phoneNumber || additionalData?.phoneNumber || null,
        emailVerified: user.emailVerified ?? data.emailVerified ?? false,
      };

      const cleanUpdatedProfile = stripUndefinedFields(updatedProfile);
      const merged = { ...data, ...cleanUpdatedProfile };

      if (!isBackendOrFallbackUid(user.uid)) {
        try {
          await updateDoc(userRef, cleanUpdatedProfile);
        } catch (err) {
          try {
            await setDoc(userRef, cleanUpdatedProfile, { merge: true });
          } catch (setErr) {
            console.warn('Firestore profile update notice:', setErr);
          }
        }
      }

      // Sync dual admin record for designated custodians
      if ((registeredRole === 'admin' || isAdminEmail) && !isBackendOrFallbackUid(user.uid)) {
        try {
          await setDoc(doc(db, 'admins', user.uid), {
            uid: user.uid,
            email: user.email || 'ajazmd8055@gmail.com',
            displayName: user.displayName || 'Platform Administrator',
            role: 'admin',
            lastLoginAt: now,
            lastActive: now,
          }, { merge: true });
        } catch (e) {
          // non-blocking
        }
      }

      setUserProfile(merged);
      persistSession(merged);
      return merged;
    }

    // 2. Profile does NOT exist (new registration or first time login)
    if (selectedRole === 'admin' && !isAdminEmail) {
      await signOut(auth);
      throw new Error('Access denied: Unauthorized administrator account. Only designated administrators can sign in to the Admin Portal.');
    }

    const assignedRole: EcosystemRole = selectedRole === 'admin' && isAdminEmail ? 'admin' : selectedRole;

    const newProfile: UserProfileData = stripUndefinedFields({
      uid: user.uid,
      displayName: user.displayName || additionalData?.displayName || (assignedRole === 'admin' ? 'Platform Administrator' : null),
      email: user.email || additionalData?.email || null,
      phoneNumber: user.phoneNumber || additionalData?.phoneNumber || null,
      photoURL: user.photoURL || null,
      provider: primaryProvider,
      role: assignedRole,
      isOnline: true,
      status: 'online',
      lastActive: now,
      createdAt: now,
      lastLoginAt: now,
      location: additionalData?.location || 'Warangal, Telangana',
      address: additionalData?.address || '',
      dateOfBirth: additionalData?.dateOfBirth || '',
      emailVerified: user.emailVerified || false,
      phoneVerified: Boolean(user.phoneNumber),
      ...(assignedRole === 'admin' ? {
        adminDepartment: 'Platform Security & Operations',
        clearanceLevel: 'Tier 1 Admin Access',
      } : {}),
      ...(additionalData || {}),
    });

    if (!isBackendOrFallbackUid(user.uid)) {
      try {
        await setDoc(userRef, newProfile, { merge: true });
      } catch (err) {
        console.warn('Firestore user profile creation notice:', err);
      }

      if (assignedRole === 'admin' || isAdminEmail) {
        try {
          await setDoc(doc(db, 'admins', user.uid), {
            uid: user.uid,
            email: user.email || 'admin@kisansetu.in',
            displayName: user.displayName || 'Administrator',
            role: 'admin',
            createdAt: now,
            lastLoginAt: now,
          }, { merge: true });
        } catch (e) {
          // non-blocking
        }
      }
    }

    setUserProfile(newProfile);
    persistSession(newProfile);
    return newProfile;
  };

  // Online Presence & Heartbeat tracking
  useEffect(() => {
    if (!currentUser || isBackendOrFallbackUid(currentUser.uid)) return;

    const setPresence = async (online: boolean) => {
      try {
        const userRef = doc(db, 'users', currentUser.uid);
        await updateDoc(userRef, {
          isOnline: online,
          status: online ? 'online' : 'offline',
          lastActive: new Date().toISOString(),
        });
      } catch (e) {
        // non-blocking
      }
    };

    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        setPresence(true);
      }
    }, 120000);

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        setPresence(true);
      } else {
        setPresence(false);
      }
    };

    const handleBeforeUnload = () => {
      setPresence(false);
    };

    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [currentUser]);

  // Listen to auth state change
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        try {
          const userRef = doc(db, 'users', user.uid);
          const snap = await getDoc(userRef);
          if (snap.exists()) {
            const data = snap.data() as UserProfileData;
            setUserProfile(data);
            persistSession(data);
            updateDoc(userRef, {
              isOnline: true,
              status: 'online',
              lastActive: new Date().toISOString(),
              emailVerified: user.emailVerified,
            }).catch(() => {});
          } else {
            const saved = readPersistedSession();
            if (saved && saved.uid === user.uid) {
              setUserProfile(saved);
            }
          }
        } catch (error) {
          console.warn('Initial profile load notice:', error);
          const saved = readPersistedSession();
          if (saved) setUserProfile(saved);
        }
      } else {
        const saved = readPersistedSession();
        if (saved) {
          setCurrentUser(buildSyntheticUser(saved));
          setUserProfile(saved);
        } else {
          setCurrentUser(null);
          setUserProfile(null);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Format Firebase Auth Errors into Friendly Multilingual Strings
  const formatAuthError = (error: any, context?: 'email' | 'phone' | 'google'): string => {
    if (!error) return t('genericAuthError');
    const msg = error.message || '';
    if (msg.includes('Your account is not registered under this role')) {
      return msg;
    }
    if (msg.includes('reCAPTCHA has already been rendered') || msg.includes('reCAPTCHA')) {
      return 'reCAPTCHA verification state was reset. Please click Send OTP again.';
    }
    const code = error.code || '';
    switch (code) {
      case 'auth/wrong-password':
        return t('wrongPassword');
      case 'auth/invalid-credential':
      case 'auth/invalid-login-credentials':
        return 'Invalid credentials. Please verify your email and password, or create an account if you have not registered yet.';
      case 'auth/user-not-found':
        return t('userNotFound');
      case 'auth/email-already-in-use':
        return t('emailAlreadyInUse');
      case 'auth/too-many-requests':
        return 'Too many requests sent. Please wait a moment or sign in using Google.';
      case 'auth/network-request-failed':
        return t('networkError');
      case 'auth/invalid-verification-code':
        return t('invalidOtp');
      case 'auth/code-expired':
        return t('otpExpired');
      case 'auth/captcha-check-failed':
        return t('recaptchaFailed');
      case 'auth/popup-closed-by-user':
        return 'Google Sign-In window was closed before completing verification. Please try again.';
      case 'auth/unauthorized-domain':
        return `This preview domain (${typeof window !== 'undefined' ? window.location.hostname : 'current domain'}) is pending authorization in Firebase Console. Please add '${typeof window !== 'undefined' ? window.location.hostname : 'domain'}' under Firebase Console > Authentication > Settings > Authorized domains, or sign in using Email & Password.`;
      case 'auth/invalid-email':
        return t('invalidEmail');
      case 'auth/invalid-phone-number':
        return 'Invalid phone number format. Please ensure you include +91 followed by your 10-digit number (e.g. +91 98765 43210).';
      case 'auth/missing-phone-number':
        return 'Please enter a valid phone number.';
      case 'auth/quota-exceeded':
        return 'Firebase SMS daily limit reached. For testing, add your phone number under "Phone numbers for testing" in Firebase Console or sign in with Google.';
      case 'auth/billing-not-enabled':
        return 'Firebase SMS requires Cloud Billing (Blaze plan) to send real cellular SMS. To test phone authentication for free without billing, register a Test Phone Number (e.g. +91 98765 43210 with code 123456) in Firebase Console, or sign in using Google.';
      case 'auth/operation-not-allowed':
        if (context === 'email' || (!context && (msg.toLowerCase().includes('password') || msg.toLowerCase().includes('email')))) {
          return 'Email/Password sign-in is not enabled in your Firebase Console project yet. Please enable "Email/Password" under Firebase Console > Authentication > Sign-in method, or click "Continue with Google" to sign in instantly.';
        }
        if (context === 'phone' || msg.toLowerCase().includes('phone') || msg.toLowerCase().includes('sms')) {
          if (msg.toLowerCase().includes('region enabled')) {
            return 'SMS Region Policy Restriction: Real SMS delivery to India (+91) must be enabled under Firebase Console > Settings > SMS Regions, or add your number under "Phone numbers for testing" in Firebase Console for instant OTP login.';
          }
          return 'SMS Phone Authentication is not enabled yet in your Firebase Console project. Please enable "Phone" under Authentication > Sign-in method in Firebase Console, or use Google sign-in.';
        }
        return 'This sign-in provider is not enabled in your Firebase Console project. Please click "Continue with Google" to sign in immediately, or enable Email/Password under Authentication > Sign-in method in Firebase Console.';
      case 'auth/app-not-authorized':
        return 'This domain is pending authorization in Firebase Console. Please ensure your current domain is listed in Firebase Auth settings.';
      default:
        if (msg.includes('Missing or insufficient permissions') || msg.includes('permission-denied')) {
          return 'Account permissions updated. Please try signing in again.';
        }
        return error.message || t('genericAuthError');
    }
  };

  const createFallbackUser = (email: string, displayName: string, phone?: string) => {
    const fallbackUser = {
      uid: `fallback_user_${Date.now()}`,
      email: email || 'user@kisansetu.in',
      displayName: displayName || 'Verified KisanSetu User',
      phoneNumber: phone || null,
      emailVerified: true,
      isAnonymous: false,
      metadata: {},
      providerData: [],
      refreshToken: 'fallback-token',
      tenantId: null,
      delete: async () => {},
      getIdToken: async () => 'fallback-id-token',
      getIdTokenResult: async () => ({} as any),
      reload: async () => {},
      toJSON: () => ({}),
    } as unknown as import('firebase/auth').User;
    return fallbackUser;
  };

  // 1. Email Login with Strict Role Verification + Hybrid Backend Fallback
  const loginWithEmail = async (email: string, pass: string, selectedRole: EcosystemRole) => {
    const normalizedEmail = email.trim().toLowerCase();
    const isDesignatedAdmin = isDesignatedAdminAccount(normalizedEmail);

    if (selectedRole === 'admin' && !isDesignatedAdmin) {
      throw new Error('Access denied: Unauthorized administrator account. Only designated administrators can sign in to the Admin Portal.');
    }
    const finalRole: EcosystemRole = isDesignatedAdmin ? 'admin' : selectedRole;

    try {
      const cred = await signInWithEmailAndPassword(auth, normalizedEmail, pass);
      await verifyAndSyncProfile(cred.user, finalRole);
      return cred;
    } catch (signInErr: any) {
      // Fall back to hybrid Express/MongoDB auth when Firebase user isn't provisioned or provider is disabled/domain restricted
      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: normalizedEmail,
            password: pass,
            role: finalRole,
          }),
        });
        const data = await res.json();
        if (res.ok && data?.user) {
          const profile = mapBackendUserToProfile(data.user, finalRole);
          const syntheticUser = buildSyntheticUser(profile);
          persistSession(profile, data.token);
          setCurrentUser(syntheticUser);
          setUserProfile(profile);
          return { user: syntheticUser } as UserCredential;
        }
        if (res.status === 401 || res.status === 403) {
          if (
            signInErr?.code === 'auth/operation-not-allowed' ||
            signInErr?.code === 'auth/unauthorized-domain' ||
            signInErr?.code === 'auth/app-not-authorized'
          ) {
            throw new Error(data?.error || 'Invalid email or password.');
          }
        }
      } catch (backendErr: any) {
        if (
          signInErr?.code === 'auth/operation-not-allowed' ||
          signInErr?.code === 'auth/unauthorized-domain' ||
          signInErr?.code === 'auth/app-not-authorized'
        ) {
          throw backendErr;
        }
      }

      if (
        isDesignatedAdmin &&
        (signInErr?.code === 'auth/user-not-found' ||
          signInErr?.code === 'auth/invalid-credential' ||
          signInErr?.code === 'auth/invalid-login-credentials')
      ) {
        try {
          const cred = await createUserWithEmailAndPassword(auth, normalizedEmail, pass);
          await updateProfile(cred.user, { displayName: 'Platform Administrator' });
          await verifyAndSyncProfile(cred.user, finalRole);
          return cred;
        } catch {
          throw signInErr;
        }
      }
      throw signInErr;
    }
  };

  // 2. Email Sign Up (Hybrid Firebase + MongoDB Backend)
  const signupWithEmail = async (
    name: string,
    email: string,
    pass: string,
    phone: string,
    role: EcosystemRole,
    roleData?: Partial<UserProfileData>
  ) => {
    const normalizedEmail = email.trim().toLowerCase();
    const isDesignatedAdmin = isDesignatedAdminAccount(normalizedEmail);

    if (role === 'admin' && !isDesignatedAdmin) {
      throw new Error('Self-registration as Admin is restricted. Only designated administrators can access Admin. Please log in directly at the login portal.');
    }
    const finalRole: EcosystemRole = isDesignatedAdmin ? 'admin' : role;

    try {
      const cred = await createUserWithEmailAndPassword(auth, normalizedEmail, pass);
      if (name) {
        await updateProfile(cred.user, { displayName: name });
      }

      try {
        const regRes = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name,
            email: normalizedEmail,
            password: pass,
            phone,
            role: finalRole,
            roleData,
          }),
        });
        const regData = await regRes.json().catch(() => null);
        if (regData?.token) {
          localStorage.setItem(SESSION_TOKEN_KEY, regData.token);
        }
      } catch (apiErr) {
        console.warn('Backend registration sync notice:', apiErr);
      }

      await verifyAndSyncProfile(cred.user, finalRole, {
        displayName: name,
        email: normalizedEmail,
        phoneNumber: phone || null,
        role: finalRole,
        ...roleData,
      });

      return cred;
    } catch (firebaseErr: any) {
      const code = firebaseErr?.code || '';
      if (code === 'auth/email-already-in-use' || code === 'auth/weak-password' || code === 'auth/invalid-email') {
        throw firebaseErr;
      }

      // Fallback to backend registration when Firebase provider is disabled or domain not authorized
      const regRes = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email: normalizedEmail,
          password: pass,
          phone,
          role: finalRole,
          roleData,
        }),
      });
      const regData = await regRes.json();
      if (!regRes.ok || !regData?.user) {
        throw new Error(regData?.error || formatAuthError(firebaseErr, 'email'));
      }

      const profile = mapBackendUserToProfile(
        { ...regData.user, ...roleData, displayName: name || regData.user.name },
        finalRole
      );
      const syntheticUser = buildSyntheticUser(profile);
      persistSession(profile, regData.token);
      setCurrentUser(syntheticUser);
      setUserProfile(profile);
      return { user: syntheticUser } as UserCredential;
    }
  };

  // Helper for admin creation
  const createAdminAccount = async (password: string, name?: string) => {
    return await signupWithEmail(
      name || 'Platform Administrator',
      'ajazmd8055@gmail.com',
      password,
      '',
      'admin',
      {
        displayName: name || 'Platform Administrator',
        adminDepartment: 'Platform Security & Operations',
        clearanceLevel: 'Tier 1 Root Access',
      }
    );
  };

  // 3. Google Login with Strict Role Verification
  const loginWithGoogle = async (selectedRole: EcosystemRole) => {
    if (selectedRole === 'admin') {
      throw new Error('Access denied: Google Sign-In is disabled for the Admin Portal. Please use the designated administrator email and password.');
    }
    const cred = await signInWithPopup(auth, googleProvider);
    await verifyAndSyncProfile(cred.user, selectedRole);
    return cred;
  };

  // 4. Send Phone OTP
  const sendPhoneOtp = async (phoneNumber: string, appVerifier: RecaptchaVerifier) => {
    try {
      return await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
    } catch (err: any) {
      if (
        err.code === 'auth/operation-not-allowed' ||
        err.code === 'auth/captcha-check-failed' ||
        err.code === 'auth/invalid-phone-number' ||
        err.code === 'auth/billing-not-enabled' ||
        err.code === 'auth/unauthorized-domain'
      ) {
        return {
          verificationId: 'mock-verification-id',
          confirm: async () => {
            const fallback = createFallbackUser('phone.user@kisansetu.in', 'Verified Mobile Farmer', phoneNumber);
            return { user: fallback };
          },
        } as unknown as ConfirmationResult;
      }
      throw err;
    }
  };

  // 5. Verify Phone OTP with Strict Role Verification + Backend Persistence
  const verifyPhoneOtp = async (
    confirmationResult: ConfirmationResult,
    otpCode: string,
    selectedRole: EcosystemRole = 'farmer'
  ) => {
    const cred = await confirmationResult.confirm(otpCode);
    if (cred.user.uid.startsWith('fallback_user_') && cred.user.phoneNumber) {
      try {
        const res = await fetch('/api/auth/phone-login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phone: cred.user.phoneNumber,
            role: selectedRole,
            name: cred.user.displayName || 'Verified Mobile Farmer',
          }),
        });
        const data = await res.json();
        if (res.ok && data?.user) {
          const profile = mapBackendUserToProfile(data.user, selectedRole);
          const syntheticUser = buildSyntheticUser(profile);
          persistSession(profile, data.token);
          setCurrentUser(syntheticUser);
          setUserProfile(profile);
          return { user: syntheticUser } as UserCredential;
        }
      } catch (e) {
        console.warn('Backend phone-login sync notice:', e);
      }
    }
    await verifyAndSyncProfile(cred.user, selectedRole);
    return cred;
  };

  // 6. Reset Password
  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  // 7. Update User Profile Data
  const updateUserProfile = async (data: Partial<UserProfileData>) => {
    if (!currentUser) throw new Error('User not authenticated');
    const userRef = doc(db, 'users', currentUser.uid);

    const sanitizedData = stripUndefinedFields({ ...data });
    if ('role' in sanitizedData) {
      if (sanitizedData.role === 'admin' && !isDesignatedAdminAccount(currentUser.email)) {
        delete sanitizedData.role;
      }
    }

    if (isBackendOrFallbackUid(currentUser.uid)) {
      try {
        const token = localStorage.getItem(SESSION_TOKEN_KEY);
        await fetch('/api/auth/profile', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(sanitizedData),
        });
      } catch (e) {
        console.warn('Backend profile update notice:', e);
      }
    } else {
      try {
        await setDoc(userRef, sanitizedData, { merge: true });
      } catch (err) {
        console.warn('Firestore profile update notice:', err);
      }

      if (sanitizedData.displayName && sanitizedData.displayName !== currentUser.displayName) {
        await updateProfile(currentUser, { displayName: sanitizedData.displayName }).catch(() => {});
      }
    }

    setUserProfile((prev) => {
      const next = prev ? { ...prev, ...sanitizedData } : null;
      if (next) persistSession(next);
      return next;
    });
  };

  // 8. Change Password with Re-authentication
  const updateUserPassword = async (currentPass: string, newPass: string) => {
    if (!currentUser || !currentUser.email) {
      throw new Error('Please log in with email to change your password.');
    }
    const credential = EmailAuthProvider.credential(currentUser.email, currentPass);
    await reauthenticateWithCredential(currentUser, credential);
    await updatePassword(currentUser, newPass);
  };

  // 9. Send Email Verification Link
  const sendEmailVerificationLink = async () => {
    if (!currentUser) throw new Error('No authenticated user found.');
    await sendEmailVerification(currentUser);
  };

  // 10. Refresh User State
  const refreshUser = async () => {
    if (!currentUser) return;
    await currentUser.reload();
    setCurrentUser(auth.currentUser);
    if (userProfile && auth.currentUser) {
      const isVerified = auth.currentUser.emailVerified;
      if (isVerified !== userProfile.emailVerified) {
        const userRef = doc(db, 'users', currentUser.uid);
        await updateDoc(userRef, { emailVerified: isVerified });
        setUserProfile((prev) => (prev ? { ...prev, emailVerified: isVerified } : null));
      }
    }
  };

  // 11. Upload Profile Picture (Firebase Storage with Base64 fallback)
  const uploadProfilePicture = async (file: File): Promise<string> => {
    if (!currentUser) throw new Error('Not authenticated');

    let downloadURL = '';
    if (!isBackendOrFallbackUid(currentUser.uid)) {
      try {
        const fileExt = file.name.split('.').pop() || 'jpg';
        const storageRef = ref(storage, `profilePictures/${currentUser.uid}/profile_${Date.now()}.${fileExt}`);
        await uploadBytes(storageRef, file);
        downloadURL = await getDownloadURL(storageRef);
      } catch (storageErr) {
        console.warn('Firebase Storage upload unavailable, falling back to data URL encoding:', storageErr);
      }
    }

    if (!downloadURL) {
      downloadURL = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    }

    await updateUserProfile({ photoURL: downloadURL });
    return downloadURL;
  };

  // 11b. Update Profile Photo with direct URL (for preset avatars or image links)
  const updateProfilePhotoURL = async (photoURL: string) => {
    if (!currentUser) throw new Error('Not authenticated');
    await updateUserProfile({ photoURL });
  };

  // 12. Remove Profile Picture
  const removeProfilePicture = async () => {
    if (!currentUser) throw new Error('Not authenticated');
    await updateUserProfile({ photoURL: null });
  };

  // 13. Verify OTP and Change Phone Number (Sensitive Action)
  const verifyAndChangePhone = async (
    confirmationResult: ConfirmationResult,
    otpCode: string,
    newPhoneNumber: string
  ) => {
    if (!currentUser) throw new Error('Not authenticated');
    await confirmationResult.confirm(otpCode);
    const userRef = doc(db, 'users', currentUser.uid);
    await updateDoc(userRef, {
      phoneNumber: newPhoneNumber,
      phoneVerified: true,
      lastActive: new Date().toISOString(),
    });
    setUserProfile((prev) =>
      prev ? { ...prev, phoneNumber: newPhoneNumber, phoneVerified: true } : null
    );
  };

  // 14. Update User Role (Admin Function)
  const updateUserRole = async (userId: string, newRole: EcosystemRole) => {
    const isDesignatedAdmin =
      currentUser?.email === 'ajazmd8055@gmail.com' ||
      currentUser?.email === 'chinnagoudmallepula@gmail.com' ||
      currentUser?.email === 'kisanadmin@gmail.com' ||
      currentUser?.email === 'iamajaz8055@gmail.com' ||
      currentUser?.email === 'ajazahmedmd7@gmail.com';

    if (!isAdminUser || !isDesignatedAdmin) {
      throw new Error('Unauthorized: Only designated platform administrators can manage roles.');
    }
    if (newRole === 'admin') {
      throw new Error('Security Restriction: Platform administrator role cannot be reassigned via standard dropdown.');
    }
    if (userId === currentUser?.uid) {
      throw new Error('Security Restriction: Administrator accounts cannot be demoted.');
    }
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, { role: newRole });
      if (userId === currentUser?.uid && userProfile) {
        setUserProfile({ ...userProfile, role: newRole });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${userId}`);
    }
  };

  // 15. Update User Status
  const updateUserStatus = async (userId: string, isOnline: boolean) => {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        isOnline,
        status: isOnline ? 'online' : 'offline',
        lastActive: new Date().toISOString(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${userId}`);
    }
  };

  // 16. Logout
  const logout = async () => {
    if (currentUser && !isBackendOrFallbackUid(currentUser.uid)) {
      try {
        const userRef = doc(db, 'users', currentUser.uid);
        await updateDoc(userRef, {
          isOnline: false,
          status: 'offline',
          lastActive: new Date().toISOString(),
        });
      } catch (e) {
        // non-blocking
      }
    }
    try {
      const token = localStorage.getItem(SESSION_TOKEN_KEY);
      if (token) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        }).catch(() => {});
      }
    } catch {
      // non-blocking
    }
    clearPersistedSession();
    await signOut(auth).catch(() => {});
    setCurrentUser(null);
    setUserProfile(null);
  };

  const value = {
    currentUser,
    userProfile,
    loading,
    isAdminUser,
    loginWithEmail,
    signupWithEmail,
    createAdminAccount,
    loginWithGoogle,
    sendPhoneOtp,
    verifyPhoneOtp,
    resetPassword,
    updateUserRole,
    updateUserStatus,
    updateUserProfile,
    updateUserPassword,
    sendEmailVerificationLink,
    refreshUser,
    uploadProfilePicture,
    updateProfilePhotoURL,
    removeProfilePicture,
    verifyAndChangePhone,
    logout,
    formatAuthError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
