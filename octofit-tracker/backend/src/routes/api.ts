import { Router, type Request, type Response } from 'express';
import mongoose from 'mongoose';
import { Activity, Team, User, Workout } from '../models/index.js';

const router = Router();

const userResponse = (user: any) => ({
  id: user._id.toString(),
  name: user.name,
  email: user.email,
  level: user.level,
  points: user.points,
  teamId: user.teamId ? user.teamId.toString() : undefined,
});

const teamResponse = (team: any) => ({
  id: team._id.toString(),
  name: team.name,
  coach: team.coach,
  wins: team.wins,
});

const activityResponse = (activity: any) => ({
  id: activity._id.toString(),
  userId: activity.userId.toString(),
  type: activity.type,
  durationMinutes: activity.durationMinutes,
  distanceKm: activity.distanceKm,
  caloriesBurned: activity.caloriesBurned,
});

const workoutResponse = (workout: any) => ({
  id: workout._id.toString(),
  title: workout.title,
  type: workout.type,
  difficulty: workout.difficulty,
  durationMinutes: workout.durationMinutes,
  description: workout.description,
});

router.get('/users/', async (_req: Request, res: Response) => {
  try {
    const users = await User.find().sort({ points: -1 });
    res.json(users.map(userResponse));
  } catch (error) {
    res.status(500).json({ message: 'Unable to fetch users', error: (error as Error).message });
  }
});

router.get('/users/:id', async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.json(userResponse(user));
  } catch (error) {
    res.status(500).json({ message: 'Unable to fetch user', error: (error as Error).message });
  }
});

router.post('/users/', async (req: Request, res: Response) => {
  const { name, email, level = 'Beginner', points = 0, teamId } = req.body;

  if (!name || !email) {
    res.status(400).json({ message: 'Name and email are required' });
    return;
  }

  try {
    const normalizedTeamId = teamId ? new mongoose.Types.ObjectId(teamId) : undefined;
    const user = await User.create({ name, email, level, points, teamId: normalizedTeamId });
    res.status(201).json(userResponse(user));
  } catch (error) {
    res.status(400).json({ message: 'Unable to create user', error: (error as Error).message });
  }
});

router.get('/teams/', async (_req: Request, res: Response) => {
  try {
    const teams = await Team.find().sort({ wins: -1 });
    res.json(teams.map(teamResponse));
  } catch (error) {
    res.status(500).json({ message: 'Unable to fetch teams', error: (error as Error).message });
  }
});

router.get('/teams/:id', async (req: Request, res: Response) => {
  try {
    const team = await Team.findById(req.params.id);

    if (!team) {
      res.status(404).json({ message: 'Team not found' });
      return;
    }

    res.json(teamResponse(team));
  } catch (error) {
    res.status(500).json({ message: 'Unable to fetch team', error: (error as Error).message });
  }
});

router.post('/teams/', async (req: Request, res: Response) => {
  const { name, coach, wins = 0 } = req.body;

  if (!name || !coach) {
    res.status(400).json({ message: 'Name and coach are required' });
    return;
  }

  try {
    const team = await Team.create({ name, coach, wins });
    res.status(201).json(teamResponse(team));
  } catch (error) {
    res.status(400).json({ message: 'Unable to create team', error: (error as Error).message });
  }
});

router.get('/activities/', async (_req: Request, res: Response) => {
  try {
    const activities = await Activity.find().sort({ createdAt: -1 });
    res.json(activities.map(activityResponse));
  } catch (error) {
    res.status(500).json({ message: 'Unable to fetch activities', error: (error as Error).message });
  }
});

router.get('/activities/:id', async (req: Request, res: Response) => {
  try {
    const activity = await Activity.findById(req.params.id);

    if (!activity) {
      res.status(404).json({ message: 'Activity not found' });
      return;
    }

    res.json(activityResponse(activity));
  } catch (error) {
    res.status(500).json({ message: 'Unable to fetch activity', error: (error as Error).message });
  }
});

router.post('/activities/', async (req: Request, res: Response) => {
  const { userId, type, durationMinutes, distanceKm, caloriesBurned } = req.body;

  if (!userId || !type || typeof durationMinutes !== 'number' || typeof caloriesBurned !== 'number') {
    res.status(400).json({ message: 'userId, type, durationMinutes, and caloriesBurned are required' });
    return;
  }

  try {
    const activity = await Activity.create({
      userId: new mongoose.Types.ObjectId(userId),
      type,
      durationMinutes,
      distanceKm,
      caloriesBurned,
    });
    res.status(201).json(activityResponse(activity));
  } catch (error) {
    res.status(400).json({ message: 'Unable to create activity', error: (error as Error).message });
  }
});

router.get('/leaderboard/', async (_req: Request, res: Response) => {
  try {
    const users = await User.find().sort({ points: -1 });
    const teams = await Team.find();
    const teamById = new Map(teams.map((team) => [team._id.toString(), team.name]));

    const leaderboard = users.map((user, index) => ({
      userId: user._id.toString(),
      name: user.name,
      points: user.points,
      team: user.teamId ? teamById.get(user.teamId.toString()) ?? 'Unassigned' : 'Unassigned',
      rank: index + 1,
    }));

    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ message: 'Unable to fetch leaderboard', error: (error as Error).message });
  }
});

router.get('/workouts/', async (_req: Request, res: Response) => {
  try {
    const workouts = await Workout.find().sort({ difficulty: 1, durationMinutes: 1 });
    res.json(workouts.map(workoutResponse));
  } catch (error) {
    res.status(500).json({ message: 'Unable to fetch workouts', error: (error as Error).message });
  }
});

router.get('/workouts/:id', async (req: Request, res: Response) => {
  try {
    const workout = await Workout.findById(req.params.id);

    if (!workout) {
      res.status(404).json({ message: 'Workout not found' });
      return;
    }

    res.json(workoutResponse(workout));
  } catch (error) {
    res.status(500).json({ message: 'Unable to fetch workout', error: (error as Error).message });
  }
});

router.post('/workouts/', async (req: Request, res: Response) => {
  const { title, type, difficulty, durationMinutes, description } = req.body;

  if (!title || !type || !difficulty || typeof durationMinutes !== 'number' || !description) {
    res.status(400).json({ message: 'title, type, difficulty, durationMinutes, and description are required' });
    return;
  }

  try {
    const workout = await Workout.create({ title, type, difficulty, durationMinutes, description });
    res.status(201).json(workoutResponse(workout));
  } catch (error) {
    res.status(400).json({ message: 'Unable to create workout', error: (error as Error).message });
  }
});

export default router;
