import { formationTeacherService } from '../../services/formationTeacher.service';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const teachers = await formationTeacherService.getAvailableTeachers();
    return res.status(200).json({ success: true, data: teachers });
  } catch (error) {
    console.error('Test API Error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
} 