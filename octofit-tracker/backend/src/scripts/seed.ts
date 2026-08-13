import mongoose from 'mongoose';
import { Activity, Leaderboard, Team, User, Workout } from '../models/index.js';

const connectionString = process.env.MONGODB_URI || 'mongodb://localhost:27017/octofit_db';

/**
 * Seed the octofit_db database with test data
 */
async function seedDatabase() {
  try {
    await mongoose.connect(connectionString);
    console.log('Connected to octofit_db');

    await User.deleteMany({});
    await Team.deleteMany({});
    await Activity.deleteMany({});
    await Leaderboard.deleteMany({});
    await Workout.deleteMany({});

    const teams = await Team.insertMany([
      { name: 'Trail Blazers', coach: 'Coach Wilson', wins: 6 },
      { name: 'Velocity Squad', coach: 'Coach Jordan', wins: 8 },
      { name: 'Summit Striders', coach: 'Coach Nguyen', wins: 4 },
    ]);

    const teamByName = new Map(teams.map((team) => [team.name, team._id]));

    const users = await User.insertMany([
      { name: 'Ava Patel', email: 'ava.patel@octofit.io', level: 'Intermediate', points: 1200, teamId: teamByName.get('Trail Blazers') },
      { name: 'Leo Martinez', email: 'leo.martinez@octofit.io', level: 'Advanced', points: 1500, teamId: teamByName.get('Velocity Squad') },
      { name: 'Mia Chen', email: 'mia.chen@octofit.io', level: 'Beginner', points: 900, teamId: teamByName.get('Trail Blazers') },
      { name: 'Noah Brown', email: 'noah.brown@octofit.io', level: 'Advanced', points: 1700, teamId: teamByName.get('Summit Striders') },
      { name: 'Sofia Nguyen', email: 'sofia.nguyen@octofit.io', level: 'Intermediate', points: 1300, teamId: teamByName.get('Velocity Squad') },
    ]);

    await Activity.insertMany([
      { userId: users[0]._id, type: 'run', durationMinutes: 32, distanceKm: 5.2, caloriesBurned: 360 },
      { userId: users[1]._id, type: 'strength', durationMinutes: 45, caloriesBurned: 420 },
      { userId: users[2]._id, type: 'walk', durationMinutes: 24, distanceKm: 3.6, caloriesBurned: 190 },
      { userId: users[3]._id, type: 'cycling', durationMinutes: 50, distanceKm: 18.2, caloriesBurned: 540 },
    ]);

    const workouts = await Workout.insertMany([
      {
        title: 'Neighborhood Run',
        type: 'cardio',
        difficulty: 'beginner',
        durationMinutes: 20,
        description: 'A friendly 20-minute run with a steady pace and warm-up routine.',
      },
      {
        title: 'Core Circuit',
        type: 'strength',
        difficulty: 'intermediate',
        durationMinutes: 30,
        description: 'Build strength using bodyweight and resistance exercises for stamina and posture.',
      },
      {
        title: 'Mobility Reset',
        type: 'mobility',
        difficulty: 'beginner',
        durationMinutes: 15,
        description: 'Short mobility work focused on ankles, hips, and shoulders for recovery.',
      },
    ]);

    const leaderboardEntries = users
      .map((user) => ({
        userId: user._id,
        name: user.name,
        points: user.points,
        team: teams.find((team) => team._id.toString() === user.teamId?.toString())?.name ?? 'Unassigned',
        rank: 0,
      }))
      .sort((left, right) => right.points - left.points)
      .map((entry, index) => ({ ...entry, rank: index + 1 }));

    await Leaderboard.insertMany(leaderboardEntries);

    console.log(
      `Seeded ${teams.length} teams, ${users.length} users, ${workouts.length} workouts, and leaderboard entries successfully.`,
    );
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
