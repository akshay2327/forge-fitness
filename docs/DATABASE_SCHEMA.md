# FORGE Fitness — Database Schema

## Collections Overview

```
forge_fitness (database)
├── users
├── assessments
├── dietplans
├── workoutplans
├── progresslogs
└── (future: notifications, exercises, fooditems)
```

---

## users

```js
{
  _id: ObjectId,
  memberId: "FRG-2024-0042",       // auto-generated unique ID
  fullName: "Arjun Kumar",
  email: "arjun@example.com",       // unique, lowercase
  password: "$2b$12$...",           // bcrypt hash, never returned in queries
  avatar: "https://res.cloudinary.com/...",
  phone: "+91 98765 43210",
  googleId: "10238...",             // null for credentials users
  role: "member",                   // "member" | "admin" | "trainer"
  provider: "credentials",          // "credentials" | "google"
  isActive: true,
  isEmailVerified: false,
  emailVerifyToken: "sha256hash",   // select: false
  passwordResetToken: "sha256hash", // select: false
  passwordResetExpiry: ISODate,     // select: false
  lastLogin: ISODate,
  membership: {
    plan: "pro",                    // "free" | "standard" | "pro" | "elite"
    status: "active",               // "active" | "expired" | "cancelled"
    startDate: ISODate,
    endDate: ISODate,
    razorpayPaymentId: "pay_xxx"
  },
  assignedTrainer: ObjectId,        // ref: users (trainer)
  createdAt: ISODate,
  updatedAt: ISODate
}
```

**Indexes:** `email` (unique), `memberId` (unique), `role`, `membership.status`

---

## assessments

One document per assessment snapshot. Members can have multiple (initial + updates).

```js
{
  _id: ObjectId,
  userId: ObjectId,               // ref: users

  // Personal
  age: 26,
  gender: "male",                 // "male" | "female" | "other"

  // Body
  weight: 72.0,                   // kg
  height: 176,                    // cm
  bmi: 23.4,                      // auto-calculated on save
  bmiCategory: "Normal",          // auto-set
  bodyFatPercent: 18,

  measurements: {
    chest: 96, waist: 82, hips: 95,
    bicep: 36, thigh: 55, calf: 38
  },

  // Goals
  fitnessGoal: "muscle-gain",     // "fat-loss" | "muscle-gain" | "maintenance" | "strength" | "endurance"
  targetWeight: 75,

  // Lifestyle
  activityLevel: "active",        // "sedentary" | "light" | "moderate" | "active" | "very-active"
  dietPreference: "non-veg",      // "veg" | "non-veg" | "vegan" | "eggetarian"
  sleepHours: 7,
  waterIntakeLiters: 3.5,
  medicalConditions: "mild lower back pain",
  allergies: ["peanuts"],

  // Calculated (auto on save)
  tdee: 2850,                     // Total Daily Energy Expenditure
  targetCalories: 3150,           // tdee + goal adjustment
  proteinTarget: 144,             // grams
  carbTarget: 350,
  fatTarget: 88,

  isInitial: true,                // true = baseline assessment
  takenAt: ISODate,
  notes: "Starting program",
  createdAt: ISODate,
  updatedAt: ISODate
}
```

**Indexes:** `{ userId, takenAt: -1 }`

---

## dietplans

```js
{
  _id: ObjectId,
  userId: ObjectId,
  assessmentId: ObjectId,
  createdBy: ObjectId,            // trainer/admin who created

  title: "Muscle Gain — Non-Veg Plan",
  goal: "muscle-gain",
  dietPreference: "non-veg",
  targetCalories: 3150,
  targetProtein: 144,
  targetCarbs: 350,
  targetFat: 88,

  meals: [
    {
      type: "breakfast",          // "breakfast"|"mid-morning"|"lunch"|"evening-snack"|"dinner"|"pre-workout"|"post-workout"
      time: "7:30 AM",
      items: [
        {
          name: "Oats with Milk",
          quantity: "80g oats + 200ml milk",
          calories: 320,
          protein: 18,
          carbs: 58,
          fat: 9,
          notes: "Use full-fat milk"
        }
      ],
      totalCalories: 560,         // auto-summed
      totalProtein: 38,
      totalCarbs: 88,
      totalFat: 23
    }
  ],

  hydrationLiters: 4,
  supplements: ["Whey Protein", "Creatine 5g", "Vitamin D3"],
  notes: "Avoid processed sugar. Eat within 30 min post-workout.",
  isActive: true,
  validFrom: ISODate,
  validUntil: ISODate,
  createdAt: ISODate,
  updatedAt: ISODate
}
```

**Indexes:** `{ userId, isActive }`, `{ userId, createdAt: -1 }`

---

## workoutplans

```js
{
  _id: ObjectId,
  userId: ObjectId,
  createdBy: ObjectId,

  title: "PPL Hypertrophy — 6 Day",
  program: "Push Pull Legs",
  goal: "muscle-gain",
  level: "intermediate",          // "beginner" | "intermediate" | "advanced"
  durationWeeks: 12,
  currentWeek: 3,

  days: [
    {
      dayOfWeek: 1,               // 0=Sun, 1=Mon, ..., 6=Sat
      name: "Push Day A",
      type: "strength",           // "strength"|"cardio"|"hiit"|"mobility"|"rest"
      durationMinutes: 70,
      caloriesBurned: 420,
      exercises: [
        {
          name: "Barbell Bench Press",
          sets: 4,
          reps: "6-8",
          weight: "80kg",
          restSeconds: 180,
          videoUrl: "https://...",
          notes: "Keep shoulder blades retracted"
        }
      ],
      notes: "Focus on mind-muscle connection"
    }
  ],

  isActive: true,
  startDate: ISODate,
  endDate: ISODate,
  notes: "Deload week 4, 8, 12",
  createdAt: ISODate,
  updatedAt: ISODate
}
```

---

## progresslogs

One document per check-in. Members log weekly (or more often).

```js
{
  _id: ObjectId,
  userId: ObjectId,
  weight: 72.0,                   // kg — required
  bodyFatPercent: 18,
  measurements: {
    chest: 96, waist: 82, hips: 95,
    bicep: 36, thigh: 55, calf: 38
  },
  photos: {
    front: "https://res.cloudinary.com/...",
    back: "https://res.cloudinary.com/...",
    side: "https://res.cloudinary.com/..."
  },
  mood: 4,                        // 1-5
  energyLevel: 4,                 // 1-5
  sleepHours: 7.5,
  waterIntakeLiters: 3.8,
  caloriesConsumed: 3050,
  notes: "Feeling stronger. Bench PR at 90kg.",
  loggedAt: ISODate,
  createdAt: ISODate,
  updatedAt: ISODate
}
```

**Indexes:** `{ userId, loggedAt: -1 }`

---

## MongoDB Atlas — Recommended Settings

### Free M0 Cluster
- Region: **Mumbai (ap-south-1)** — lowest latency for India
- Backups: Not included in free tier (upgrade to M2+ for backups)
- Storage: 512MB (enough for ~50,000 members)

### Atlas Search Index (for admin member search)
Create a search index on `users` collection:
```json
{
  "mappings": {
    "fields": {
      "fullName": [{ "type": "string", "analyzer": "lucene.standard" }],
      "email":    [{ "type": "string", "analyzer": "lucene.standard" }],
      "memberId": [{ "type": "string" }]
    }
  }
}
```

### Database User Permissions
Create a dedicated user with least-privilege:
- Role: `readWrite` on `forge_fitness` database only
- Do NOT use Atlas admin credentials in your app
