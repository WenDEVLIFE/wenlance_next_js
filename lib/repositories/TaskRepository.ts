import {
  collection,
  onSnapshot,
  query,
  orderBy,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore';
import { db, auth } from '../utils/firebase';
import { TaskModel, taskFromFirestore, taskToFirestore } from '../../app/model/TaskModel';
import { onAuthStateChanged } from 'firebase/auth';

class TaskRepository {
  private getCollection(userId: string) {
    return collection(db, 'users', userId, 'tasks');
  }

  listenToTasks(callback: (tasks: TaskModel[]) => void): () => void {
    let unsubscribeSnapshot: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (unsubscribeSnapshot) {
        unsubscribeSnapshot();
        unsubscribeSnapshot = null;
      }

      if (user) {
        const q = query(this.getCollection(user.uid), orderBy('createdAt', 'desc'));
        unsubscribeSnapshot = onSnapshot(q, (snapshot) => {
          const tasks = snapshot.docs.map(doc => taskFromFirestore(doc.id, doc.data()));
          callback(tasks);
        }, (error) => {
          console.error("Error listening to tasks:", error);
        });
      } else {
        callback([]);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeSnapshot) {
        unsubscribeSnapshot();
      }
    };
  }

  async addTask(task: TaskModel): Promise<string> {
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated");

    const data = {
      ...taskToFirestore(task),
      created_at: serverTimestamp(),
    };

    const docRef = await addDoc(this.getCollection(user.uid), data);
    return docRef.id;
  }

  async updateTask(task: TaskModel): Promise<void> {
    const user = auth.currentUser;
    if (!user || !task.id) throw new Error("Invalid request");

    const docRef = doc(db, 'users', user.uid, 'tasks', task.id);
    const data = {
      ...taskToFirestore(task),
      updated_at: serverTimestamp(),
    };

    await updateDoc(docRef, data);
  }

  async deleteTask(id: string): Promise<void> {
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated");

    const docRef = doc(db, 'users', user.uid, 'tasks', id);
    await deleteDoc(docRef);
  }
}

export const taskRepository = new TaskRepository();
export default taskRepository;
