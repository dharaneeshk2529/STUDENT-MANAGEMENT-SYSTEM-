import net from 'net';
import { initializeApp, getApps, App } from 'firebase-admin/app';
import { getFirestore, Firestore, CollectionReference, DocumentData } from 'firebase-admin/firestore';
import { Student, StudentInput } from './types.js';

const DEFAULT_EMULATOR_PORT = 8088;

// Immediately configure FIRESTORE_EMULATOR_HOST unless explicitly running with cloud credentials
if (!process.env.FIRESTORE_EMULATOR_HOST && process.env.USE_CLOUD_FIRESTORE !== 'true') {
  process.env.FIRESTORE_EMULATOR_HOST = `127.0.0.1:${DEFAULT_EMULATOR_PORT}`;
}

let firebaseAdminApp: App | null = null;
let firestoreInstance: Firestore | null = null;
let emulatorServer: any = null;
let initPromise: Promise<Firestore> | null = null;

function isPortListening(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(250);
    socket.on('connect', () => {
      socket.destroy();
      resolve(true);
    });
    socket.on('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    socket.on('error', () => {
      resolve(false);
    });
    socket.connect(port, '127.0.0.1');
  });
}

const DEFAULT_SAMPLE_STUDENTS: StudentInput[] = [
  {
    firstName: 'Sophia',
    lastName: 'Chen',
    email: 'sophia.chen@university.edu',
    rollNumber: 'CS-2024-001',
    course: 'Computer Science',
    age: 20,
    enrollmentDate: '2024-09-01',
  },
  {
    firstName: 'Marcus',
    lastName: 'Johnson',
    email: 'marcus.j@university.edu',
    rollNumber: 'ENG-2024-042',
    course: 'Mechanical Engineering',
    age: 22,
    enrollmentDate: '2024-08-25',
  },
  {
    firstName: 'Aaliyah',
    lastName: 'Patel',
    email: 'aaliyah.p@university.edu',
    rollNumber: 'DS-2024-019',
    course: 'Data Science',
    age: 21,
    enrollmentDate: '2024-09-10',
  },
  {
    firstName: 'Liam',
    lastName: "O'Connor",
    email: 'liam.oc@university.edu',
    rollNumber: 'MATH-2024-007',
    course: 'Applied Mathematics',
    age: 23,
    enrollmentDate: '2024-08-30',
  },
  {
    firstName: 'Elena',
    lastName: 'Rostova',
    email: 'elena.r@university.edu',
    rollNumber: 'BIO-2024-033',
    course: 'Biotechnology',
    age: 19,
    enrollmentDate: '2024-09-15',
  },
];

/**
 * Initialize Firebase Admin SDK and ensure Firestore connection.
 * If no external Firestore emulator is running and no cloud credentials exist,
 * automatically starts an in-process local Firestore gRPC emulator on port 8088.
 */
export async function initFirestore(): Promise<Firestore> {
  if (firestoreInstance) {
    return firestoreInstance;
  }
  if (initPromise) {
    return initPromise;
  }

  initPromise = (async () => {
    const emulatorPort = DEFAULT_EMULATOR_PORT;

    // Start local Firestore gRPC emulator if not disabled
    if (process.env.USE_CLOUD_FIRESTORE !== 'true') {
      const alreadyListening = await isPortListening(emulatorPort);
      if (!alreadyListening) {
        try {
          const { FirestoreServer } = await import('@firestore-emulator/server');
          if (!emulatorServer) {
            emulatorServer = new FirestoreServer();
            await emulatorServer.start(emulatorPort);
            console.log(`[Firestore] Local Firestore gRPC emulator active on port ${emulatorPort}`);
          }
        } catch (err: any) {
          if (err?.message?.includes('EADDRINUSE')) {
            console.log(`[Firestore] Emulator already listening on port ${emulatorPort}`);
          } else {
            console.warn('[Firestore] Emulator startup notice:', err?.message || err);
          }
        }
      }
      process.env.FIRESTORE_EMULATOR_HOST = `127.0.0.1:${emulatorPort}`;
    }

    if (getApps().length === 0) {
      firebaseAdminApp = initializeApp({
        projectId:
          process.env.GOOGLE_CLOUD_PROJECT ||
          process.env.GCLOUD_PROJECT ||
          process.env.FIREBASE_PROJECT_ID ||
          'student-management-system',
      });
    } else {
      firebaseAdminApp = getApps()[0]!;
    }

    firestoreInstance = getFirestore(firebaseAdminApp);

    // Auto-seed initial students if collection is empty
    try {
      const col = firestoreInstance.collection('students');
      const existing = await col.limit(1).get();
      if (existing.empty) {
        console.log('[Firestore] Seeding initial student documents...');
        for (const s of DEFAULT_SAMPLE_STUDENTS) {
          await col.add(s);
        }
        console.log(
          `[Firestore] Successfully seeded ${DEFAULT_SAMPLE_STUDENTS.length} students into collection 'students'.`
        );
      }
    } catch (seedErr: any) {
      console.warn('[Firestore] Seeding notice:', seedErr?.message || seedErr);
    }

    return firestoreInstance;
  })();

  return initPromise;
}

/**
 * Helper to get the typed 'students' Firestore collection
 */
export async function getStudentsCollection(): Promise<CollectionReference<DocumentData>> {
  const db = await initFirestore();
  return db.collection('students');
}

/**
 * Proxy export for backwards compatibility
 */
export const firestore = new Proxy({} as Firestore, {
  get(_target, prop) {
    if (!firestoreInstance) {
      if (!process.env.FIRESTORE_EMULATOR_HOST && process.env.USE_CLOUD_FIRESTORE !== 'true') {
        process.env.FIRESTORE_EMULATOR_HOST = `127.0.0.1:${DEFAULT_EMULATOR_PORT}`;
      }
      const app =
        getApps().length === 0
          ? initializeApp({
              projectId:
                process.env.GOOGLE_CLOUD_PROJECT ||
                process.env.GCLOUD_PROJECT ||
                process.env.FIREBASE_PROJECT_ID ||
                'student-management-system',
            })
          : getApps()[0]!;
      firestoreInstance = getFirestore(app);
    }
    const val = (firestoreInstance as any)[prop];
    return typeof val === 'function' ? val.bind(firestoreInstance) : val;
  },
});

/**
 * Student Repository - Pure Firestore Database Service
 * Provides full server-side CRUD and query operations via Firebase Admin SDK
 */
export const studentRepository = {
  /**
   * List all students from Firestore, with optional case-insensitive search filter
   */
  async getAll(search?: string): Promise<Student[]> {
    const studentsCollection = await getStudentsCollection();
    const snapshot = await studentsCollection.get();
    let students: Student[] = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as StudentInput),
    }));

    if (search && search.trim() !== '') {
      const query = search.trim().toLowerCase();
      students = students.filter((s) => {
        const fullName = `${s.firstName} ${s.lastName}`.toLowerCase();
        return (
          fullName.includes(query) ||
          s.firstName.toLowerCase().includes(query) ||
          s.lastName.toLowerCase().includes(query) ||
          s.rollNumber.toLowerCase().includes(query) ||
          s.course.toLowerCase().includes(query) ||
          s.email.toLowerCase().includes(query)
        );
      });
    }

    return students;
  },

  /**
   * Get a single student by Firestore document ID
   */
  async getById(id: string): Promise<Student | null> {
    const studentsCollection = await getStudentsCollection();
    const doc = await studentsCollection.doc(id).get();
    if (!doc.exists) {
      return null;
    }
    return {
      id: doc.id,
      ...(doc.data() as StudentInput),
    };
  },

  /**
   * Check for duplicate email or rollNumber across the Firestore collection
   */
  async checkDuplicates(
    email: string,
    rollNumber: string,
    excludeId?: string
  ): Promise<{ emailTaken: boolean; rollNumberTaken: boolean }> {
    const studentsCollection = await getStudentsCollection();
    const cleanEmail = email.trim().toLowerCase();
    const cleanRollNumber = rollNumber.trim();

    // Query Firestore for matching email
    const emailQuery = await studentsCollection.where('email', '==', cleanEmail).get();
    // Query Firestore for matching rollNumber
    const rollQuery = await studentsCollection.where('rollNumber', '==', cleanRollNumber).get();

    const emailMatches = emailQuery.docs.filter((d) => !excludeId || d.id !== excludeId);
    const rollMatches = rollQuery.docs.filter((d) => !excludeId || d.id !== excludeId);

    return {
      emailTaken: emailMatches.length > 0,
      rollNumberTaken: rollMatches.length > 0,
    };
  },

  /**
   * Create a new student record in Firestore
   */
  async create(data: StudentInput): Promise<Student> {
    const studentsCollection = await getStudentsCollection();
    const cleanData: StudentInput = {
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      email: data.email.trim().toLowerCase(),
      rollNumber: data.rollNumber.trim(),
      course: data.course.trim(),
      age: Number(data.age),
      enrollmentDate: data.enrollmentDate.trim(),
    };

    const docRef = await studentsCollection.add(cleanData);
    return {
      id: docRef.id,
      ...cleanData,
    };
  },

  /**
   * Update an existing student record in Firestore (full update)
   */
  async update(id: string, data: StudentInput): Promise<Student | null> {
    const studentsCollection = await getStudentsCollection();
    const docRef = studentsCollection.doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return null;
    }

    const cleanData: StudentInput = {
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      email: data.email.trim().toLowerCase(),
      rollNumber: data.rollNumber.trim(),
      course: data.course.trim(),
      age: Number(data.age),
      enrollmentDate: data.enrollmentDate.trim(),
    };

    await docRef.set(cleanData);
    return {
      id,
      ...cleanData,
    };
  },

  /**
   * Delete a student record by Firestore document ID
   */
  async delete(id: string): Promise<boolean> {
    const studentsCollection = await getStudentsCollection();
    const docRef = studentsCollection.doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return false;
    }

    await docRef.delete();
    return true;
  },
};

