import { EventEmitter } from 'events';
import { db } from './db.js';
import { logToFile } from './logger.js';

const emitter = new EventEmitter();

async function createNotification({ recipient_id, type, actor_id, payload }) {
  try {
    await db('notifications').insert({
      recipient_id,
      type,
      actor_id,
      payload: JSON.stringify(payload)
    });
  } catch (err) {
    logToFile(`ERROR: Failed to create notification: ${err.message}`);
  }
}

emitter.on('ProjectCreated', async ({ projectId, projectTitle, creatorId }) => {
  logToFile(`EVENT: ProjectCreated - ID: ${projectId}, Title: "${projectTitle}", Creator ID: ${creatorId}`);
  await createNotification({
    recipient_id: creatorId,
    type: 'project_created',
    actor_id: creatorId,
    payload: { projectId, projectTitle },
  });
});

emitter.on('ProjectLiked', async ({ projectId, projectTitle, likerId, likerName, ownerId }) => {
  logToFile(`EVENT: ProjectLiked - ID: ${projectId}, Title: "${projectTitle}", Liker ID: ${likerId}, Owner ID: ${ownerId}`);
  if (likerId === ownerId) return;

  await createNotification({
    recipient_id: ownerId,
    type: 'project_liked',
    actor_id: likerId,
    payload: { projectId, projectTitle, likerName },
  });
});

emitter.on('StudentFollowed', async ({ followerId, followerName, studentId }) => {
  logToFile(`EVENT: StudentFollowed - Student ID: ${studentId}, Follower ID: ${followerId}`);
  await createNotification({
    recipient_id: studentId,
    type: 'student_followed',
    actor_id: followerId,
    payload: { followerName },
  });
});

emitter.on('ProjectApproved', async ({ projectId, projectTitle, studentId }) => {
  logToFile(`EVENT: ProjectApproved - ID: ${projectId}, Title: "${projectTitle}", Student ID: ${studentId}`);
  await createNotification({
    recipient_id: studentId,
    type: 'project_approved',
    actor_id: 1,
    payload: { projectId, projectTitle },
  });
});

export default emitter;
