import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  Timestamp
} from 'firebase/firestore';
import { db } from '../utils/firebase';
import { ProjectModel, projectFromFirestore, projectToFirestore } from '../../app/model/ProjectModel';

class ProjectRepository {
  private collectionName = 'projects';

  /**
   * Fetches all projects from Firestore, ordered by start date.
   */
  async getAllProjects(): Promise<ProjectModel[]> {
    try {
      const q = query(collection(db, this.collectionName), orderBy('startDate', 'desc'));
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map(doc => projectFromFirestore(doc.id, doc.data()));
    } catch (error) {
      console.error("Error fetching projects:", error);
      throw error;
    }
  }

  /**
   * Fetches a single project by ID.
   */
  async getProjectById(id: string): Promise<ProjectModel | null> {
    try {
      const docRef = doc(db, this.collectionName, id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return projectFromFirestore(docSnap.id, docSnap.data());
      }
      return null;
    } catch (error) {
      console.error("Error fetching project:", error);
      throw error;
    }
  }

  /**
   * Adds a new project to Firestore.
   */
  async addProject(project: ProjectModel): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, this.collectionName), projectToFirestore(project));
      return docRef.id;
    } catch (error) {
      console.error("Error adding project:", error);
      throw error;
    }
  }

  /**
   * Updates an existing project.
   */
  async updateProject(id: string, project: Partial<ProjectModel>): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, id);
      const dataToUpdate: Record<string, any> = {};

      if (project.projectName) dataToUpdate.projectName = project.projectName;
      if (project.status) dataToUpdate.status = project.status;
      if (project.techStacks) dataToUpdate.techStacks = project.techStacks;
      if (project.startDate) dataToUpdate.startDate = Timestamp.fromDate(project.startDate);
      if (project.expectedEndDate) dataToUpdate.expectedEndDate = Timestamp.fromDate(project.expectedEndDate);

      await updateDoc(docRef, dataToUpdate);
    } catch (error) {
      console.error("Error updating project:", error);
      throw error;
    }
  }

  /**
   * Deletes a project.
   */
  async deleteProject(id: string): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error("Error deleting project:", error);
      throw error;
    }
  }
}

export const projectRepository = new ProjectRepository();
export default projectRepository;
