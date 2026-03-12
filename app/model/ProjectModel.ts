import { Timestamp } from 'firebase/firestore';

export interface ProjectModel {
  id?: string;
  projectName: string;
  techStacks: string[];
  status: string;
  startDate: Date;
  expectedEndDate: Date;
}

/**
 * Factory function to create a new ProjectModel with default values.
 */
export const createProjectModel = (params: Partial<ProjectModel> & { projectName: string }): ProjectModel => {
  const { projectName, ...others } = params;
  return {
    projectName,
    expectedEndDate: new Date(Date.now() + 86400 * 30 * 1000), // 30 days later
    ...others,
    techStacks: others.techStacks ?? [],
    status: others.status ?? "Planning",
    startDate: others.startDate ?? new Date(),
  };
};

/**
 * Converts Firestore data to a ProjectModel.
 */
export const projectFromFirestore = (documentId: string, data: Record<string, any>): ProjectModel => {
  const projectName = data.projectName || data.name || "";
  const status = data.status || "Planning";
  const techStacks = data.techStacks || [];

  let startDate: Date;
  if (data.startDate instanceof Timestamp) {
    startDate = data.startDate.toDate();
  } else if (data.startDate?.seconds) {
    startDate = new Date(data.startDate.seconds * 1000);
  } else {
    startDate = new Date();
  }

  let expectedEndDate: Date;
  if (data.expectedEndDate instanceof Timestamp) {
    expectedEndDate = data.expectedEndDate.toDate();
  } else if (data.expectedEndDate?.seconds) {
    expectedEndDate = new Date(data.expectedEndDate.seconds * 1000);
  } else {
    expectedEndDate = new Date(Date.now() + 86400 * 30 * 1000);
  }

  return {
    id: documentId,
    projectName,
    status,
    techStacks,
    startDate,
    expectedEndDate,
  };
};

/**
 * Converts a ProjectModel to a Firestore-compatible object.
 */
export const projectToFirestore = (project: ProjectModel): Record<string, any> => {
  return {
    projectName: project.projectName,
    techStacks: project.techStacks,
    status: project.status,
    startDate: Timestamp.fromDate(project.startDate),
    expectedEndDate: Timestamp.fromDate(project.expectedEndDate),
  };
};
