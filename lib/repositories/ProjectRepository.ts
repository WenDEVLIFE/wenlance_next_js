import { 
  collection, 
  onSnapshot, 
  query, 
  orderBy, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp 
} from 'firebase/firestore';
import { db, auth } from '../utils/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { ProjectModel, projectFromFirestore, projectToFirestore } from '../../app/model/ProjectModel';

class ProjectRepository {
  private getCollection(userId: string) {
    return collection(db, 'users', userId, 'projects');
  }

  /**
   * Listens to real-time updates for projects.
   * @param callback Function called with the updated list of projects.
   * @returns Unsubscribe function to stop listening.
   */
  listenToProjects(callback: (projects: ProjectModel[]) => void): () => void {
    let unsubscribeSnapshot: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      // Clean up previous snapshot listener if it exists
      if (unsubscribeSnapshot) {
        unsubscribeSnapshot();
        unsubscribeSnapshot = null;
      }

      if (user) {
        const q = query(this.getCollection(user.uid));
        unsubscribeSnapshot = onSnapshot(q, (snapshot) => {
          console.log(`Firestore Projects Snapshot: ${snapshot.size} docs`);
          const projects = snapshot.docs.map(doc => projectFromFirestore(doc.id, doc.data()));
          // Sort manually in JS to avoid index requirement for now
          projects.sort((a, b) => b.startDate.getTime() - a.startDate.getTime());
          callback(projects);
        }, (error) => {
          console.error("Error listening to projects:", error);
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

  /**
   * Adds a new project to Firestore.
   */
  async addProject(project: ProjectModel): Promise<string> {
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated");

    const data = {
      ...projectToFirestore(project),
      created_at: serverTimestamp()
    };

    const docRef = await addDoc(this.getCollection(user.uid), data);
    return docRef.id;
  }

  /**
   * Updates an existing project.
   */
  async updateProject(project: ProjectModel): Promise<void> {
    const user = auth.currentUser;
    if (!user || !project.id) throw new Error("Invalid request");

    const docRef = doc(db, 'users', user.uid, 'projects', project.id);
    const data = {
      ...projectToFirestore(project),
      updated_at: serverTimestamp()
    };

    await updateDoc(docRef, data);
  }

  /**
   * Deletes a project.
   */
  async deleteProject(id: string): Promise<void> {
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated");

    const docRef = doc(db, 'users', user.uid, 'projects', id);
    await deleteDoc(docRef);
  }
}

export const projectRepository = new ProjectRepository();
export default projectRepository;
